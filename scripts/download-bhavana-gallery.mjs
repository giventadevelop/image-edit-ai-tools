/**
 * One-off: downloads full-size gallery images from bhavanastudios.com/gallery/
 * into public/images/Roy_and_Bindu_hero_movie_section/Films/
 * Run: node scripts/download-bhavana-gallery.mjs
 */
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/images/Roy_and_Bindu_hero_movie_section/Films');

const BASE = 'https://bhavanastudios.com/wp-content/uploads/2023/10/';
const FILES = [
  'DSC01169-1-1536x1024-1.jpg',
  'DSC02286-1536x1024-1.jpg',
  'DSC03207-1536x1024-1.jpg',
  'DSC03784-1536x1024-1.jpg',
  'DSC04954-1536x1024-1.jpg',
  'DSC06352-1536x1024-1.jpg',
  '57A8489-scaled-e1680197651191-768x1151-1.jpg',
  '57A9222-scaled-e1680197665836-768x1151-1.jpg',
  '57A9964-scaled-e1680197680257-768x1151-1.jpg',
  '57A3899-scaled-e1680197695607-768x1151-1.jpg',
  '57A6356-1536x1025-1.jpg',
  'SPR9622-1536x1025-1.jpg',
  'SPR4264-1536x1025-1.jpg',
  'SPR8754-1536x1025-1.jpg',
  'DSC00191-1.jpg',
  'DSC00664-2.jpg',
  '01-2.jpeg',
  '03-2.jpeg',
  '11-2-1.jpeg',
  '12-2.jpeg',
  '13-2.jpeg',
  '00-2.jpeg',
  'DSC07469-1.jpg',
  '5.jpg',
  'IMG_2020-2.jpg',
  'DSC07109-1.jpg',
  'DSC07260-2.jpg',
  'DSC00674-2.jpg',
  '4.jpg',
  '3.jpg',
  '2.jpg',
  '1.jpg',
  '6.jpg',
  '7.jpg',
  '9.jpg',
];

await mkdir(OUT, { recursive: true });

for (const name of FILES) {
  const url = BASE + name;
  const dest = join(OUT, name);
  const res = await fetch(url);
  if (!res.ok) {
    console.error('FAIL', res.status, url);
    process.exitCode = 1;
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  console.log('OK', name, buf.length);
}
