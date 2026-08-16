/**
 * From Anish Silver WhatsApp landscape poster:
 * - Change Silver → Bronze on divider strip only
 * - Replace bottom sponsor with sandy_psych_sponsor.jpeg (full-bleed, landscape proportions)
 * - Keep Onam top + all other content intact
 * Writes NEW files (does not overwrite Anish).
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const optDir = path.join(
  __dirname,
  '..',
  'public',
  'images',
  'hero_section',
  'sponsors_landscape',
  'shared',
  'size_optimised'
);
const sharedDir = path.join(optDir, '..');

const baseJpg = path.join(
  optDir,
  'parsippany_onam_gold_sponsor_anish_kurian_landscape_whatsapp.jpg'
);
const sandyPath = path.join(optDir, 'sandy_psych_sponsor.jpeg');

const outPng = path.join(
  sharedDir,
  'parsippany_onam_bronze_sponsor_sandy_psych_landscape.png'
);
const outWa = path.join(
  optDir,
  'parsippany_onam_bronze_sponsor_sandy_psych_landscape_whatsapp.jpg'
);
const outWaShared = path.join(
  sharedDir,
  'parsippany_onam_bronze_sponsor_sandy_psych_landscape_whatsapp.jpg'
);

function flowerGroup(cx, cy, scale, petalColor, centerColor) {
  const r = Math.round(22 * scale);
  const petals = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const px = cx + Math.cos(a) * r * 0.85;
    const py = cy + Math.sin(a) * r * 0.85;
    petals.push(
      '<ellipse cx="' +
        px.toFixed(1) +
        '" cy="' +
        py.toFixed(1) +
        '" rx="' +
        (r * 0.55).toFixed(1) +
        '" ry="' +
        (r * 0.32).toFixed(1) +
        '" fill="' +
        petalColor +
        '" transform="rotate(' +
        ((a * 180) / Math.PI).toFixed(1) +
        ' ' +
        px.toFixed(1) +
        ' ' +
        py.toFixed(1) +
        ')"/>'
    );
  }
  return (
    '<g>' +
    petals.join('') +
    '<circle cx="' +
    cx +
    '" cy="' +
    cy +
    '" r="' +
    (r * 0.38).toFixed(1) +
    '" fill="' +
    centerColor +
    '"/>' +
    '<circle cx="' +
    cx +
    '" cy="' +
    cy +
    '" r="' +
    (r * 0.16).toFixed(1) +
    '" fill="#f5e6a8"/>' +
    '</g>'
  );
}

function leaf(cx, cy, rot, scale) {
  const w = Math.round(26 * scale);
  const h = Math.round(11 * scale);
  return (
    '<ellipse cx="' +
    cx +
    '" cy="' +
    cy +
    '" rx="' +
    w +
    '" ry="' +
    h +
    '" fill="#2f6b32" opacity="0.92" transform="rotate(' +
    rot +
    ' ' +
    cx +
    ' ' +
    cy +
    ')"/>'
  );
}

function garlandDots(y, W, count) {
  const colors = ['#e85d04', '#ffba08', '#dc2f02', '#e9c46a', '#f48c06'];
  let s = '';
  for (let i = 0; i < count; i++) {
    const x = Math.round(((i + 0.5) / count) * W);
    const c = colors[i % colors.length];
    s +=
      '<circle cx="' +
      x +
      '" cy="' +
      y +
      '" r="9" fill="' +
      c +
      '"/>' +
      '<circle cx="' +
      x +
      '" cy="' +
      y +
      '" r="4" fill="#ffe08a"/>';
  }
  return s;
}

function bronzeStripSvg(W, stripH) {
  const cy = Math.round(stripH / 2);
  const fontSize = Math.round(W * 0.041);
  const label = 'Best compliments from our Bronze Sponsor';

  const leftCluster =
    leaf(Math.round(W * 0.028), cy - 50, -40, 1.8) +
    leaf(Math.round(W * 0.028), cy + 50, 40, 1.8) +
    leaf(Math.round(W * 0.065), cy - 85, -25, 1.4) +
    leaf(Math.round(W * 0.065), cy + 85, 25, 1.4) +
    flowerGroup(Math.round(W * 0.05), cy, 3.2, '#e85d04', '#f4a261') +
    flowerGroup(Math.round(W * 0.1), cy - 85, 2.0, '#dc2f02', '#e9c46a') +
    flowerGroup(Math.round(W * 0.1), cy + 85, 2.0, '#f48c06', '#ffba08') +
    flowerGroup(Math.round(W * 0.03), cy - 105, 1.4, '#e9c46a', '#e85d04') +
    flowerGroup(Math.round(W * 0.03), cy + 105, 1.4, '#ffba08', '#dc2f02') +
    flowerGroup(Math.round(W * 0.12), cy, 1.5, '#f48c06', '#dc2f02');

  const rightCluster =
    leaf(Math.round(W * 0.972), cy - 50, 40, 1.8) +
    leaf(Math.round(W * 0.972), cy + 50, -40, 1.8) +
    leaf(Math.round(W * 0.935), cy - 85, 25, 1.4) +
    leaf(Math.round(W * 0.935), cy + 85, -25, 1.4) +
    flowerGroup(Math.round(W * 0.95), cy, 3.2, '#e85d04', '#f4a261') +
    flowerGroup(Math.round(W * 0.9), cy - 85, 2.0, '#dc2f02', '#e9c46a') +
    flowerGroup(Math.round(W * 0.9), cy + 85, 2.0, '#f48c06', '#ffba08') +
    flowerGroup(Math.round(W * 0.97), cy - 105, 1.4, '#e9c46a', '#e85d04') +
    flowerGroup(Math.round(W * 0.97), cy + 105, 1.4, '#ffba08', '#dc2f02') +
    flowerGroup(Math.round(W * 0.88), cy, 1.5, '#f48c06', '#dc2f02');

  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<svg width="' +
    W +
    '" height="' +
    stripH +
    '" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
    '<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#faf6ec"/>' +
    '<stop offset="50%" stop-color="#f3ebe0"/>' +
    '<stop offset="100%" stop-color="#efe6d6"/>' +
    '</linearGradient>' +
    '<linearGradient id="bronze" x1="0" y1="0" x2="1" y2="0">' +
    '<stop offset="0%" stop-color="#6b3e1f"/>' +
    '<stop offset="50%" stop-color="#cd7f32"/>' +
    '<stop offset="100%" stop-color="#6b3e1f"/>' +
    '</linearGradient>' +
    '</defs>' +
    '<rect width="100%" height="100%" fill="url(#bg)"/>' +
    '<rect x="0" y="0" width="' +
    W +
    '" height="6" fill="url(#bronze)"/>' +
    '<rect x="0" y="' +
    (stripH - 6) +
    '" width="' +
    W +
    '" height="6" fill="url(#bronze)"/>' +
    garlandDots(20, W, 21) +
    garlandDots(stripH - 20, W, 21) +
    leftCluster +
    rightCluster +
    '<text x="50%" y="' +
    (cy + 8) +
    '" text-anchor="middle" dominant-baseline="middle" ' +
    'font-family="Georgia, Times New Roman, Times, serif" font-size="' +
    fontSize +
    '" font-weight="700" fill="#5a4030" opacity="0.25">' +
    label +
    '</text>' +
    '<text x="50%" y="' +
    cy +
    '" text-anchor="middle" dominant-baseline="middle" ' +
    'font-family="Georgia, Times New Roman, Times, serif" font-size="' +
    fontSize +
    '" font-weight="700" fill="#1a1208">' +
    label +
    '</text>' +
    '</svg>'
  );
}

async function main() {
  if (!fs.existsSync(baseJpg)) throw new Error('Missing base: ' + baseJpg);
  if (!fs.existsSync(sandyPath)) throw new Error('Missing sandy: ' + sandyPath);

  const baseMeta = await sharp(baseJpg).metadata();
  const W = baseMeta.width;
  const stripTop = 2980;
  const sponsorStart = 3400;
  const stripH = sponsorStart - stripTop;

  // Prefer full-res PNG top if available (sharper Onam); else use WhatsApp JPG
  const basePng = path.join(
    sharedDir,
    'parsippany_onam_gold_sponsor_anish_kurian_landscape.png'
  );
  const topSource = fs.existsSync(basePng) ? basePng : baseJpg;

  const topMeta = await sharp(topSource).metadata();
  if (topMeta.width !== W) {
    throw new Error(
      'Width mismatch topSource=' + topMeta.width + ' vs baseJpg=' + W
    );
  }

  // 1) Keep Onam top intact (above strip)
  const onamTop = await sharp(topSource)
    .extract({ left: 0, top: 0, width: W, height: stripTop })
    .png()
    .toBuffer();

  // 2) Bronze divider strip
  const strip = await sharp(Buffer.from(bronzeStripSvg(W, stripH)))
    .png()
    .toBuffer();

  // 3) Upscale Sandy Psych to poster width — keep landscape aspect (no crop)
  const sandyMeta = await sharp(sandyPath).metadata();
  const upW = W;
  const upH = Math.round((sandyMeta.height * upW) / sandyMeta.width);
  const bottomSponsor = await sharp(sandyPath)
    .resize(upW, upH, {
      fit: 'fill',
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();

  const outH = sponsorStart + upH;

  await sharp({
    create: {
      width: W,
      height: outH,
      channels: 3,
      background: { r: 245, g: 241, b: 232 },
    },
  })
    .composite([
      { input: onamTop, top: 0, left: 0 },
      { input: strip, top: stripTop, left: 0 },
      { input: bottomSponsor, top: sponsorStart, left: 0 },
    ])
    .png({ compressionLevel: 6 })
    .toFile(outPng);

  // WhatsApp JPEG (~q92)
  await sharp(outPng)
    .jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(outWa);
  fs.copyFileSync(outWa, outWaShared);

  // Quick visual checks
  await sharp(outPng)
    .extract({ left: 0, top: stripTop, width: W, height: stripH })
    .resize(1400)
    .jpeg({ quality: 90 })
    .toFile(path.join(optDir, '_tmp_bronze_strip_check.jpg'));
  await sharp(outPng)
    .extract({ left: 0, top: sponsorStart, width: W, height: Math.min(800, upH) })
    .resize(1400)
    .jpeg({ quality: 90 })
    .toFile(path.join(optDir, '_tmp_bronze_bottom_check.jpg'));

  const outMeta = await sharp(outPng).metadata();
  const waStat = fs.statSync(outWa);
  console.log(
    JSON.stringify(
      {
        ok: true,
        topSource: path.basename(topSource),
        sandySource: sandyMeta.width + 'x' + sandyMeta.height,
        sandyUpscaled: upW + 'x' + upH,
        strip: 'Bronze Sponsor @ y=' + stripTop + '-' + sponsorStart,
        output: outMeta.width + 'x' + outMeta.height,
        png: outPng,
        whatsappJpg: outWa,
        whatsappMb: Math.round((waStat.size / 1024 / 1024) * 100) / 100,
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
