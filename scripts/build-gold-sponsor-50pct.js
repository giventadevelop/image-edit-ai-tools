/**
 * Attach HQ landscape Onam (native res, no downscale) + Gold Sponsor at 50%.
 * Source landscape: parsippany_onam_elephants_removed_landscape_hq.png
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const dir = path.join(__dirname, '..', 'public', 'images', 'hero_section');

async function main() {
  const landPath = path.join(dir, 'parsippany_onam_elephants_removed_landscape_hq.png');
  const anishPath = path.join(dir, 'anish_kurian_realty_sponsor_landscape_copy_4.png');
  const outLand = path.join(dir, 'parsippany_onam_elephants_removed_landscape_hq.png');
  const out50 = path.join(dir, 'parsippany_onam_gold_sponsor_anish_landscape_50pct.png');
  const outMain = path.join(dir, 'parsippany_onam_gold_sponsor_anish_landscape.png');

  const landMeta = await sharp(landPath).metadata();
  const W = landMeta.width;
  const landH = landMeta.height;

  // Extra cream padding below QR / footer (breathing room before sponsor)
  const qrPad = Math.round(landH * 0.045);
  const topH = landH + qrPad;

  const padStrip = await sharp({
    create: {
      width: W,
      height: qrPad,
      channels: 3,
      background: { r: 250, g: 246, b: 236 },
    },
  })
    .png()
    .toBuffer();

  // Keep landscape at NATIVE resolution — never downscale (avoids face blur)
  const topFinal = await sharp({
    create: {
      width: W,
      height: topH,
      channels: 3,
      background: { r: 250, g: 246, b: 236 },
    },
  })
    .composite([
      { input: await sharp(landPath).png().toBuffer(), top: 0, left: 0 },
      { input: padStrip, top: landH, left: 0 },
    ])
    .png()
    .toBuffer();

  // Exact 50/50: bottom matches top height; scale sponsor UP to match W
  const half = topH;
  const H = half * 2;
  const stripH = Math.max(96, Math.round(half * 0.055));
  const anishH = half - stripH;

  const anishMeta = await sharp(anishPath).metadata();
  const navyTop = 1845;
  const bottomAnish = await sharp(anishPath)
    .extract({
      left: 0,
      top: navyTop,
      width: anishMeta.width,
      height: anishMeta.height - navyTop,
    })
    .resize(W, anishH, {
      fit: 'fill',
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();

  const fontSize = Math.round(W * 0.022);
  const textSvg =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<svg width="' +
    W +
    '" height="' +
    stripH +
    '" xmlns="http://www.w3.org/2000/svg">' +
    '<rect width="100%" height="100%" fill="#f3ebe0"/>' +
    '<text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" ' +
    'font-family="Georgia, Times New Roman, serif" font-size="' +
    fontSize +
    '" font-weight="600" fill="#1a1a1a">' +
    'Best compliments from our Gold Sponsor</text></svg>';

  const strip = await sharp(Buffer.from(textSvg)).png().toBuffer();

  await sharp({
    create: {
      width: W,
      height: H,
      channels: 3,
      background: { r: 245, g: 241, b: 232 },
    },
  })
    .composite([
      { input: topFinal, top: 0, left: 0 },
      { input: strip, top: half, left: 0 },
      { input: bottomAnish, top: half + stripH, left: 0 },
    ])
    .png()
    .toFile(out50);

  fs.copyFileSync(out50, outMain);

  // Also save the padded landscape standalone (before sponsor attach)
  await sharp(topFinal).png().toFile(
    path.join(dir, 'parsippany_onam_elephants_removed_landscape_hq_padded.png')
  );

  const m = await sharp(out50).metadata();
  console.log(
    JSON.stringify(
      {
        landscapeHQ: W + 'x' + landH,
        landscapeWithQrPad: W + 'x' + topH,
        qrPadPx: qrPad,
        finalComposite: m.width + 'x' + m.height,
        topNativeResNoDownscale: true,
        bottomPct: 50,
        outputs: [
          'parsippany_onam_elephants_removed_landscape_hq.png',
          'parsippany_onam_elephants_removed_landscape_hq_padded.png',
          'parsippany_onam_gold_sponsor_anish_landscape_50pct.png',
        ],
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
