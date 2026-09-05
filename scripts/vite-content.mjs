// Vite plugin: fills {{ page.path.to.key }} placeholders in the HTML pages from src/content/*.json.
//   {{ site.nav.order }}          → "Order"            (site.json is available on every page)
//   {{ home.how.steps.0.title }}  → arrays by index
// Values are inserted as-is, so simple HTML such as <strong> works. A placeholder with no
// matching key fails the build with the key named, so a typo never ships as a blank.
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const DIR = resolve(import.meta.dirname, '../src/content');
const load = () => Object.fromEntries(readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => [f.replace(/\.json$/, ''), JSON.parse(readFileSync(join(DIR, f), 'utf8'))]));
const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

export default function content() {
  let server;
  return {
    name: 'pratus-content',
    configureServer(s) {
      server = s;
      s.watcher.add(DIR);
      s.watcher.on('change', (file) => { if (file.startsWith(DIR)) s.ws.send({ type: 'full-reload' }); });
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const data = load();
        const missing = [];
        const out = html.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (m, path) => {
          const v = get(data, path);
          if (v === undefined) { missing.push(path); return m; }
          return String(v);
        });
        if (missing.length) {
          const msg = `Copy missing for ${ctx.filename.split('/').pop()}: ${missing.join(', ')} (check the keys in src/content/)`;
          if (server) server.ws.send({ type: 'error', err: { message: msg, stack: '' } });
          throw new Error(msg);
        }
        return out;
      },
    },
  };
}
