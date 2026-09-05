// Builds a self-contained, single-file copy of one page for review links (Claude Artifacts).
// Everything — JS, CSS, fonts, images — is inlined; only Google Fonts stays external.
//   node scripts/build-share.mjs index   --product=<product page url>
//   node scripts/build-share.mjs product --home=<home page url>
// Output: share/<page>.html  (a body fragment with <title>/<style>/<script> at the top — no <html>/<head>/<body>)
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const page = process.argv[2];
if (!['index', 'product'].includes(page)) throw new Error('usage: build-share.mjs index|product [--home=URL] [--product=URL]');
const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || `=${d}`).split('=').slice(1).join('=');
const HOME = arg('home', '#top');
const PRODUCT = arg('product', '#');
const TITLE = arg('title', page === 'index' ? 'Pratus Kitchen Site Preview' : 'Pratus Kitchen Product Preview');

execSync(`SHARE_ENTRY=${page} npx vite build`, { stdio: 'inherit' });
const dist = path.resolve(`dist-share/${page}`);
let html = readFileSync(path.join(dist, `${page}.html`), 'utf8');

const mime = { webp: 'image/webp', otf: 'font/otf', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg' };
const dataUri = (file) => `data:${mime[path.extname(file).slice(1)]};base64,${readFileSync(file).toString('base64')}`;

// ---- pull the built css/js out of dist ----
const css = readFileSync(path.join(dist, html.match(/href="(\/assets\/[^"]+\.css)"/)[1].slice(1)), 'utf8');
let js = readFileSync(path.join(dist, html.match(/src="(\/assets\/[^"]+\.js)"/)[1].slice(1)), 'utf8');
if (/from\s*["']\.\//.test(js)) throw new Error('bundle still has a shared chunk — expected a single file');
const title = html.match(/<title>([^<]*)<\/title>/)[1];
const fonts = html.match(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/)[0];
let body = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'));

// ---- cross-page links ----
body = body.replaceAll('href="/product.html?p=', `href="${PRODUCT}#`).replaceAll('href="/#', `href="${HOME}#`).replaceAll('href="/"', `href="${HOME}"`);
js = js.replaceAll('/product.html?p=', `${PRODUCT}#`);

// ---- inline every public asset that is referenced ----
let out = `<title>${TITLE}</title>\n${fonts}\n<style>\n${css}\n</style>\n${body}\n<script type="module">\n${js}\n</script>\n`;
if (page === 'product') out += `<script>addEventListener('hashchange', () => location.reload());</script>\n`;
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(path.join(dir, f)).isDirectory() ? walk(path.join(dir, f)) : [path.join(dir, f)]));
let inlined = 0;
for (const file of walk('public')) {
  const url = '/' + path.relative('public', file).split(path.sep).join('/');
  if (!out.includes(url)) continue;
  // the home bundle carries the product data (incl. PDP hero + gallery paths) but never shows them
  if (page === 'index' && /\/img\/(paneer|rotli|thepla)-(hero|g\d)\.webp$|hero-alt/.test(url)) { out = out.replaceAll(url, ''); continue; }
  out = out.replaceAll(url, dataUri(file)); inlined++;
}
out = out.replaceAll('</script', '<\\/script').replace(/<script type="module">\n([\s\S]*?)\n<\\\/script>/, (m, code) => `<script type="module">\n${code}\n</script>`);
// (the line above re-opens only our own script tag; any '</script' inside the bundle stays escaped)
out = out.replace(/<\\\/script><script>/, '</script><script>').replace(/<\\\/script>\n$/, '</script>\n');

mkdirSync('share', { recursive: true });
writeFileSync(`share/${page}.html`, out);
console.log(`✓ share/${page}.html  ${(out.length / 1e6).toFixed(1)} MB, ${inlined} assets inlined, home=${HOME} product=${PRODUCT}`);
