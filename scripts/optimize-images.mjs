// Resizes the raw camera JPGs in ../Website Photos into web-ready WebP.
// Run: npm run images            (everything)
//      npm run images -- cards   (just the three lineup card photos)
//      npm run images -- gallery (just the product-page galleries)
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC = path.resolve('..');
const OUT = path.resolve('public/img');

// [output name, source path, max width(s)]
const IMAGES = [
  ['hero',            'Website Photos/Pratiti and products/DSC_0560.JPG', [2400, 1200]],  // the exact shot behind Main hero.png
  ['hero-alt',        'Website Photos/Pratiti and products/DSC_0543.JPG', [2400]],
  ['paneer-hero',     'Website Photos/Pratiti and products/DSC_0593.JPG', [2400]],
  ['rotli-hero',      'Website Photos/Rotli/Best/DSC_0371.JPG', [2400]],
  ['thepla-hero',     'Website Photos/Thepla/Thepla product page hero/DSC_0166.JPG', [2400]],
  ['life-bleachers',  'Website Photos/carousel images maybe for hero/Best/DSC_0516.JPG', [1600]],
  ['life-net',        'Website Photos/carousel images maybe for hero/Best/DSC_0656.JPG', [1600]],
  ['life-turf',       'Website Photos/carousel images maybe for hero/Best/DSC_0138.JPG', [1600]],
  ['life-racket',     'Website Photos/Pratiti and products/Pratit and Rotli Tennsi.JPG', [1600]],
  ['life-blacktop',   'Website Photos/all products/all products on black top.JPG', [1600]],
  ['life-track',      'Website Photos/Rotli/Rotli on Track/DSC_0010.JPG', [1600]],
  ['founder',         'Website Photos/Pratiti and products/DSC_0569.JPG', [1600]],
  ['founder-popup',   'Pratus/Images/Picture of founder.png', [1200]],
  ['thepla-closeup',  'IMG_2727_website.webp', [1200]],
];

/* ---- Lineup card photos: the pouch is the subject, framed by rule (DESIGN.md §10) ----
   Every card photo is cut to the card media box (1.13:1) with the pouch centred
   horizontally, its centre at 45% of the height and its height 55% of the frame, so the
   three products read at the same size on the deck. `box` is the pouch's bounding box as
   fractions of the oriented source. Where the crop runs off the photo the edge is
   mirrored (grass / concrete swallow it). */
const FRAME = { aspect: 1.13, pouchH: 0.55, cx: 0.5, cy: 0.45 };
const CARDS = [
  ['paneer-card', 'Website Photos/Paneer Parata/Best/DSC_0603.JPG',            { x0: 0.530, x1: 0.770, y0: 0.0875, y1: 0.5875 }],
  ['rotli-card',  'Website Photos/Rotli/Rotli product page hero/DSC_0172.JPG', { x0: 0.500, x1: 0.708, y0: 0.2125, y1: 0.6625 }],
  // The thepla JPG carries an EXIF orientation that turns the pouch on its side; the sensor frame is the upright one.
  ['thepla-card', 'Website Photos/Thepla/Best/DSC_0164.JPG',                   { x0: 0.344, x1: 0.628, y0: 0.308,  y1: 0.867 }, { rotate: false }],
];
async function frameCard(input, box, out, { rotate = true, width = 1400 } = {}) {
  let img = sharp(input); if (rotate) img = img.rotate();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const px = (box.x0 + box.x1) / 2 * W, py = (box.y0 + box.y1) / 2 * H, ph = (box.y1 - box.y0) * H;
  const ch = Math.round(ph / FRAME.pouchH), cw = Math.round(ch * FRAME.aspect);
  const left = Math.round(px - FRAME.cx * cw), top = Math.round(py - FRAME.cy * ch);
  const ext = { left: Math.max(0, -left), top: Math.max(0, -top), right: Math.max(0, left + cw - W), bottom: Math.max(0, top + ch - H) };
  let s = sharp(data, { raw: { width: W, height: H, channels: info.channels } });
  if (ext.left || ext.top || ext.right || ext.bottom) { // sharp runs extract before extend, so extend in its own pass
    const e = await s.extend({ ...ext, extendWith: 'mirror' }).raw().toBuffer({ resolveWithObject: true });
    s = sharp(e.data, { raw: { width: e.info.width, height: e.info.height, channels: e.info.channels } });
  }
  await s.extract({ left: left + ext.left, top: top + ext.top, width: cw, height: ch })
    .resize({ width }).webp({ quality: 82 }).toFile(out);
}

