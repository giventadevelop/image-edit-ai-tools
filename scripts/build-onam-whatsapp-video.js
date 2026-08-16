/**
 * Prepend Onam cover for WhatsApp thumbnail + insert ZeaHire sponsor slide
 * before final poster section. Keeps all existing video content.
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
const work = path.join(vdir, '_wa_work');
fs.mkdirSync(work, { recursive: true });

const src = path.join(vdir, 'Onam_2026_1080p.mp4');
const coverPng = path.join(dir, 'parsippany_onam_elephants_removed.png');
const zeaPng = path.join(dir, 'ZeaHire-Horizontal-002.png');
const out = path.join(vdir, 'Onam_2026_1080p_whatsapp.mp4');

function run(args, label) {
  console.log('>', label || args.slice(0, 4).join(' '));
  const r = spawnSync('ffmpeg', args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (r.status !== 0) {
    console.error(r.stderr?.slice(-2000));
    throw new Error('ffmpeg failed: ' + (label || ''));
  }
}

const vfStill =
  'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0xF5F1E8,setsar=1,fps=60,format=yuv420p';

const coverMp4 = path.join(work, 'cover.mp4');
const zeaMp4 = path.join(work, 'zeahire.mp4');
const part1 = path.join(work, 'part1.mp4');
const part2 = path.join(work, 'part2.mp4');
const part1n = path.join(work, 'part1n.mp4');
const part2n = path.join(work, 'part2n.mp4');
const list = path.join(work, 'list.txt');

run(
  [
    '-y',
    '-loop',
    '1',
    '-i',
    coverPng,
    '-f',
    'lavfi',
    '-i',
    'anullsrc=r=44100:cl=stereo',
    '-t',
    '2.5',
    '-r',
    '60',
    '-vf',
    vfStill,
    '-c:v',
    'h264_nvenc',
    '-preset',
    'p4',
    '-cq',
    '19',
    '-b:v',
    '0',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-shortest',
    coverMp4,
  ],
  'cover still'
);

run(
  [
    '-y',
    '-loop',
    '1',
    '-i',
    zeaPng,
    '-f',
    'lavfi',
    '-i',
    'anullsrc=r=44100:cl=stereo',
    '-t',
    '3',
    '-r',
    '60',
    '-vf',
    vfStill,
    '-c:v',
    'h264_nvenc',
    '-preset',
    'p4',
    '-cq',
    '19',
    '-b:v',
    '0',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-shortest',
    zeaMp4,
  ],
  'zeahire still'
);

// Insert ZeaHire just before final poster section (~39s)
run(['-y', '-i', src, '-t', '39', '-c', 'copy', part1], 'split part1');
run(['-y', '-ss', '39', '-i', src, '-c', 'copy', part2], 'split part2');

const vfNorm =
  'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=60,format=yuv420p';

run(
  [
    '-y',
    '-i',
    part1,
    '-vf',
    vfNorm,
    '-c:v',
    'h264_nvenc',
    '-preset',
    'p4',
    '-cq',
    '19',
    '-b:v',
    '0',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-ar',
    '44100',
    '-ac',
    '2',
    part1n,
  ],
  'normalize part1'
);

run(
  [
    '-y',
    '-i',
    part2,
    '-vf',
    vfNorm,
    '-c:v',
    'h264_nvenc',
    '-preset',
    'p4',
    '-cq',
    '19',
    '-b:v',
    '0',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-ar',
    '44100',
    '-ac',
    '2',
    part2n,
  ],
  'normalize part2'
);

const listBody =
  "file '" +
  coverMp4.replace(/\\/g, '/') +
  "'\nfile '" +
  part1n.replace(/\\/g, '/') +
  "'\nfile '" +
  zeaMp4.replace(/\\/g, '/') +
  "'\nfile '" +
  part2n.replace(/\\/g, '/') +
  "'\n";
fs.writeFileSync(list, listBody);

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
    '10M',
    '-maxrate',
    '14M',
    '-bufsize',
    '28M',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-movflags',
    '+faststart',
    '-pix_fmt',
    'yuv420p',
    out,
  ],
  'final concat'
);

const mb = (fs.statSync(out).size / (1024 * 1024)).toFixed(2);
console.log(JSON.stringify({ out, mb: Number(mb), under150: Number(mb) < 150 }, null, 2));
