/**
 * Replace bottom sponsor under Gold Sponsor strip with upscaled ZeaHire ad.
 * Upscales to poster width (lanczos3), full-bleed attach — no crop/stretch.
 * Writes a new output file; does not overwrite the Roy base.
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

async function main() {
  const basePath = path.join(
    dir,
    'parsippany_onam_gold_sponsor_roy_mathew_landscape.png'
  );
  const sponsorPath = path.join(dir, 'ZeaHire-Horizontal-002.png');
  const sponsor4kPath = path.join(dir, 'ZeaHire-Horizontal-002_4k.png');
  const outPath = path.join(
    dir,
    'parsippany_onam_gold_sponsor_zeahire_landscape.png'
  );

  const baseMeta = await sharp(basePath).metadata();
  const W = baseMeta.width;
  const sponsorStart = 3400;

  const srcMeta = await sharp(sponsorPath).metadata();
  const upscaleW = W;
  const upscaleH = Math.round((srcMeta.height * upscaleW) / srcMeta.width);

  // Step 1: Upscale ZeaHire to full poster width (lanczos3)
  await sharp(sponsorPath)
    .resize(upscaleW, upscaleH, {
      fit: 'fill',
      kernel: sharp.kernel.lanczos3,
    })
    .png({ compressionLevel: 6 })
    .toFile(sponsor4kPath);

  const bottomSponsor = await sharp(sponsor4kPath).png().toBuffer();
  const outH = sponsorStart + upscaleH;

  // Step 2: Keep Onam top + Gold Sponsor strip intact
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
      background: { r: 245, g: 245, b: 247 },
    },
  })
    .composite([
      { input: topPanel, top: 0, left: 0 },
      { input: bottomSponsor, top: sponsorStart, left: 0 },
    ])
    .png({ compressionLevel: 6 })
    .toFile(outPath);

  const outMeta = await sharp(outPath).metadata();
  const upMeta = await sharp(sponsor4kPath).metadata();
  console.log(
    JSON.stringify(
      {
        source: srcMeta.width + 'x' + srcMeta.height,
        upscaled: upMeta.width + 'x' + upMeta.height,
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
