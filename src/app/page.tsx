'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';

type InlineImage = { mimeType: string; data: string; name: string; dataUrl: string };

type Params = {
  aspectRatio: string;
  dimensions: string;
  style: string;
  lighting: string;
  camera: string;
  mood: string;
  palette: string;
  variations: string;
  subject: string;
  setting: string;
  modifications: string;
  negative: string;
  seed: string;
};

const DEFAULT_PARAMS: Params = {
  aspectRatio: '16:9',
  dimensions: '1920x1080',
  style: 'photorealistic, cinematic',
  lighting: 'golden hour, soft shadows',
  camera: 'wide shot, eye level',
  mood: 'serene, contemplative',
  palette: 'warm dusk tones',
  variations: '1',
  subject: 'a red-and-white striped lighthouse on a wooden pier',
  setting: 'calm coastal evening, distant horizon',
  modifications: 'brighten the sky, add a warm sunset glow, keep the lighthouse structure unchanged',
  negative: 'blurry, low-resolution, extra fingers, distorted geometry, text artifacts',
  seed: '',
};

const DEFAULT_PROMPT = `Produce an image with these specifications.

Subject: {{subject}}
Setting: {{setting}}
Style: {{style}}
Lighting: {{lighting}}
Camera: {{camera}}
Mood: {{mood}}
Color palette: {{palette}}
Aspect ratio: {{aspectRatio}}
Target dimensions: {{dimensions}}
Variations: {{variations}}

Modifications from reference: {{modifications}}

Avoid: {{negative}}

Use the attached reference image(s) as the starting point. Keep the subject's identity intact unless explicitly modified.`;

const DEFAULT_JSON = `{
  "subject": "{{subject}}",
  "setting": "{{setting}}",
  "style": "{{style}}",
  "lighting": "{{lighting}}",
  "camera_angle": "{{camera}}",
  "mood": "{{mood}}",
  "color_palette": "{{palette}}",
  "aspect_ratio": "{{aspectRatio}}",
  "dimensions": "{{dimensions}}",
  "modifications": "{{modifications}}",
  "negative_prompt": "{{negative}}",
  "variations": {{variations}},
  "seed": "{{seed}}"
}`;

function substitute(template: string, tokens: Record<string, string>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, k: string) => tokens[k] ?? '');
}

async function fileToInlineImage(file: File): Promise<InlineImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const base64 = dataUrl.split(',')[1] ?? '';
      resolve({ mimeType: file.type || 'image/png', data: base64, name: file.name, dataUrl });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

type Status =
  | { kind: 'idle' }
  | { kind: 'info'; message: string }
  | { kind: 'success'; message: string }
  | { kind: 'warning'; message: string }
  | { kind: 'error'; message: string };

