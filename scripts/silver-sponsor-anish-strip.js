/**
 * Change Gold Sponsor → Silver Sponsor on Anish Kurian shared landscape poster.
 * Only updates the divider strip; rest of image unchanged.
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
const target = path.join(
  dir,
  'parsippany_onam_gold_sponsor_anish_kurian_landscape.png'
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

async function main() {
  const meta = await sharp(target).metadata();
  const W = meta.width;
  const H = meta.height;
  const stripTop = 2980;
  const royStart = 3400;
  const stripH = royStart - stripTop;
  const cy = Math.round(stripH / 2);
  const fontSize = Math.round(W * 0.041);
  const label = 'Best compliments from our Silver Sponsor';

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

  const svg =
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
    '<linearGradient id="silver" x1="0" y1="0" x2="1" y2="0">' +
    '<stop offset="0%" stop-color="#7a7f88"/>' +
    '<stop offset="50%" stop-color="#c5cad3"/>' +
    '<stop offset="100%" stop-color="#7a7f88"/>' +
    '</linearGradient>' +
    '</defs>' +
    '<rect width="100%" height="100%" fill="url(#bg)"/>' +
    '<rect x="0" y="0" width="' +
    W +
    '" height="6" fill="url(#silver)"/>' +
    '<rect x="0" y="' +
    (stripH - 6) +
    '" width="' +
    W +
    '" height="6" fill="url(#silver)"/>' +
    garlandDots(20, W, 21) +
    garlandDots(stripH - 20, W, 21) +
    leftCluster +
    rightCluster +
    '<text x="50%" y="' +
    (cy + 8) +
    '" text-anchor="middle" dominant-baseline="middle" ' +
    'font-family="Georgia, Times New Roman, Times, serif" font-size="' +
    fontSize +
    '" font-weight="700" fill="#5a6068" opacity="0.25">' +
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
    '</svg>';

  const strip = await sharp(Buffer.from(svg)).png().toBuffer();
  const tmpOut = target + '.tmp.png';
  await sharp(target)
    .composite([{ input: strip, top: stripTop, left: 0 }])
    .png({ compressionLevel: 6 })
    .toFile(tmpOut);
  fs.copyFileSync(tmpOut, target);
  fs.unlinkSync(tmpOut);

  const wa = path.join(
    dir,
    'parsippany_onam_gold_sponsor_anish_kurian_landscape_whatsapp.jpg'
  );
  if (fs.existsSync(wa)) {
    await sharp(target)
      .jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: '4:4:4' })
      .toFile(wa);
  }

  await sharp(target)
    .extract({ left: 0, top: stripTop, width: W, height: stripH })
    .resize(1400)
    .png()
    .toFile(path.join(dir, '_tmp_silver_check.png'));

  const outMeta = await sharp(target).metadata();
  console.log(
    JSON.stringify({
      ok: true,
      resolution: outMeta.width + 'x' + outMeta.height,
      text: label,
      updatedWhatsAppJpg: fs.existsSync(wa),
    })
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
