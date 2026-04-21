#!/usr/bin/env node

/**
 * Nano Banana (Gemini 2.5 Flash Image) test script.
 *
 * Env var required: GEMINI_API_KEY  (put it in .env.local)
 * Get a key: https://aistudio.google.com/apikey
 *
 * Usage:
 *   node scripts/nano-banana-test.mjs                           # uses default prompt + no input image (pure generation)
 *   node scripts/nano-banana-test.mjs <imagePath>               # edit the given image with default prompt
 *   node scripts/nano-banana-test.mjs <imagePath> "prompt..."   # edit with custom prompt
 *   node scripts/nano-banana-test.mjs -- "prompt..."            # pure generation with custom prompt
 *
 * Output: writes generated image(s) to ./nano-banana-output/ and prints the path.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Load env — prefer .env.local, then .env
dotenv.config({ path: path.join(projectRoot, '.env.local') });
dotenv.config({ path: path.join(projectRoot, '.env') });

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('❌ GEMINI_API_KEY not found.');
  console.error('   Add to .env.local:  GEMINI_API_KEY=your_key_here');
  console.error('   Get a key at: https://aistudio.google.com/apikey');
  process.exit(1);
}

// Model ID for Nano Banana. Use the stable alias; swap to the preview ID if you need preview-only features.
const MODEL_ID = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent`;

const args = process.argv.slice(2);
let imagePath = null;
let prompt = null;

if (args[0] === '--' || args[0] === undefined) {
  prompt = args[1] || 'A cheerful cartoon banana mascot holding a sign that says "Hello from Nano Banana"';
} else {
  imagePath = args[0];
  prompt = args[1] || 'Re-render this image in a vibrant pop-art style, keeping the main subject recognizable.';
}

const MIME_BY_EXT = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

function inlineImagePart(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_BY_EXT[ext];
  if (!mime) throw new Error(`Unsupported image extension: ${ext}`);
  const data = fs.readFileSync(filePath).toString('base64');
  return { inline_data: { mime_type: mime, data } };
}

async function main() {
  const parts = [{ text: prompt }];
  if (imagePath) {
    const resolved = path.resolve(imagePath);
    if (!fs.existsSync(resolved)) {
      console.error(`❌ Image not found: ${resolved}`);
      process.exit(1);
    }
    parts.push(inlineImagePart(resolved));
    console.log(`🖼  Input image: ${resolved}`);
  } else {
    console.log('🍌 No input image — pure generation mode');
  }
  console.log(`📝 Prompt: ${prompt}`);
  console.log(`🤖 Model: ${MODEL_ID}`);

  const body = {
    contents: [{ parts }],
    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
  };

  const started = Date.now();
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': API_KEY,
    },
    body: JSON.stringify(body),
  });

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  if (!res.ok) {
    const errText = await res.text();
    console.error(`❌ API error (${res.status}) after ${elapsed}s:`);
    console.error(errText);
    process.exit(1);
  }

  const json = await res.json();
  const candidateParts = json?.candidates?.[0]?.content?.parts ?? [];
  if (candidateParts.length === 0) {
    console.error('❌ No content returned. Full response:');
    console.error(JSON.stringify(json, null, 2));
    process.exit(1);
  }

  const outDir = path.join(projectRoot, 'nano-banana-output');
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');

  let imgIndex = 0;
  const saved = [];
  const textChunks = [];
  for (const part of candidateParts) {
    const inline = part.inline_data || part.inlineData;
    if (inline?.data) {
      const mime = inline.mime_type || inline.mimeType || 'image/png';
      const ext = mime.split('/')[1] || 'png';
      const outPath = path.join(outDir, `nano-banana-${stamp}-${imgIndex++}.${ext}`);
      fs.writeFileSync(outPath, Buffer.from(inline.data, 'base64'));
      saved.push(outPath);
    } else if (part.text) {
      textChunks.push(part.text);
    }
  }

  console.log(`✅ Done in ${elapsed}s`);
  if (textChunks.length) console.log(`💬 Model text: ${textChunks.join('\n')}`);
  if (saved.length) {
    console.log(`🖼  Saved ${saved.length} image(s):`);
    saved.forEach(p => console.log(`   - ${p}`));
  } else {
    console.warn('⚠️  No image in response — the model returned only text.');
  }
}

main().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