export default function HomePage() {
  const [images, setImages] = useState<InlineImage[]>([]);
  const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
  const [basePrompt, setBasePrompt] = useState<string>(DEFAULT_PROMPT);
  const [jsonData, setJsonData] = useState<string>(DEFAULT_JSON);
  const [model, setModel] = useState<string>('gemini-2.5-flash-image');
  const [describeStatus, setDescribeStatus] = useState<Status>({ kind: 'idle' });
  const [runStatus, setRunStatus] = useState<Status>({ kind: 'idle' });
  const [resultImages, setResultImages] = useState<InlineImage[]>([]);
  const [resultText, setResultText] = useState<string>('');
  const [copyLabel, setCopyLabel] = useState<{ id: string; label: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const merged = useMemo(() => {
    const tokens = { ...params } as Record<string, string>;
    return {
      prompt: substitute(basePrompt, tokens),
      json: substitute(jsonData, tokens),
    };
  }, [params, basePrompt, jsonData]);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const accepted: InlineImage[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      accepted.push(await fileToInlineImage(file));
    }
    if (accepted.length) setImages(prev => [...prev, ...accepted]);
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    void handleFiles(e.target.files);
    e.target.value = '';
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    void handleFiles(e.dataTransfer?.files ?? null);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const copyText = async (text: string, id: string, originalLabel: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopyLabel({ id, label: '✓ Copied!' });
    setTimeout(() => setCopyLabel(current => (current?.id === id ? null : current)), 1800);
    // originalLabel reference retained for future extension
    void originalLabel;
  };

  const onCopyTemplate = () => {
    const text = `--- PROMPT (TEMPLATE) ---\n${basePrompt}\n\n--- JSON (TEMPLATE) ---\n${jsonData}`;
    void copyText(text, 'template', '📄 Copy template');
  };

  const onCopyMerged = () => {
    const text = `--- PROMPT ---\n${merged.prompt}\n\n--- JSON ---\n${merged.json}`;
    void copyText(text, 'merged', '📋 Copy customized (prompt + JSON)');
  };

  const onDescribe = async () => {
    if (images.length === 0) {
      setDescribeStatus({ kind: 'warning', message: 'Attach at least one image first.' });
      return;
    }
    setDescribeStatus({ kind: 'info', message: '🔍 Describing image…' });
    try {
      const res = await fetch('/api/nano-banana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'describe',
          images: [{ mimeType: images[0].mimeType, data: images[0].data }],
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || payload.detail || `HTTP ${res.status}`);
      const text: string = (payload.text ?? '').trim();
      if (text) {
        setJsonData(text);
        setDescribeStatus({ kind: 'success', message: `✅ JSON filled (${payload.elapsedMs ?? '?'}ms).` });
      } else {
        setDescribeStatus({ kind: 'warning', message: 'Model returned empty text.' });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setDescribeStatus({ kind: 'error', message: `❌ ${msg}` });
    }
  };

  const onRun = async () => {
    if (!merged.prompt.trim()) {
      setRunStatus({ kind: 'warning', message: 'Prompt is empty.' });
      return;
    }
    setRunStatus({ kind: 'info', message: '🍌 Calling Gemini…' });
    setResultImages([]);
    setResultText('');
    try {
      const res = await fetch('/api/nano-banana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          model,
          prompt: merged.prompt,
          json: merged.json,
          images: images.map(i => ({ mimeType: i.mimeType, data: i.data })),
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || payload.detail || `HTTP ${res.status}`);
      const imgs: Array<{ mimeType: string; data: string }> = payload.images ?? [];
      setResultImages(imgs.map((im, idx) => ({
        mimeType: im.mimeType,
        data: im.data,
        name: `result-${idx}`,
        dataUrl: `data:${im.mimeType};base64,${im.data}`,
      })));
      setResultText(payload.text ?? '');
      setRunStatus({
        kind: imgs.length ? 'success' : 'warning',
        message: imgs.length
          ? `✅ Done in ${payload.elapsedMs ?? '?'}ms — ${imgs.length} image(s).`
          : 'Model returned 0 images. Try adjusting the prompt or model.',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setRunStatus({ kind: 'error', message: `❌ ${msg}` });
    }
  };

  // Defer interactive UI until after hydration so browser extensions (e.g. Norton fdprocessedid on
  // buttons/inputs) cannot mismatch server HTML with client DOM.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const setParam = (key: keyof Params, value: string) =>
    setParams(prev => ({ ...prev, [key]: value }));

  if (!mounted) {
    return (
      <main className="nb-main">
        <style jsx>{styles}</style>
        <h1>🍌 Nano Banana Prompt Builder</h1>
        <p className="lede">Loading…</p>
      </main>
    );
  }

  return (
    <main className="nb-main">
      <style jsx>{styles}</style>

      <h1>🍌 Nano Banana Prompt Builder</h1>
      <p className="lede">
        Build a parameterized prompt + JSON for <code>gemini-2.5-flash-image</code> (Nano Banana), attach reference images, and run it via <code>/api/nano-banana</code>.
      </p>

      <div className="toc">
        <h3>On this page</h3>
        <ul>
          <li><a href="#images">1. Reference images</a></li>
          <li><a href="#describe">2. (Optional) Describe image → JSON</a></li>
          <li><a href="#parameters">3. Attributes</a></li>
          <li><a href="#prompt">4. Base prompt + JSON</a></li>
          <li><a href="#preview">5. Preview, copy, and run</a></li>
          <li><a href="#result">6. Result</a></li>
        </ul>
      </div>

      {/* 1. IMAGES */}
      <section id="images" className="section-container usage">
        <div className="section-header usage">🖼️ 1. Reference images</div>
        <p>Drop images here or click to browse. These are sent to the API as <code>inline_data</code> parts.</p>
        <label
          className={`drop-zone${isDragging ? ' dragover' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            onChange={onFileInputChange}
          />
          <div><strong>📤 Drop images or click to select</strong></div>
          <div className="hint-small">PNG, JPG, WEBP, GIF — max ~4 MB each recommended</div>
        </label>
        {images.length > 0 && (
          <div className="thumb-row">
            {images.map((img, i) => (
              <div className="thumb" key={`${img.name}-${i}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={img.name} src={img.dataUrl} />
                <button className="remove" type="button" aria-label="Remove image" onClick={() => removeImage(i)}>×</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. DESCRIBE */}
      <section id="describe" className="section-container">
        <div className="section-header">🔍 2. (Optional) Describe image → JSON</div>
        <p>Uses <code>gemini-2.5-flash</code> to reverse-engineer the first reference image into structured JSON. The result fills the JSON field below.</p>
        <div className="button-row">
          <button className="btn describe" type="button" onClick={onDescribe}>🔍 Describe first image → JSON</button>
        </div>
        <StatusLine status={describeStatus} />
      </section>

      {/* 3. PARAMETERS */}
      <section id="parameters" className="section-container parameters">
        <div className="section-header parameters">⚙️ 3. Attributes</div>
        <p>These fields substitute into <code className="code-highlight">{'{{placeholder}}'}</code> tokens in the base prompt below.</p>

        <Row>
          <Field label="Aspect ratio" htmlFor="p-aspectRatio">
            <select id="p-aspectRatio" value={params.aspectRatio} onChange={(e) => setParam('aspectRatio', e.target.value)}>
              <option value="1:1">1:1 (square)</option>
              <option value="16:9">16:9 (landscape)</option>
              <option value="9:16">9:16 (portrait)</option>
              <option value="4:3">4:3</option>
              <option value="3:4">3:4</option>
              <option value="21:9">21:9 (ultrawide)</option>
            </select>
          </Field>
          <Field label="Output dimensions" hint="(hint only — model picks final size)" htmlFor="p-dimensions">
            <input id="p-dimensions" type="text" value={params.dimensions} onChange={(e) => setParam('dimensions', e.target.value)} placeholder="1920x1080" />
          </Field>
        </Row>

        <Row>
          <Field label="Style" htmlFor="p-style">
            <input id="p-style" type="text" value={params.style} onChange={(e) => setParam('style', e.target.value)} placeholder="photorealistic, cinematic…" />
          </Field>
          <Field label="Lighting" htmlFor="p-lighting">
            <input id="p-lighting" type="text" value={params.lighting} onChange={(e) => setParam('lighting', e.target.value)} placeholder="golden hour, studio softbox…" />
          </Field>
        </Row>

        <Row>
          <Field label="Camera angle" htmlFor="p-camera">
            <input id="p-camera" type="text" value={params.camera} onChange={(e) => setParam('camera', e.target.value)} placeholder="close-up, wide, aerial…" />
          </Field>
          <Field label="Mood / tone" htmlFor="p-mood">
            <input id="p-mood" type="text" value={params.mood} onChange={(e) => setParam('mood', e.target.value)} placeholder="serene, energetic, moody…" />
          </Field>
        </Row>

        <Row>
          <Field label="Color palette" htmlFor="p-palette">
            <input id="p-palette" type="text" value={params.palette} onChange={(e) => setParam('palette', e.target.value)} placeholder="warm, cool, monochrome…" />
          </Field>
          <Field label="Variations" hint="(1–4; guidance only)" htmlFor="p-variations">
            <input id="p-variations" type="number" min={1} max={4} value={params.variations} onChange={(e) => setParam('variations', e.target.value)} />
          </Field>
        </Row>

        <Row single>
          <Field label="Subject" htmlFor="p-subject">
            <input id="p-subject" type="text" value={params.subject} onChange={(e) => setParam('subject', e.target.value)} placeholder="main subject" />
          </Field>
        </Row>

        <Row single>
          <Field label="Setting / background" htmlFor="p-setting">
            <input id="p-setting" type="text" value={params.setting} onChange={(e) => setParam('setting', e.target.value)} placeholder="environment, time of day, location" />
          </Field>
        </Row>

        <Row single>
          <Field label="Modifications from reference" htmlFor="p-modifications">
            <textarea id="p-modifications" value={params.modifications} onChange={(e) => setParam('modifications', e.target.value)} placeholder="what to change vs. the reference image" />
          </Field>
        </Row>

        <Row single>
          <Field label="Negative prompt" hint="(what to avoid)" htmlFor="p-negative">
            <textarea id="p-negative" value={params.negative} onChange={(e) => setParam('negative', e.target.value)} placeholder="avoid …" />
          </Field>
        </Row>

        <Row>
          <Field label="Seed" hint="(optional)" htmlFor="p-seed">
            <input id="p-seed" type="text" value={params.seed} onChange={(e) => setParam('seed', e.target.value)} placeholder="e.g. 42" />
          </Field>
          <Field label="Model" htmlFor="p-model">
            <select id="p-model" value={model} onChange={(e) => setModel(e.target.value)}>
              <option value="gemini-2.5-flash-image">gemini-2.5-flash-image (stable)</option>
              <option value="gemini-2.5-flash-image-preview">gemini-2.5-flash-image-preview</option>
            </select>
          </Field>
        </Row>
      </section>

      {/* 4. PROMPT */}
      <section id="prompt" className="section-container">
        <div className="section-header">📝 4. Base prompt + JSON</div>
        <p>Use <code className="code-highlight">{'{{token}}'}</code> placeholders — e.g. <code className="code-highlight">{'{{subject}}'}</code>, <code className="code-highlight">{'{{aspectRatio}}'}</code>. They are substituted live in the preview. <strong>Replace this default with your real prompt.</strong></p>

        <Row single>
          <Field label="Base prompt template" htmlFor="p-basePrompt">
            <textarea id="p-basePrompt" className="tall" spellCheck={false} value={basePrompt} onChange={(e) => setBasePrompt(e.target.value)} />
          </Field>
        </Row>

        <Row single>
          <Field label="JSON specification" hint="(merged after prompt; fill from Describe or edit freely)" htmlFor="p-jsonData">
            <textarea id="p-jsonData" className="tall" spellCheck={false} value={jsonData} onChange={(e) => setJsonData(e.target.value)} />
          </Field>
        </Row>
      </section>

      {/* 5. PREVIEW */}
      <section id="preview" className="section-container">
        <div className="section-header">👁️ 5. Preview, copy, and run</div>
        <h3>Final prompt + JSON (live)</h3>
        <div className="preview-block">{`--- PROMPT ---\n${merged.prompt}\n\n--- JSON ---\n${merged.json}`}</div>

        <div className="button-row">
          <button className="btn template" type="button" onClick={onCopyTemplate}>
            {copyLabel?.id === 'template' ? copyLabel.label : '📄 Copy template'}
          </button>
          <button className="btn" type="button" onClick={onCopyMerged}>
            {copyLabel?.id === 'merged' ? copyLabel.label : '📋 Copy customized (prompt + JSON)'}
          </button>
          <button className="btn run" type="button" onClick={onRun}>🍌 Run via Nano Banana API</button>
        </div>
        <StatusLine status={runStatus} />
      </section>

      {/* 6. RESULT */}
      <section id="result" className="section-container output">
        <div className="section-header output">📊 6. Result</div>
        {resultImages.length === 0 && runStatus.kind !== 'info' && (
          <div className="status">No result yet. Attach a reference image, fill attributes, and click <strong>🍌 Run via Nano Banana API</strong>.</div>
        )}
        {resultImages.length > 0 && (
          <div className="result-images">
            {resultImages.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} alt={img.name} src={img.dataUrl} />
            ))}
          </div>
        )}
        {resultText && (
          <div className="info" style={{ marginTop: 12 }}>
            <strong>Model text:</strong>
            <pre style={{ whiteSpace: 'pre-wrap', margin: '6px 0 0 0' }}>{resultText}</pre>
          </div>
        )}
      </section>
    </main>
  );
}

function Row({ children, single = false, three = false }: { children: React.ReactNode; single?: boolean; three?: boolean }) {
  const className = `parameter-group${single ? ' single' : ''}${three ? ' three' : ''}`;
  return <div className={className}>{children}</div>;
}

function Field({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="parameter-input">
      <label htmlFor={htmlFor}>
        {label}
        {hint ? <span className="hint"> {hint}</span> : null}
      </label>
      {children}
    </div>
  );
}

function StatusLine({ status }: { status: Status }) {
  if (status.kind === 'idle') return null;
  const cls = status.kind === 'success' ? 'success'
    : status.kind === 'warning' ? 'warning'
    : status.kind === 'error' ? 'error-box'
    : 'info';
  return <div className={cls} style={{ marginTop: 8 }}>{status.message}</div>;
}

const styles = `
  .nb-main { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; background: #fafbfc; }
  .nb-main h1 { font-size: 2.5em; border-bottom: 3px solid #0066cc; padding-bottom: 10px; margin-bottom: 10px; }
  .nb-main h2 { font-size: 1.4em; border-left: 4px solid #0066cc; padding-left: 15px; margin: 0 0 15px 0; color: #0d3b66; }
  .nb-main h3 { font-size: 1.1em; margin: 0 0 10px 0; color: #333; }
  .lede { color: #555; margin-top: 0; }
  .nb-main :global(code), .nb-main .code-highlight { background-color: #e8f4f8; color: #0d3b66; padding: 2px 6px; border-radius: 3px; border: 1px solid #b8d4e3; font-family: 'Courier New', monospace; font-size: 0.9em; }
  .section-container { background: linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%); border-left: 4px solid #0066cc; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0, 102, 204, 0.1); }
  .section-container.parameters { background: linear-gradient(135deg, #fff5e6 0%, #ffe6cc 100%); border-left-color: #ff9800; }
  .section-container.usage { background: linear-gradient(135deg, #f0e6ff 0%, #e6ccff 100%); border-left-color: #9c27b0; }
  .section-container.output { background: linear-gradient(135deg, #e6ffe6 0%, #ccffcc 100%); border-left-color: #28a745; }
  .section-header { background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); color: white; padding: 12px 20px; margin: -20px -20px 20px -20px; border-radius: 8px 8px 0 0; font-size: 1.1em; font-weight: bold; display: flex; align-items: center; gap: 10px; }
  .section-header.parameters { background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); }
  .section-header.usage { background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%); }
  .section-header.output { background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); }
  .info { background: #d1ecf1; border-left: 4px solid #0c5460; padding: 12px 16px; margin: 12px 0; border-radius: 4px; }
  .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px 16px; margin: 12px 0; border-radius: 4px; }
  .error-box { background: #f8d7da; border-left: 4px solid #dc3545; padding: 12px 16px; margin: 12px 0; border-radius: 4px; }
  .success { background: #d4edda; border-left: 4px solid #28a745; padding: 12px 16px; margin: 12px 0; border-radius: 4px; }
  .parameter-group { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .parameter-group.single { grid-template-columns: 1fr; }
  .parameter-group.three { grid-template-columns: 1fr 1fr 1fr; }
  .parameter-input { display: flex; flex-direction: column; gap: 4px; }
  .parameter-input label { font-size: 0.85em; color: #555; font-weight: 600; }
  .parameter-input .hint { font-size: 0.75em; color: #888; font-weight: normal; }
  .parameter-input :global(input), .parameter-input :global(select), .parameter-input :global(textarea) { padding: 8px 12px; border: 2px solid #ddd; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 0.9em; transition: border-color 0.2s ease; background: #fff; }
  .parameter-input :global(input:focus), .parameter-input :global(select:focus), .parameter-input :global(textarea:focus) { outline: none; border-color: #0066cc; box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1); }
  .parameter-input :global(textarea) { min-height: 60px; resize: vertical; }
  .parameter-input :global(textarea.tall) { min-height: 220px; }
  @media (max-width: 768px) { .parameter-group, .parameter-group.three { grid-template-columns: 1fr; } }
  .button-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px; }
  .btn { background-color: #0066cc; color: white; border: none; padding: 10px 16px; border-radius: 4px; cursor: pointer; font-size: 0.9em; font-weight: bold; transition: all 0.25s ease; }
  .btn:hover { background-color: #0052a3; transform: translateY(-1px); box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
  .btn.template { background-color: #6c757d; }
  .btn.template:hover { background-color: #5a6268; }
  .btn.run { background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); }
  .btn.run:hover { background: linear-gradient(135deg, #f57c00 0%, #ef6c00 100%); }
  .btn.describe { background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%); }
  .btn.describe:hover { background: linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%); }
  .btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }
  .drop-zone { display: block; border: 2px dashed #b8d4e3; background: #f8fcff; border-radius: 8px; padding: 24px; text-align: center; color: #555; cursor: pointer; transition: all 0.2s ease; }
  .drop-zone.dragover { background: #e8f4f8; border-color: #0066cc; }
  .drop-zone :global(input[type=file]) { display: none; }
  .hint-small { font-size: 0.85em; margin-top: 4px; color: #777; }
  .thumb-row { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
  .thumb { position: relative; border: 1px solid #b8d4e3; border-radius: 6px; overflow: hidden; background: #fff; }
  .thumb :global(img) { display: block; max-width: 140px; max-height: 140px; }
  .thumb .remove { position: absolute; top: 4px; right: 4px; background: rgba(220, 53, 69, 0.9); color: #fff; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; font-size: 0.8em; line-height: 1; }
  .preview-block { background-color: #e8f4f8; color: #0d3b66; border: 1px solid #b8d4e3; border-radius: 4px; padding: 14px; white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 0.9em; max-height: 420px; overflow: auto; }
  .result-images { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 12px; }
  .result-images :global(img) { max-width: 360px; border: 1px solid #b8d4e3; border-radius: 6px; background: #fff; }
  .status { font-size: 0.85em; color: #555; margin-top: 8px; }
  .toc { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 12px 18px; margin: 20px 0; }
  .toc h3 { margin: 0 0 8px 0; }
  .toc ul { margin: 0; padding-left: 20px; }
  .toc a { color: #0066cc; text-decoration: none; }
  .toc a:hover { text-decoration: underline; }
`;
