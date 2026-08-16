/**
 * Spectrum Auto ~5s highlight reel from Higgsfield video analysis.
 * Source: Spectrum_Ad.mp4 (~82s 4K)
 * Analysis id: 15c0b4c5-0cab-42bf-b22b-745db62db078
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
  'sponsors_landscape',
  'shared',
  'videos'
);
const src = path.join(dir, 'Spectrum_Ad.mp4');
const work = path.join(dir, '_spectrum_5s_work');
const out = path.join(dir, 'Spectrum_Ad_5s_highlight.mp4');

// Higgsfield analysis highlight picks (original footage, ~5s total)
const clips = [
  { ss: 0.0, d: 0.8, label: 'hook_brake' }, // Scene 1 — tire/brake hook
  { ss: 2.0, d: 0.9, label: 'blue_car' }, // Scene 3 — product car
  { ss: 18.0, d: 0.9, label: 'garage' }, // Scene 12 — service bay
  { ss: 57.8, d: 1.0, label: 'west_nyack' }, // Scene 34 — facility + address
  { ss: 74.5, d: 1.4, label: 'end_cta' }, // Scene 37 — logo/addresses CTA
];

function run(cmd, args, label) {
  console.log('>', label);
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    throw new Error('failed: ' + label);
  }
}

function hasEncoder(name) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-encoders'], { encoding: 'utf8' });
  return (r.stdout || '').includes(name);
}

function main() {
  if (!fs.existsSync(src)) throw new Error('Missing ' + src);
  fs.rmSync(work, { recursive: true, force: true });
  fs.mkdirSync(work, { recursive: true });

  const vEnc = hasEncoder('h264_nvenc')
    ? ['-c:v', 'h264_nvenc', '-preset', 'p4', '-cq', '23', '-b:v', '0']
    : hasEncoder('libx264')
      ? ['-c:v', 'libx264', '-preset', 'fast', '-crf', '20']
      : ['-c:v', 'mpeg4', '-q:v', '5'];

  const parts = [];
  clips.forEach((c, i) => {
    const part = path.join(work, `p${String(i).padStart(2, '0')}_${c.label}.mp4`);
    // Scale to 1080p landscape for compact share; contain within 16:9
    run(
      'ffmpeg',
      [
        '-y',
        '-ss',
        String(c.ss),
        '-i',
        src,
        '-t',
        String(c.d),
        '-vf',
        'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=30',
        ...vEnc,
        '-c:a',
        'aac',
        '-b:a',
        '160k',
        '-ar',
        '44100',
        '-ac',
        '2',
        '-movflags',
        '+faststart',
        part,
      ],
      `${c.label} ${c.d}s @${c.ss}s`
    );
    parts.push(part);
  });

  const listFile = path.join(work, 'concat.txt');
  fs.writeFileSync(
    listFile,
    parts.map((p) => `file '${p.replace(/\\/g, '/')}'`).join('\n')
  );

  run(
    'ffmpeg',
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

  fs.rmSync(work, { recursive: true, force: true });

  console.log(
    JSON.stringify(
      {
        out,
        durationSec: Math.round(dur * 100) / 100,
        mb: Math.round((size / 1024 / 1024) * 100) / 100,
        resolution: `${stream.width}x${stream.height}`,
        clips: clips.map((c) => `${c.label}@${c.ss}+${c.d}s`),
        analysisId: '15c0b4c5-0cab-42bf-b22b-745db62db078',
        note: 'Higgsfield analysis → local ffmpeg cut (original footage)',
      },
      null,
      2
    )
  );
}

main();
