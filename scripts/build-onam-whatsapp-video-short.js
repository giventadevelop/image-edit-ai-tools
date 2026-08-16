/**
 * Short WhatsApp Onam video (<20s):
 * - Each content scene = 2.0s
 * - ZeaHire 3s inserted at original ~19s beat (after PRESENTING title)
 * - ZeaHire scaled CONTAIN (full ad, cream letterbox), audio continues from source
 * - Opening cover = elephants_removed poster (WhatsApp thumbnail)
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const dir = path.join(
  __dirname,
  '..',
  'public',
  'images',
  'hero_section',
  'sponsors_landscape'
);
const vdir = path.join(dir, 'shared', 'videos');
const work = path.join(vdir, '_wa_short');
fs.mkdirSync(work, { recursive: true });

const src = path.join(vdir, 'Onam_2026_1080p.mp4');
const coverPng = path.join(dir, 'parsippany_onam_elephants_removed.png');
const zeaPng = path.join(dir, 'ZeaHire-Horizontal-002.png');
const out = path.join(vdir, 'Onam_2026_1080p_whatsapp.mp4');

function run(args, label) {
  console.log('>', label);
  const r = spawnSync('ffmpeg', args, {
    encoding: 'utf8',
    maxBuffer: 30 * 1024 * 1024,
  });
  if (r.status !== 0) {
    console.error((r.stderr || '').slice(-2500));
    throw new Error('ffmpeg failed: ' + label);
  }
}

const vfNorm =
  'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=60,format=yuv420p';

// COVER fill (crop to fill entire frame — no letterbox)
const vfCover =
  'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=60,format=yuv420p';

function encArgs(extraIn, vf, t, outFile) {
  return [
    '-y',
    ...extraIn,
    '-t',
    String(t),
    '-vf',
    vf,
    '-c:v',
    'h264_nvenc',
    '-preset',
    'p4',
    '-cq',
    '19',
    '-b:v',
    '0',
    '-r',
    '60',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-ar',
    '44100',
    '-ac',
    '2',
    outFile,
  ];
}

const clips = [];

// 1) Cover poster 2s + audio from start of original (contain so poster text not cropped)
const c0 = path.join(work, 'c00_cover.mp4');
run(
  [
    '-y',
    '-loop',
    '1',
    '-i',
    coverPng,
    '-ss',
    '0',
    '-i',
    src,
    '-t',
    '2',
    '-filter_complex',
    `[0:v]${vfNorm}[v];[1:a]aformat=sample_rates=44100:channel_layouts=stereo,atrim=0:2,asetpts=PTS-STARTPTS[a]`,
    '-map',
    '[v]',
    '-map',
    '[a]',
    '-c:v',
    'h264_nvenc',
    '-preset',
    'p4',
    '-cq',
    '19',
    '-b:v',
    '0',
    '-r',
    '60',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-shortest',
    c0,
  ],
  'cover poster 2s'
);
clips.push(c0);

// Content scenes from original (2s each)
const scenes = [
  { ss: 6.0, label: 'spectrum' },
  { ss: 10.0, label: 'roy_sponsor' },
  { ss: 18.0, label: 'presenting' }, // leads into ~19s ZeaHire insert
];

scenes.forEach((s, i) => {
  const f = path.join(work, `c${String(i + 1).padStart(2, '0')}_${s.label}.mp4`);
  run(
    encArgs(['-ss', String(s.ss), '-i', src], vfNorm, 2, f),
    `${s.label} 2s @${s.ss}`
  );
  clips.push(f);
});

// CONTAIN with cream letterbox (full ZeaHire ad visible — no crop)
const vfZeaContain =
  'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0xF5F1E8,setsar=1,fps=60,format=yuv420p';

// ZeaHire 3s — CONTAIN (full ad visible, no crop) + continuous audio from original @19s
const zea = path.join(work, 'c04_zeahire.mp4');
run(
  [
    '-y',
    '-loop',
    '1',
    '-i',
    zeaPng,
    '-ss',
    '19',
    '-i',
    src,
    '-t',
    '3',
    '-filter_complex',
    `[0:v]${vfZeaContain}[v];[1:a]aformat=sample_rates=44100:channel_layouts=stereo,atrim=0:3,asetpts=PTS-STARTPTS[a]`,
    '-map',
    '[v]',
    '-map',
    '[a]',
    '-c:v',
    'h264_nvenc',
    '-preset',
    'p4',
    '-cq',
    '19',
    '-b:v',
    '0',
    '-r',
    '60',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-shortest',
    zea,
  ],
  'zeahire 3s contain+audio@19s'
);
clips.push(zea);

// Remaining short scenes
const after = [
  { ss: 28.0, label: 'painting' },
  { ss: 30.0, label: 'pookalam' },
  { ss: 38.0, label: 'venue' },
  { ss: 41.0, label: 'final_poster' },
];
after.forEach((s, i) => {
  const f = path.join(
    work,
    `c${String(i + 5).padStart(2, '0')}_${s.label}.mp4`
  );
  run(
    encArgs(['-ss', String(s.ss), '-i', src], vfNorm, 2, f),
    `${s.label} 2s @${s.ss}`
  );
  clips.push(f);
});

// Concat
const list = path.join(work, 'list.txt');
fs.writeFileSync(
  list,
  clips.map((c) => "file '" + c.replace(/\\/g, '/') + "'").join('\n') + '\n'
);

run(
  [
    '-y',
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    list,
    '-c:v',
    'h264_nvenc',
    '-preset',
    'p5',
    '-cq',
    '20',
    '-b:v',
    '8M',
    '-maxrate',
    '12M',
    '-bufsize',
    '24M',
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
    '-pix_fmt',
    'yuv420p',
    out,
  ],
  'final concat'
);

const probe = spawnSync(
  'ffprobe',
  [
    '-v',
    'quiet',
    '-print_format',
    'json',
    '-show_format',
    '-show_streams',
    out,
  ],
  { encoding: 'utf8' }
);
const meta = JSON.parse(probe.stdout);
const v = meta.streams.find((s) => s.codec_type === 'video');
const dur = parseFloat(meta.format.duration);
const mb = fs.statSync(out).size / (1024 * 1024);
console.log(
  JSON.stringify(
    {
      out,
      durationSec: +dur.toFixed(2),
      under20: dur < 20,
      mb: +mb.toFixed(2),
      resolution: v.width + 'x' + v.height,
      clips: clips.length,
      note: 'ZeaHire@19s source audio, contain-scale (no crop), scenes=2s',
    },
    null,
    2
  )
);
