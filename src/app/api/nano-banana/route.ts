import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

type InlineImage = { mimeType: string; data: string };

type RequestBody = {
  action: 'generate' | 'describe';
  prompt?: string;
  json?: string;
  images?: InlineImage[];
  model?: string;
};

const DEFAULT_MODEL = 'gemini-2.5-flash-image';
const DESCRIBE_MODEL = 'gemini-2.5-flash';

const DESCRIBE_INSTRUCTIONS = `Analyze the attached image and return ONLY a single JSON object (no prose, no markdown fences) describing it with these keys:
{
  "subject": string,
  "setting": string,
  "style": string,
  "lighting": string,
  "camera_angle": string,
  "mood": string,
  "color_palette": string,
  "composition": string,
  "notable_elements": string[]
}`;

function buildParts(body: RequestBody) {
  const parts: Array<Record<string, unknown>> = [];
  const text = body.action === 'describe'
    ? DESCRIBE_INSTRUCTIONS
    : [body.prompt ?? '', body.json ? `\n\nJSON specification:\n${body.json}` : ''].join('').trim();

  if (text) parts.push({ text });
  for (const img of body.images ?? []) {
    parts.push({ inline_data: { mime_type: img.mimeType, data: img.data } });
  }
  return parts;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not set in .env.local' },
      { status: 500 },
    );
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body.action !== 'generate' && body.action !== 'describe') {
    return NextResponse.json({ error: 'action must be "generate" or "describe"' }, { status: 400 });
  }
  if (body.action === 'generate' && !body.prompt?.trim()) {
    return NextResponse.json({ error: 'prompt is required for generate' }, { status: 400 });
  }
  if (body.action === 'describe' && (body.images?.length ?? 0) === 0) {
    return NextResponse.json({ error: 'at least one image is required for describe' }, { status: 400 });
  }

  const model = body.model
    || (body.action === 'describe' ? DESCRIBE_MODEL : DEFAULT_MODEL);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const payload: Record<string, unknown> = {
    contents: [{ parts: buildParts(body) }],
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
    const inline = (part.inline_data || part.inlineData) as { mime_type?: string; mimeType?: string; data?: string } | undefined;
    if (inline?.data) {
      images.push({ mimeType: inline.mime_type ?? inline.mimeType ?? 'image/png', data: inline.data });
    } else if (typeof part.text === 'string') {
      textChunks.push(part.text);
    }
  }

  return NextResponse.json({
    action: body.action,
    model,
    elapsedMs,
    images,
    text: textChunks.join('\n'),
  });
}
