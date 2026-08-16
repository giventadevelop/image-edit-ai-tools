/**
 * WhatsApp tribute video — all Onam event sponsors, one by one.
 *
 * Timeline:
 *  1) Cover collage (first frame = WhatsApp thumbnail) — never blank
 *  2) Bronze: Sandy Psych
 *  3–5) Gold / main sponsors (highlighted longer, last):
 *       Anish Kurian → Roy Mathew → ZeaHire
 *  6) Outro collage thank-you — never blank / black ending
 *
 * Usage: node scripts/build-onam-sponsors-tribute-whatsapp.js
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const shared = path.join(
  __dirname,
  '..',
  'public',
  'images',
  'hero_section',
  'sponsors_landscape',
  'shared'
);
const vdir = path.join(shared, 'videos');
const work = path.join(vdir, '_sponsors_tribute_wa');
const out = path.join(vdir, 'Onam_2026_Sponsors_Tribute_whatsapp.mp4');

const W = 1080;
const H = 1920;
const FPS = 30;
const PAD = '0x1a0a2e'; // dark Onam purple — no cream empty look

/** Audio bed (festive Onam video preferred; Spectrum ad as fallback). */
const audioCandidates = [
  path.join(vdir, 'Onam_2026_1080p.mp4'),
  path.join(vdir, 'Spectrum_Ad.mp4'),
];

const sponsors = [
  {
    id: 'sandy_psych',
    tier: 'bronze',
    label: 'Bronze Sponsor',
    file: 'parsippany_onam_bronze_sponsor_sandy_psych_landscape_whatsapp.jpg',
    seconds: 2.5,
  },
  {
    id: 'anish_kurian',
    tier: 'gold',
    label: 'Gold Sponsor',
    file: 'parsippany_onam_gold_sponsor_anish_kurian_landscape_whatsapp.jpg',
    seconds: 3.0,
  },
  {
    id: 'roy_mathew',
    tier: 'gold',
    label: 'Gold Sponsor',
    file: 'parsippany_onam_gold_sponsor_roy_mathew_landscape_whatsapp.jpg',
    seconds: 3.0,
  },
  {
    id: 'zeahire',
    tier: 'gold',
    label: 'Gold Sponsor · Main Highlight',
    file: 'parsippany_onam_gold_sponsor_zeahire_landscape_whatsapp.jpg',
    seconds: 3.5, // longest — main gold highlight last
  },
];

const T_COVER = 2.5;
const T_OUTRO = 3.0;

function run(args, label) {
  console.log('>', label);
  const r = spawnSync('ffmpeg', args, {
    encoding: 'utf8',
    maxBuffer: 40 * 1024 * 1024,
  });
  if (r.status !== 0) {
    console.error((r.stderr || '').slice(-3500));
    throw new Error('ffmpeg failed: ' + label);
  }
}

function hasEncoder(name) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-encoders'], {
    encoding: 'utf8',
  });
  return (r.stdout || '').includes(name);
}

function videoEnc() {
  if (hasEncoder('h264_nvenc')) {
    return ['-c:v', 'h264_nvenc', '-preset', 'p4', '-cq', '19', '-b:v', '0'];
  }
  if (hasEncoder('libx264')) {
    return ['-c:v', 'libx264', '-preset', 'fast', '-crf', '18'];
  }
  return ['-c:v', 'mpeg4', '-q:v', '4'];
}

