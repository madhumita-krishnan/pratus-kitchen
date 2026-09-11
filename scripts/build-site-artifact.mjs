// Builds the whole site (home, product, checkout) with relative paths into dist-share/site,
// for publishing as ONE multi-file review link. Root-relative paths ("/img/x.webp", "/product.html")
// become relative ("img/x.webp", "product.html") so the pages work under any base URL.
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

execSync('SHARE_ALL=1 npx vite build', { stdio: 'inherit' });
const dist = 'dist-share/site';
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const files = walk(dist);
let n = 0;
for (const f of files) {
  if (!['.html', '.js', '.css'].includes(extname(f))) continue;
  const before = readFileSync(f, 'utf8');
  const after = before
    .replace(/(["'(])\/(img|fonts|brand|assets)\//g, '$1$2/')
    .replace(/(["'])\/(product|checkout)\.html/g, '$1$2.html')
    .replace(/href="\/#/g, 'href="index.html#')
    .replace(/href="\/"/g, 'href="index.html"');
  if (after !== before) { writeFileSync(f, after); n++; }
}
// The artifact host wraps the main page in its own <html><head><body> skeleton, so index.html
// ships as a fragment: everything that was in <head> and <body>, minus the wrapper tags.
const idx = join(dist, 'index.html');
writeFileSync(idx, readFileSync(idx, 'utf8').replace(/<!doctype[^>]*>|<\/?html[^>]*>|<\/?head>|<\/?body[^>]*>/gi, '').trim() + '\n');
const left = files.filter((f) => ['.html', '.js', '.css'].includes(extname(f))).flatMap((f) => (readFileSync(f, 'utf8').match(/["'(]\/(img|fonts|brand|assets|product|checkout|#)[^"')]*/g) || []).map((m) => `${f}: ${m}`));
console.log(`✓ ${dist}: ${files.length} files, ${n} rewritten${left.length ? `\n  still root-relative:\n  ${left.join('\n  ')}` : ''}`);
console.log(JSON.stringify(files.map((f) => f.slice(dist.length + 1))));
