// Build guard: every /img, /fonts, /brand path the pages reference must exist in public/, and the
// hero photo must be the pre-cropped 16:9 asset (its framing lives in the file, not in CSS).
// Runs before `vite build` (package.json → prebuild). Exit 1 on the first problem so a copy of
// the site taken without its images can never ship quietly.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? (f === 'node_modules' || f.startsWith('dist') || f === 'share' || f === 'qa' ? [] : walk(p)) : [p]; });
const sources = walk(root).filter((f) => ['.html', '.js', '.css'].includes(extname(f)) && !f.includes('/scripts/') && !f.includes('vendor-gsap'));
const refs = new Set();
for (const f of sources) for (const m of readFileSync(f, 'utf8').matchAll(/["'(]\/(img|fonts|brand)\/([\w.-]+)/g)) refs.add(`${m[1]}/${m[2]}`);
const missing = [...refs].filter((r) => !existsSync(join(root, 'public', r)));
if (missing.length) { console.error(`✖ check-assets: referenced but not in public/:\n  ${missing.join('\n  ')}`); process.exit(1); }
for (const hero of ['img/hero-1200.webp', 'img/hero-2400.webp']) {
  const { width, height } = await sharp(join(root, 'public', hero)).metadata();
  if (Math.abs(width / height - 16 / 9) > 0.01) { console.error(`✖ check-assets: ${hero} is ${width}×${height}, not 16:9 — regenerate it with \`npm run images\` (the crop lives in optimize-images.mjs)`); process.exit(1); }
}
console.log(`✓ check-assets: ${refs.size} referenced files present, hero is 16:9`);