function pickAudio() {
  for (const p of audioCandidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(
    'No audio bed found. Expected Onam_2026_1080p.mp4 or Spectrum_Ad.mp4 in ' +
      vdir
  );
}

function themeSvg(title, subtitle) {
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">` +
    '<defs>' +
    '<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#12081f"/>' +
    '<stop offset="50%" stop-color="#1a0a2e"/>' +
    '<stop offset="100%" stop-color="#0d1528"/>' +
    '</linearGradient>' +
    '<linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">' +
    '<stop offset="0%" stop-color="#c9a227" stop-opacity="0"/>' +
    '<stop offset="50%" stop-color="#f0d78c" stop-opacity="0.9"/>' +
    '<stop offset="100%" stop-color="#c9a227" stop-opacity="0"/>' +
    '</linearGradient>' +
    '</defs>' +
    '<rect width="100%" height="100%" fill="url(#bg)"/>' +
    '<rect x="0" y="36" width="1080" height="4" fill="#c9a227" opacity="0.85"/>' +
    '<rect x="0" y="1880" width="1080" height="4" fill="#c9a227" opacity="0.85"/>' +
    `<text x="540" y="110" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="36" fill="#f0d78c" letter-spacing="4">${title}</text>` +
    `<text x="540" y="160" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#c4b5e0" letter-spacing="2">${subtitle}</text>` +
    '<rect x="180" y="178" width="720" height="2" fill="url(#gold)"/>' +
    '</svg>'
  );
}