/* ---- Product-page galleries: six shots per product, kept at their own 3:2 / 2:3 ratio.
   Longest side 1600 (so landscape 1600×1067, portrait 1067×1600). Order = order on the page. */
const GALLERY = {
  paneer: ['Paneer Parata/Best/DSC_0603.JPG', 'Paneer Parata/DSC_0143.JPG', 'Paneer Parata/paneer paratha.JPG', 'Z. Maybe/DSC_0083.JPG', 'Paneer Parata/DSC_0149.JPG', 'Pratiti and products/DSC_0593.JPG'],
  rotli:  ['Rotli/Best/DSC_0371.JPG', 'Rotli/DSC_0154.JPG', 'Rotli/Rotli and tennis.JPG', 'Rotli/Rotli product page hero/DSC_0172.JPG', 'Rotli/Rotli on Track/DSC_0020.JPG', 'Z. Maybe/DSC_0207.JPG'],
  thepla: ['Thepla/Thepla product page hero/DSC_0166.JPG', 'Thepla/Thepla.JPG', 'Thepla/thepla product shots/DSC_0186.JPG', 'Z. Maybe/DSC_0096.JPG', 'Rotli/Rotli on Track/DSC_0038.JPG', 'Thepla/thepla product shots/DSC_0196.JPG'],
};
await mkdir(OUT, { recursive: true });
if (process.argv[2] === 'gallery' || !process.argv[2]) {
  for (const [key, files] of Object.entries(GALLERY)) {
    for (let i = 0; i < files.length; i++) {
      const out = path.join(OUT, `${key}-g${i + 1}.webp`);
      const info = await sharp(path.join(SRC, 'Website Photos', files[i])).rotate()
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
      console.log('✓', path.basename(out), `${info.width}x${info.height}`);
    }
  }
  if (process.argv[2] === 'gallery') process.exit(0);
}
for (const [name, rel, box, opts] of CARDS) {
  await frameCard(path.join(SRC, rel), box, path.join(OUT, `${name}.webp`), opts);
  console.log('✓', `${name}.webp`);
}
if (process.argv[2] === 'cards') process.exit(0);

for (const [name, rel, widths] of IMAGES) {
  for (const w of widths) {
    const suffix = widths.length > 1 ? `-${w}` : '';
    const out = path.join(OUT, `${name}${suffix}.webp`);
    await sharp(path.join(SRC, rel)).rotate().resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 80 }).toFile(out);
    console.log('✓', path.basename(out));
  }
}
// Loader: the real thepla (IMG_2727), square-cropped on the disc (centre 49%/50%, radius 47% of width)
{
  const src = sharp(path.join(SRC, 'IMG_2727_website.webp'));
  const { width, height } = await src.metadata();
  const top = Math.round(height * 0.498 - width / 2);
  await src.extract({ left: 0, top, width, height: width }).resize(480, 480)
    .webp({ quality: 82 }).toFile(path.join(OUT, 'thepla-loader.webp'));
  console.log('✓ thepla-loader.webp');
}
// Food spread keeps transparency
await sharp(path.join(SRC, 'Pratus/picture of all the food.png')).resize({ width: 1600 })
  .webp({ quality: 85 }).toFile(path.join(OUT, 'food-spread.webp'));
console.log('✓ food-spread.webp');
