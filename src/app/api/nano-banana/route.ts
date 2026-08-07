import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const maxDuration = 60;

type InlineImage = { mimeType: string; data: string };

type RequestBody = {
  action: 'generate' | 'describe' | 'expand';
  prompt?: string;
  json?: string;
  images?: InlineImage[];
  model?: string;
};

const DEFAULT_MODEL = 'gemini-2.5-flash-image';
const DESCRIBE_MODEL = 'gemini-2.5-flash';
/** Current Claude Sonnet for Expand — do not use retired IDs like claude-3-7-sonnet-20250219. */
const EXPAND_MODEL_DEFAULT = 'claude-sonnet-4-6';

/** Map retired / deprecated Claude IDs (often left in MODEL for Task Master) to a live model. */
const RETIRED_CLAUDE_MODELS: Record<string, string> = {
  'claude-3-7-sonnet-20250219': EXPAND_MODEL_DEFAULT,
  'claude-3-7-sonnet-latest': EXPAND_MODEL_DEFAULT,
  'claude-3-5-sonnet-20241022': EXPAND_MODEL_DEFAULT,
  'claude-3-5-sonnet-20240620': EXPAND_MODEL_DEFAULT,
  'claude-3-5-sonnet-latest': EXPAND_MODEL_DEFAULT,
  'claude-sonnet-4-20250514': EXPAND_MODEL_DEFAULT,
  'claude-3-opus-20240229': EXPAND_MODEL_DEFAULT,
};

/** Anthropic rejects images over 10 MB; stay under with headroom. */
const ANTHROPIC_SAFE_IMAGE_BYTES = 8 * 1024 * 1024;

/**
 * Shrink oversized reference images so Expand can send visual context to Claude.
 * Returns null if compression still cannot get under the safe limit (caller skips image).
 */