/** Fit image into box with contain + centered pad (no crop of sponsor art). */
async function fitContain(srcPath, boxW, boxH, bg = { r: 26, g: 10, b: 46 }) {
  return sharp(srcPath)
    .resize(boxW, boxH, {
      fit: 'contain',
      background: bg,
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();
}

async function buildCollageFrame(outPath, title, subtitle) {
  const theme = await sharp(Buffer.from(themeSvg(title, subtitle))).png().toBuffer();

  // 2×2 grid under title band
  const marginX = 40;
  const gap = 16;
  const topBand = 200;
  const bottomBand = 80;
  const gridW = W - marginX * 2;
  const gridH = H - topBand - bottomBand;
  const cellW = Math.floor((gridW - gap) / 2);
  const cellH = Math.floor((gridH - gap) / 2);

  const positions = [
    { left: marginX, top: topBand },
    { left: marginX + cellW + gap, top: topBand },
    { left: marginX, top: topBand + cellH + gap },
    { left: marginX + cellW + gap, top: topBand + cellH + gap },
  ];

  const composites = [];
  for (let i = 0; i < sponsors.length; i++) {
    const src = path.join(shared, sponsors[i].file);
    if (!fs.existsSync(src)) throw new Error('Missing sponsor image: ' + src);
    const tile = await fitContain(src, cellW, cellH);
    // Rounded feel via slight inset border plate
    const plate = await sharp({
      create: {
        width: cellW,
        height: cellH,
        channels: 3,
        background: { r: 40, g: 24, b: 64 },
      },
    })
      .png()
      .toBuffer();
    composites.push({ input: plate, left: positions[i].left, top: positions[i].top });
    composites.push({ input: tile, left: positions[i].left, top: positions[i].top });
  }

  await sharp(theme).composite(composites).png().toFile(outPath);
}

async function stillClip(imagePath, audioSrc, audioStart, duration, outFile, label) {
  const vEnc = videoEnc();
  const vf =
    `scale=${W}:${H}:force_original_aspect_ratio=decrease,` +
    `pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=${PAD},setsar=1,fps=${FPS},format=yuv420p`;

  run(
    [
      '-y',
      '-loop',
      '1',
      '-i',
      imagePath,
      '-ss',
      String(audioStart),
      '-i',
      audioSrc,
      '-t',
      String(duration),
      '-filter_complex',
      `[0:v]${vf}[v];` +
        `[1:a]aformat=sample_rates=44100:channel_layouts=stereo,` +
        `atrim=0:${duration},asetpts=PTS-STARTPTS[a]`,
      '-map',
      '[v]',
      '-map',
      '[a]',
      ...vEnc,
      '-r',
      String(FPS),
      '-c:a',
      'aac',
      '-b:a',
      '160k',
      '-ar',
      '44100',
      '-ac',
      '2',
      '-shortest',
      '-movflags',
      '+faststart',
      outFile,
    ],
    label
  );
}

async function main() {
  for (const s of sponsors) {
    const p = path.join(shared, s.file);
    if (!fs.existsSync(p)) throw new Error('Missing: ' + p);
  }

  const audioSrc = pickAudio();
  console.log('> audio bed', path.basename(audioSrc));

  fs.rmSync(work, { recursive: true, force: true });
  fs.mkdirSync(work, { recursive: true });

  const clips = [];
  let audioCursor = 0;

  // 1) Cover collage — WhatsApp thumbnail / first frame
  const coverPng = path.join(work, 'cover_collage.png');
  await buildCollageFrame(
    coverPng,
    'PARSIPPANY ONAM 2026',
    'WITH GRATITUDE TO OUR SPONSORS'
  );
  await sharp(coverPng)
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(path.join(vdir, '_sponsors_tribute_cover_preview.jpg'));

  const cCover = path.join(work, 'c00_cover.mp4');
  await stillClip(coverPng, audioSrc, audioCursor, T_COVER, cCover, `cover ${T_COVER}s`);
  clips.push(cCover);
  audioCursor += T_COVER;

  // 2) Sponsors one by one (bronze first, main/gold last & longer)
  for (let i = 0; i < sponsors.length; i++) {
    const s = sponsors[i];
    const img = path.join(shared, s.file);
    const clip = path.join(
      work,
      `c${String(i + 1).padStart(2, '0')}_${s.id}.mp4`
    );
    await stillClip(
      img,
      audioSrc,
      audioCursor,
      s.seconds,
      clip,
      `${s.tier} ${s.id} ${s.seconds}s`
    );
    clips.push(clip);
    audioCursor += s.seconds;
  }

  // 3) Outro collage — last frame never blank
  const outroPng = path.join(work, 'outro_collage.png');
  await buildCollageFrame(
    outroPng,
    'THANK YOU',
    'OUR SPONSORS MADE ONAM 2026 POSSIBLE'
  );
  await sharp(outroPng)
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(path.join(vdir, '_sponsors_tribute_outro_preview.jpg'));

  const cOutro = path.join(work, 'c99_outro.mp4');
  await stillClip(
    outroPng,
    audioSrc,
    audioCursor,
    T_OUTRO,
    cOutro,
    `outro ${T_OUTRO}s`
  );
  clips.push(cOutro);

  // Concat
  const listFile = path.join(work, 'concat.txt');
  fs.writeFileSync(
    listFile,
    clips.map((p) => `file '${p.replace(/\\/g, '/')}'`).join('\n')
  );

  run(
    [
      '-y',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      listFile,
      '-c',
      'copy',
      '-movflags',
      '+faststart',
      out,
    ],
    'final concat'
  );

  const probe = spawnSync(
    'ffprobe',
    [
      '-v',
      'error',
      '-show_entries',
      'format=duration,size',
      '-show_entries',
      'stream=width,height',
      '-of',
      'json',
      out,
    ],
    { encoding: 'utf8' }
  );
  const info = JSON.parse(probe.stdout || '{}');
  const dur = Number(info.format?.duration || 0);
  const size = Number(info.format?.size || 0);
  const stream = (info.streams || []).find((s) => s.width) || {};

  console.log(
    JSON.stringify(
      {
        out,
        durationSec: Math.round(dur * 100) / 100,
        mb: Math.round((size / 1024 / 1024) * 100) / 100,
        resolution: `${stream.width}x${stream.height}`,
        timeline: [
          `cover collage ${T_COVER}s (WhatsApp thumbnail)`,
          ...sponsors.map(
            (s) => `${s.tier} ${s.id} ${s.seconds}s — ${s.label}`
          ),
          `outro collage ${T_OUTRO}s (no blank end)`,
        ],
        previewCover: path.join(vdir, '_sponsors_tribute_cover_preview.jpg'),
        previewOutro: path.join(vdir, '_sponsors_tribute_outro_preview.jpg'),
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
