/**
 * Replace bottom sponsor under Gold Sponsor strip with upscaled Anish Kurian ad.
 * Crops Anish white header, upscales to poster width (lanczos3), full-bleed attach.
 * No stretch/text crop. Writes a new output file.
 */
const sharp = require('sharp');
const path = require('path');

const dir = path.join(
  __dirname,
  '..',
  'public',
  'images',
  'hero_section',
  'sponsors_landscape'
);

async function findContentTop(imgPath) {
  const { data, info } = await sharp(imgPath)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width;
  const sampleX = Math.floor(W * 0.2); // left navy column
  for (let y = 0; y < info.height; y++) {
    const i = (y * W + sampleX) * 3;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Navy panel (~2,38,76) — leave thin white strip behind
    if (r < 40 && g < 80 && b > 40 && b < 120) {
      return Math.max(0, y - 2);
    }
  }
  return 0;
}

async function main() {
  const basePath = path.join(
    dir,
    'parsippany_onam_gold_sponsor_roy_mathew_landscape.png'
  );
  const anishPath = path.join(dir, 'anish_kurian.png');
  const anish4kPath = path.join(dir, 'anish_kurian_4k.png');
  const outPath = path.join(
    dir,
    'parsippany_onam_gold_sponsor_anish_kurian_landscape.png'
  );

  const baseMeta = await sharp(basePath).metadata();
  const W = baseMeta.width;
  const sponsorStart = 3400;

  const anishMeta = await sharp(anishPath).metadata();
  const cropTop = await findContentTop(anishPath);
  const cropH = anishMeta.height - cropTop;

  // Step 1: Crop white header, upscale to full poster width (lanczos3)
  const upscaleW = W;
  const upscaleH = Math.round((cropH * upscaleW) / anishMeta.width);

  await sharp(anishPath)
    .extract({
      left: 0,
      top: cropTop,
      width: anishMeta.width,
      height: cropH,
    })
    .resize(upscaleW, upscaleH, {
      fit: 'fill',
      kernel: sharp.kernel.lanczos3,
    })
    .png({ compressionLevel: 6 })
    .toFile(anish4kPath);

  const bottomSponsor = await sharp(anish4kPath).png().toBuffer();
  const bottomH = upscaleH;
  const outH = sponsorStart + bottomH;

  // Step 2: Keep top (Onam + Gold Sponsor strip) intact
  const topPanel = await sharp(basePath)
    .extract({ left: 0, top: 0, width: W, height: sponsorStart })
    .png()
    .toBuffer();

  // Step 3: Reattach bottom full-bleed landscape
  await sharp({
    create: {
      width: W,
      height: outH,
      channels: 3,
      background: { r: 2, g: 38, b: 76 },
    },
  })
    .composite([
      { input: topPanel, top: 0, left: 0 },
      { input: bottomSponsor, top: sponsorStart, left: 0 },
    ])
    .png({ compressionLevel: 6 })
    .toFile(outPath);

  const outMeta = await sharp(outPath).metadata();
  const upMeta = await sharp(anish4kPath).metadata();
  console.log(
    JSON.stringify(
      {
        sourceAnish: anishMeta.width + 'x' + anishMeta.height,
        croppedWhiteHeaderPx: cropTop,
        upscaledAnish: upMeta.width + 'x' + upMeta.height,
        topKept: W + 'x' + sponsorStart,
        output: outMeta.width + 'x' + outMeta.height,
        outFile: path.basename(outPath),
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
