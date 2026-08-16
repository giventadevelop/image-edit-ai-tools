/**
 * Create WhatsApp-shareable copies (<16MB) of gold-sponsor landscape posters.
 * Keeps full resolution; uses high-quality mozjpeg (no downscale).
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const dir = path.join(
  __dirname,
  '..',
  'public',
  'images',
  'hero_section',
  'sponsors_landscape',
  'shared'
);

const MAX_BYTES = 15.5 * 1024 * 1024; // headroom under WhatsApp 16MB

const files = [
  'parsippany_onam_gold_sponsor_anish_kurian_landscape.png',
  'parsippany_onam_gold_sponsor_roy_mathew_landscape.png',
  'parsippany_onam_gold_sponsor_zeahire_landscape.png',
];

async function encodeUnderLimit(inputPath, outPath) {
  const meta = await sharp(inputPath).metadata();
  // Try high quality first; step down only if needed
  for (const quality of [92, 90, 88, 85, 82, 80]) {
    await sharp(inputPath)
      .jpeg({
        quality,
        mozjpeg: true,
        chromaSubsampling: '4:4:4', // keep text edges sharper
      })
      .toFile(outPath);

    const size = fs.statSync(outPath).size;
    if (size <= MAX_BYTES) {
      return { quality, size, width: meta.width, height: meta.height };
    }
  }

  // Still too large: slight width reduction, then high quality again
  const targetW = 4800;
  for (const quality of [90, 88, 85, 82]) {
    await sharp(inputPath)
      .resize({
        width: targetW,
        withoutEnlargement: true,
        kernel: sharp.kernel.lanczos3,
      })
      .jpeg({
        quality,
        mozjpeg: true,
        chromaSubsampling: '4:4:4',
      })
      .toFile(outPath);

    const size = fs.statSync(outPath).size;
    const outMeta = await sharp(outPath).metadata();
    if (size <= MAX_BYTES) {
      return {
        quality,
        size,
        width: outMeta.width,
        height: outMeta.height,
        resized: true,
      };
    }
  }

  throw new Error('Could not get under 16MB: ' + path.basename(inputPath));
}

async function main() {
  const results = [];
  for (const file of files) {
    const inputPath = path.join(dir, file);
    const outName = file.replace(/\.png$/i, '_whatsapp.jpg');
    const outPath = path.join(dir, outName);
    const srcSize = fs.statSync(inputPath).size;
    const info = await encodeUnderLimit(inputPath, outPath);
    results.push({
      source: file,
      sourceMB: +(srcSize / 1024 / 1024).toFixed(2),
      output: outName,
      outputMB: +(info.size / 1024 / 1024).toFixed(2),
      resolution: info.width + 'x' + info.height,
      jpegQuality: info.quality,
      resized: !!info.resized,
    });
  }
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
