// node scripts/shot.mjs <outDir> [path] [w] [h] [sections...]
import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';
const [OUT = 'qa', PATH = '/', W = '1440', H = '900', ...SECTIONS] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await mkdir(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--hide-scrollbars', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
await page.setViewport({ width: +W, height: +H, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('  PAGE ERROR:', e.message));
page.on('console', (m) => m.type() === 'error' && console.log('  console.error:', m.text()));
page.on('requestfailed', (r) => console.log('  REQ FAILED:', r.url()));
page.on('response', (r) => r.status() >= 400 && console.log('  HTTP', r.status(), r.url()));
await page.goto('http://localhost:5173' + PATH, { waitUntil: 'networkidle0' });
await sleep(4500);
const name = PATH.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home';
await page.screenshot({ path: `${OUT}/${name}-top.png` });
await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
const total = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < total; y += Math.round(+H * 0.6)) { await page.evaluate((y) => scrollTo(0, y), y); await sleep(150); }
await sleep(1200);
for (const id of SECTIONS) {
  await page.evaluate((id) => document.getElementById(id)?.scrollIntoView({ block: 'start' }), id);
  await sleep(900);
  await page.screenshot({ path: `${OUT}/${name}-${id}.png` });
}
await page.evaluate(() => scrollTo(0, 0)); await sleep(300);
await page.screenshot({ path: `${OUT}/${name}-full.png`, fullPage: true });
await browser.close();
console.log('done', name);