async function shrinkImageForAnthropic(img: InlineImage): Promise<{
  image: InlineImage | null;
  originalBytes: number;
  finalBytes: number;
  compressed: boolean;
}> {
  const buf = Buffer.from(img.data, 'base64');
  const originalBytes = buf.length;
  if (originalBytes <= ANTHROPIC_SAFE_IMAGE_BYTES) {
    return { image: img, originalBytes, finalBytes: originalBytes, compressed: false };
  }

  let width = 2048;
  let quality = 78;
  for (let attempt = 0; attempt < 8; attempt++) {
    const out = await sharp(buf)
      .rotate()
      .resize({ width, height: width, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    if (out.length <= ANTHROPIC_SAFE_IMAGE_BYTES) {
      return {
        image: { mimeType: 'image/jpeg', data: out.toString('base64') },
        originalBytes,
        finalBytes: out.length,
        compressed: true,
      };
    }
    width = Math.max(640, Math.floor(width * 0.7));
    quality = Math.max(45, quality - 8);
  }

  return { image: null, originalBytes, finalBytes: originalBytes, compressed: false };
}

/**
 * Describe returns BOTH:
 * - prompt: natural-language recreation / edit brief (paste into Higgsfield, Nano Banana, etc.)
 * - json: structured fields for parameterized templates
 */
const DESCRIBE_INSTRUCTIONS = `Analyze the attached image carefully (layout, text labels, logos, people, colors, and sections).

Return ONLY a single JSON object (no markdown fences, no prose outside JSON) with this exact shape:
{
  "prompt": string,
  "subject": string,
  "setting": string,
  "style": string,
  "lighting": string,
  "camera_angle": string,
  "mood": string,
  "color_palette": string,
  "composition": string,
  "notable_elements": string[],
  "visible_text": string[]
}

Rules for "prompt":
- Write a clear, detailed natural-language description of the FULL poster/image so another AI image tool (e.g. Higgsfield) can recreate or edit it from text + the reference image.
- Include layout regions (top / middle / bottom), important labels, logos, and relative positions.
- Prefer imperative edit-ready wording when useful (e.g. "Keep the entire poster identical except…").
- Do NOT invent text that is not visible; quote visible labels accurately in visible_text.
- Keep "prompt" as a single continuous paragraph or short multi-sentence block (not nested JSON).`;

const EXPAND_INSTRUCTIONS = `You turn a short user image-edit request into a DETAILED, production-ready Higgsfield / image-edit prompt.

Return ONLY a single JSON object (no markdown fences) with this shape:
{
  "prompt": string,
  "json": object,
  "negative": string
}

Rules for "prompt":
- Expand the user's short request into a long, precise edit brief similar to professional compositor instructions.
- Use clear sections when useful: KEEP UNCHANGED, REPLACE / CHANGE, OUTPUT / CONSTRAINTS.
- Name visible elements (logos, people, text labels, divider bands) when the user or image context implies them.
- Explicitly forbid cropping, truncation, lost text, blur, watermarks, and unwanted layout changes.
- If the user mentions attaching a second image as a replacement panel, require full-width span and no loss of that panel's content.
- Do NOT invent unrelated subjects (no lighthouse, no random scenes).
- "prompt" must be the full paste-ready Higgsfield text (multi-paragraph OK).

Rules for "json":
- Flat object with helpful keys such as subject, setting, style, modifications, preserve, reference_images, negative_prompt.
- Match the expanded edit intent (not an unrelated preset).

Rules for "negative":
- Short comma-separated avoid list aligned with the edit.`;

function buildGeminiParts(body: RequestBody) {
  const parts: Array<Record<string, unknown>> = [];
  const text =
    body.action === 'describe'
      ? DESCRIBE_INSTRUCTIONS
      : [body.prompt ?? '', body.json ? `\n\nJSON specification:\n${body.json}` : ''].join('').trim();

  if (text) parts.push({ text });
  for (const img of body.images ?? []) {
    parts.push({ inline_data: { mime_type: img.mimeType, data: img.data } });
  }
  return parts;
}

function resolveClaudeModel(): string {
  // Prefer Expand-specific env; generic MODEL is often Task Master's retired Claude 3.7 ID.
  const raw = (
    process.env.NANO_BANANA_EXPAND_MODEL ||
    process.env.ANTHROPIC_EXPAND_MODEL ||
    process.env.MODEL ||
    EXPAND_MODEL_DEFAULT
  ).trim();
  const first = raw.split(/\s+#/)[0]?.trim() || EXPAND_MODEL_DEFAULT;
  if (!first.toLowerCase().includes('claude')) return EXPAND_MODEL_DEFAULT;
  return RETIRED_CLAUDE_MODELS[first] ?? first;
}

async function expandWithAnthropic(userPrompt: string, images: InlineImage[] = []) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set in .env.local (required for Expand to effective prompt)');
  }

  const client = new Anthropic({ apiKey });
  const model = resolveClaudeModel();

  const content: Anthropic.MessageCreateParams['messages'][0]['content'] = [];
  let imageNote = '';

  // Optional visual context — compress if over Anthropic's 10 MB image limit
  if (images[0]?.data) {
    const shrunk = await shrinkImageForAnthropic(images[0]);
    if (shrunk.image) {
      const mediaType = (shrunk.image.mimeType || 'image/jpeg') as
        | 'image/png'
        | 'image/jpeg'
        | 'image/webp'
        | 'image/gif';
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: shrunk.image.data },
      });
      if (shrunk.compressed) {
        imageNote = ` (reference image compressed ${Math.round(shrunk.originalBytes / 1e6)}MB → ${Math.round(shrunk.finalBytes / 1e6)}MB for Claude)`;
      }
    } else {
      imageNote = ` (skipped oversized reference image ~${Math.round(shrunk.originalBytes / 1e6)}MB; expanded from text only)`;
    }
  }

  content.push({
    type: 'text',
    text: `${EXPAND_INSTRUCTIONS}\n\nUser short request:\n${userPrompt.trim()}`,
  });

  const started = Date.now();
  let usedModel = model;
  let message: Anthropic.Message;
  try {
    message = await client.messages.create({
      model: usedModel,
      max_tokens: 4096,
      messages: [{ role: 'user', content }],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const notFound = /not_found_error|model:/i.test(msg);
    if (notFound && usedModel !== EXPAND_MODEL_DEFAULT) {
      usedModel = EXPAND_MODEL_DEFAULT;
      message = await client.messages.create({
        model: usedModel,
        max_tokens: 4096,
        messages: [{ role: 'user', content }],
      });
    } else {
      throw new Error(
        `Claude Expand failed (model=${model}): ${msg}. Set NANO_BANANA_EXPAND_MODEL=claude-sonnet-4-6 in .env.local if MODEL points at a retired Claude ID.`,
      );
    }
  }
  const elapsedMs = Date.now() - started;

  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

  let prompt = '';
  let jsonStr = '';
  let negative = '';
  try {
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(cleaned) as { prompt?: string; json?: unknown; negative?: string };
    prompt = typeof parsed.prompt === 'string' ? parsed.prompt.trim() : '';
    negative = typeof parsed.negative === 'string' ? parsed.negative.trim() : '';
    jsonStr =
      parsed.json && typeof parsed.json === 'object'
        ? JSON.stringify(parsed.json, null, 2)
        : '';
  } catch {
    // If model returned prose only, use as prompt
    prompt = text;
  }

  return { model: usedModel, elapsedMs, prompt, json: jsonStr, negative, text, imageNote };
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body.action !== 'generate' && body.action !== 'describe' && body.action !== 'expand') {
    return NextResponse.json(
      { error: 'action must be "generate" | "describe" | "expand"' },
      { status: 400 },
    );
  }

  // --- Expand short prompt → effective Higgsfield brief (Anthropic / Claude) ---
  if (body.action === 'expand') {
    if (!body.prompt?.trim()) {
      return NextResponse.json({ error: 'prompt is required for expand' }, { status: 400 });
    }
    try {
      const result = await expandWithAnthropic(body.prompt, body.images ?? []);
      if (!result.prompt) {
        return NextResponse.json(
          { error: 'Expand returned empty prompt', detail: result.text, elapsedMs: result.elapsedMs },
          { status: 502 },
        );
      }
      return NextResponse.json({
        action: 'expand',
        provider: 'anthropic',
        model: result.model,
        elapsedMs: result.elapsedMs,
        prompt: result.prompt,
        json: result.json,
        negative: result.negative,
        text: result.text,
        imageNote: result.imageNote,
        images: [],
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: msg }, { status: 502 });
    }
  }

  // --- Generate / Describe (Gemini) ---
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not set in .env.local' },
      { status: 500 },
    );
  }

  if (body.action === 'generate' && !body.prompt?.trim()) {
    return NextResponse.json({ error: 'prompt is required for generate' }, { status: 400 });
  }
  if (body.action === 'describe' && (body.images?.length ?? 0) === 0) {
    return NextResponse.json({ error: 'at least one image is required for describe' }, { status: 400 });
  }

  const model = body.model || (body.action === 'describe' ? DESCRIBE_MODEL : DEFAULT_MODEL);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const payload: Record<string, unknown> = {
    contents: [{ parts: buildGeminiParts(body) }],
  };
  if (body.action === 'generate') {
    payload.generationConfig = { responseModalities: ['IMAGE', 'TEXT'] };
  } else {
    payload.generationConfig = { responseMimeType: 'application/json' };
  }

  const started = Date.now();
  const geminiRes = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(payload),
  });
  const elapsedMs = Date.now() - started;

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    return NextResponse.json(
      { error: `Gemini API error (${geminiRes.status})`, detail: errText, elapsedMs },
      { status: 502 },
    );
  }

  const json = await geminiRes.json();
  const candidateParts: Array<Record<string, unknown>> = json?.candidates?.[0]?.content?.parts ?? [];
  const images: InlineImage[] = [];
  const textChunks: string[] = [];

  for (const part of candidateParts) {
    const inline = (part.inline_data || part.inlineData) as
      | { mime_type?: string; mimeType?: string; data?: string }
      | undefined;
    if (inline?.data) {
      images.push({ mimeType: inline.mime_type ?? inline.mimeType ?? 'image/png', data: inline.data });
    } else if (typeof part.text === 'string') {
      textChunks.push(part.text);
    }
  }

  const text = textChunks.join('\n');

  let describePrompt: string | undefined;
  let describeJson: string | undefined;
  if (body.action === 'describe' && text.trim()) {
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      if (typeof parsed.prompt === 'string' && parsed.prompt.trim()) {
        describePrompt = parsed.prompt.trim();
      }
      const { prompt: _unusedPrompt, ...rest } = parsed;
      void _unusedPrompt;
      describeJson = JSON.stringify(rest, null, 2);
    } catch {
      /* non-JSON */
    }
  }

  return NextResponse.json({
    action: body.action,
    provider: 'gemini',
    model,
    elapsedMs,
    images,
    text,
    ...(body.action === 'describe'
      ? { prompt: describePrompt, json: describeJson ?? text }
      : {}),
  });
}
