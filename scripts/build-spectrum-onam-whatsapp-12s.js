/**
 * WhatsApp Spectrum + Onam video:
 * 1) Cover on modern themed full-bleed bg (no empty letterbox)
 * 2) Best compliments from Spectrum Auto for the ONAM
 * 3) Tire/brake hook
 * 4) Service garage
 * 5) End CTA slowed ~0.5x (~6–7s) so audio is clearer
 * Vertical 1080x1920, contain (no crop).
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = path.join(
  __dirname,
  '..',
  'public',
  'images',
  'hero_section',
  'sponsors_landscape'
);
const vdir = path.join(dir, 'shared', 'videos');
const work = path.join(vdir, '_spectrum_onam_wa');
const src = path.join(vdir, 'Spectrum_Ad.mp4');
const coverPng = path.join(dir, 'onam_ad_copy_6_landscape_spectrum.png');
const out = path.join(vdir, 'Spectrum_Onam_12s_whatsapp.mp4');

const W = 1080;
const H = 1920;
const PAD = '0x0B1F3A'; // Spectrum navy — matches themed bars

function run(args, label) {
  console.log('>', label);
  const r = spawnSync('ffmpeg', args, {
    encoding: 'utf8',
    maxBuffer: 30 * 1024 * 1024,
  });
  if (r.status !== 0) {
    console.error((r.stderr || '').slice(-3000));
    throw new Error('ffmpeg failed: ' + label);
  }
}

function hasEncoder(name) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-encoders'], {
    encoding: 'utf8',
  });
  return (r.stdout || '').includes(name);
}

function modernThemeSvg() {
  let bokeh = '';
  const spots = [
    [120, 80, 28],
    [280, 140, 18],
    [520, 60, 34],
    [760, 110, 22],
    [940, 70, 30],
    [180, 250, 14],
    [860, 220, 16],
    [140, 1780, 26],
    [360, 1840, 18],
    [600, 1760, 32],
    [820, 1820, 20],
    [980, 1740, 24],
    [80, 1680, 12],
    [700, 1880, 15],
  ];
  for (const [x, y, r] of spots) {
    bokeh +=
      '<circle cx="' +
      x +
      '" cy="' +
      y +
      '" r="' +
      r +
      '" fill="#5b9bd5" opacity="0.18"/>';
  }
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<svg width="' +
    W +
    '" height="' +
    H +
    '" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
    '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="#050e1c"/>' +
    '<stop offset="40%" stop-color="#0c2748"/>' +
    '<stop offset="100%" stop-color="#07182c"/>' +
    '</linearGradient>' +
    '<radialGradient id="glowT" cx="50%" cy="8%" r="45%">' +
    '<stop offset="0%" stop-color="#4a90d9" stop-opacity="0.45"/>' +
    '<stop offset="100%" stop-color="#0b1f3a" stop-opacity="0"/>' +
    '</radialGradient>' +
    '<radialGradient id="glowB" cx="50%" cy="92%" r="42%">' +
    '<stop offset="0%" stop-color="#d4af37" stop-opacity="0.28"/>' +
    '<stop offset="100%" stop-color="#0b1f3a" stop-opacity="0"/>' +
    '</radialGradient>' +
    '<linearGradient id="stripe" x1="0" y1="0" x2="1" y2="0">' +
    '<stop offset="0%" stop-color="#1a4a7a" stop-opacity="0"/>' +
    '<stop offset="50%" stop-color="#6eb6ff" stop-opacity="0.35"/>' +
    '<stop offset="100%" stop-color="#1a4a7a" stop-opacity="0"/>' +
    '</linearGradient>' +
    '</defs>' +
    '<rect width="100%" height="100%" fill="url(#bg)"/>' +
    '<rect width="100%" height="100%" fill="url(#glowT)"/>' +
    '<rect width="100%" height="100%" fill="url(#glowB)"/>' +
    bokeh +
    '<g opacity="0.22" stroke="#9ec5ff" stroke-width="2">' +
    '<line x1="-40" y1="40" x2="400" y2="300"/>' +
    '<line x1="200" y1="20" x2="700" y2="310"/>' +
    '<line x1="500" y1="10" x2="1100" y2="280"/>' +
    '<line x1="80" y1="300" x2="980" y2="40"/>' +
    '</g>' +
    '<rect x="80" y="100" width="920" height="2" fill="url(#stripe)"/>' +
    '<rect x="160" y="220" width="760" height="2" fill="url(#stripe)"/>' +
    '<g opacity="0.2" stroke="#f0d78c" stroke-width="2">' +
    '<line x1="-20" y1="1650" x2="420" y2="1900"/>' +
    '<line x1="250" y1="1620" x2="780" y2="1910"/>' +
    '<line x1="520" y1="1640" x2="1120" y2="1880"/>' +
    '</g>' +
    '<rect x="80" y="1700" width="920" height="2" fill="url(#stripe)"/>' +
    '<rect x="160" y="1820" width="760" height="2" fill="url(#stripe)"/>' +
    '<rect x="0" y="40" width="1080" height="4" fill="#c9a227" opacity="0.7"/>' +
    '<rect x="0" y="1876" width="1080" height="4" fill="#c9a227" opacity="0.7"/>' +
    '<rect x="0" y="0" width="14" height="1920" fill="#1e5a9c" opacity="0.55"/>' +
    '<rect x="1066" y="0" width="14" height="1920" fill="#1e5a9c" opacity="0.55"/>' +
    '<text x="540" y="175" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#9ec5ff" opacity="0.55" letter-spacing="6">SPECTRUM AUTO</text>' +
    '<text x="540" y="1785" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="24" fill="#f0d78c" opacity="0.55" letter-spacing="3">ONAM 2026</text>' +
    '</svg>'
  );
}

async function buildCoverFrame(outPath) {
  const theme = await sharp(Buffer.from(modernThemeSvg())).png().toBuffer();
  const posterMeta = await sharp(coverPng).metadata();
  const scale = W / posterMeta.width;
  const pw = W;
  const ph = Math.round(posterMeta.height * scale);
  const top = Math.max(0, Math.round((H - ph) / 2));

  const poster = await sharp(coverPng)
    .resize(pw, ph, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();

  await sharp(theme)
    .composite([{ input: poster, top, left: 0 }])
    .png()
    .toFile(outPath);

  return { pw, ph, top, padTop: top, padBottom: H - top - ph };
}

async function main() {
  if (!fs.existsSync(src)) throw new Error('Missing ' + src);
  if (!fs.existsSync(coverPng)) throw new Error('Missing ' + coverPng);

  fs.rmSync(work, { recursive: true, force: true });
  fs.mkdirSync(work, { recursive: true });

  const vEnc = hasEncoder('h264_nvenc')
    ? ['-c:v', 'h264_nvenc', '-preset', 'p4', '-cq', '19', '-b:v', '0']
    : hasEncoder('libx264')
      ? ['-c:v', 'libx264', '-preset', 'fast', '-crf', '18']
      : ['-c:v', 'mpeg4', '-q:v', '4'];

  // Landscape Spectrum clips — contain on navy (no cream bars)
  const vfContain =
    'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=' +
    PAD +
    ',setsar=1,fps=30,format=yuv420p';

  const clips = [];

  const T_COVER = 2.5;
  const T_TEXT = 2.5;
  const T_HOOK = 2.0;
  const T_GARAGE = 2.0;
  // Source CTA ~3.5s played at 0.5x → ~7s (slower audio, +~4s stretch)
  const T_CTA_SRC = 3.5;
  const CTA_SLOW = 0.5;
  const T_CTA_OUT = T_CTA_SRC / CTA_SLOW; // 7.0s

  // 1) Cover on modern themed full frame
  const coverFrame = path.join(work, 'cover_themed.png');
  const coverInfo = await buildCoverFrame(coverFrame);
  console.log('> cover themed frame', coverInfo);

  const c0 = path.join(work, 'c00_cover.mp4');
  run(
    [
      '-y',
      '-loop',
      '1',
      '-i',
      coverFrame,
      '-ss',
      '0',
      '-i',
      src,
      '-t',
      String(T_COVER),
      '-filter_complex',
      `[0:v]scale=1080:1920,setsar=1,fps=30,format=yuv420p[v];[1:a]aformat=sample_rates=44100:channel_layouts=stereo,atrim=0:${T_COVER},asetpts=PTS-STARTPTS[a]`,
      '-map',
      '[v]',
      '-map',
      '[a]',
      ...vEnc,
      '-r',
      '30',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-ar',
      '44100',
      '-ac',
      '2',
      '-shortest',
      c0,
    ],
    `cover ${T_COVER}s (themed fill)`
  );
  clips.push(c0);

  // 2) Compliments text card
  const textSvg =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#071525"/>' +
    '<stop offset="55%" stop-color="#0d2a4d"/>' +
    '<stop offset="100%" stop-color="#081a30"/>' +
    '</linearGradient></defs>' +
    '<rect width="1080" height="1920" fill="url(#bg)"/>' +
    '<rect x="0" y="48" width="1080" height="3" fill="#c9a227" opacity="0.55"/>' +
    '<rect x="0" y="1869" width="1080" height="3" fill="#c9a227" opacity="0.55"/>' +
    '<rect x="70" y="760" width="940" height="400" rx="28" fill="#ffffff" opacity="0.08"/>' +
    '<text x="540" y="860" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="42" fill="#9ec5ff" letter-spacing="3">BEST COMPLIMENTS FROM</text>' +
    '<text x="540" y="960" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="700" fill="#ffffff">Spectrum Auto</text>' +
    '<text x="540" y="1040" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="48" fill="#f5d78e" font-style="italic">for the ONAM</text>' +
    '<text x="540" y="1140" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#a8c4e8">Exceeding Perfection</text>' +
    '</svg>';

  const textPng = path.join(work, 'compliments.png');
  await sharp(Buffer.from(textSvg)).png().toFile(textPng);

  const c1 = path.join(work, 'c01_compliments.mp4');
  run(
    [
      '-y',
      '-loop',
      '1',
      '-i',
      textPng,
      '-ss',
      String(T_COVER),
      '-i',
      src,
      '-t',
      String(T_TEXT),
      '-filter_complex',
      `[0:v]scale=1080:1920,setsar=1,fps=30,format=yuv420p[v];[1:a]aformat=sample_rates=44100:channel_layouts=stereo,atrim=0:${T_TEXT},asetpts=PTS-STARTPTS[a]`,
      '-map',
      '[v]',
      '-map',
      '[a]',
      ...vEnc,
      '-r',
      '30',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-ar',
      '44100',
      '-ac',
      '2',
      '-shortest',
      c1,
    ],
    `compliments ${T_TEXT}s`
  );
  clips.push(c1);

  function spectrumClip(ss, t, label, outFile) {
    run(
      [
        '-y',
        '-ss',
        String(ss),
        '-i',
        src,
        '-t',
        String(t),
        '-vf',
        vfContain,
        ...vEnc,
        '-r',
        '30',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        '-ar',
        '44100',
        '-ac',
        '2',
        '-movflags',
        '+faststart',
        outFile,
      ],
      `${label} ${t}s @${ss}s`
    );
  }

  const c2 = path.join(work, 'c02_hook.mp4');
  spectrumClip(0.0, T_HOOK, 'hook_brake', c2);
  clips.push(c2);

  const c3 = path.join(work, 'c03_garage.mp4');
  spectrumClip(18.0, T_GARAGE, 'garage', c3);
  clips.push(c3);

  // 5) End CTA — two-pass 0.5x slow (one-pass setpts+nvenc collapses duration)
  const c4raw = path.join(work, 'c04_cta_raw.mp4');
  const c4 = path.join(work, 'c04_cta_slow.mp4');
  run(
    [
      '-y',
      '-ss',
      '74.5',
      '-i',
      src,
      '-t',
      String(T_CTA_SRC),
      '-vf',
      vfContain,
      ...vEnc,
      '-r',
      '30',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-ar',
      '44100',
      '-ac',
      '2',
      c4raw,
    ],
    `end_cta raw ${T_CTA_SRC}s`
  );
  run(
    [
      '-y',
      '-i',
      c4raw,
      '-filter_complex',
      `[0:v]setpts=2*PTS[v];[0:a]atempo=0.5[a]`,
      '-map',
      '[v]',
      '-map',
      '[a]',
      ...vEnc,
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-ar',
      '44100',
      '-ac',
      '2',
      '-movflags',
      '+faststart',
      c4,
    ],
    `end_cta slow 0.5x → ~${T_CTA_OUT}s`
  );
  clips.push(c4);

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

  // Keep a cover preview for quick check, then clean work
  const preview = path.join(vdir, '_cover_themed_preview.jpg');
  await sharp(coverFrame).jpeg({ quality: 90 }).toFile(preview);

  fs.rmSync(work, { recursive: true, force: true });

  console.log(
    JSON.stringify(
      {
        out,
        durationSec: Math.round(dur * 100) / 100,
        mb: Math.round((size / 1024 / 1024) * 100) / 100,
        resolution: `${stream.width}x${stream.height}`,
        coverPad: coverInfo,
        timeline: [
          `cover ${T_COVER}s themed-fill`,
          `compliments ${T_TEXT}s`,
          `hook ${T_HOOK}s@0`,
          `garage ${T_GARAGE}s@18`,
          `end_cta ${T_CTA_SRC}s@0.5x≈${T_CTA_OUT}s`,
        ],
        preview,
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
