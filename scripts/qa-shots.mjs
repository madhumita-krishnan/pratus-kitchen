// QA screenshots using the locally installed Chrome (no download).
// node scripts/qa-shots.mjs [outDir] [baseUrl]
import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';

const OUT  = process.argv[2] || 'qa';
const BASE = process.argv[3] || 'http://localhost:5173';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await mkdir(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

async function shoot(path, { w, h, name, sections = [], seedCart = false }) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  if (seedCart) await page.evaluateOnNewDocument(() => localStorage.setItem('pratus-cart', JSON.stringify([{ slug: 'thepla', qty: 2 }, { slug: 'paneer-paratha', qty: 1 }])));
  page.on('pageerror', (e) => console.log('  PAGE ERROR:', e.message));
  page.on('console', (m) => m.type() === 'error' && console.log('  console.error:', m.text()));
  await page.goto(BASE + path, { waitUntil: 'networkidle0' });
  await sleep(4200); // hero intro
  await page.screenshot({ path: `${OUT}/${name}-hero.png` });
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  // walk the page so ScrollTrigger reveals fire
  const total = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < total; y += Math.round(h * 0.6)) { await page.evaluate((y) => scrollTo(0, y), y); await sleep(160); }
  await sleep(1200);
  for (const id of sections) {
    await page.evaluate((id) => document.getElementById(id)?.scrollIntoView({ block: 'start' }), id);
    await sleep(900);
    await page.screenshot({ path: `${OUT}/${name}-${id}.png` });
  }
  await page.evaluate(() => scrollTo(0, 0));
  await sleep(400);
  await page.screenshot({ path: `${OUT}/${name}-full.png`, fullPage: true });
  console.log('✓', name);
  await page.close();
}

await shoot('/', { w: 1440, h: 900, name: 'desktop', sections: ['mission', 'order', 'gallery', 'why', 'how', 'story', 'cta'] });
await shoot('/', { w: 390, h: 844, name: 'mobile', sections: ['mission', 'order', 'why', 'story'] });
await shoot('/product.html?p=thepla', { w: 1440, h: 900, name: 'pdp', sections: [] });
await shoot('/checkout.html', { w: 1440, h: 900, name: 'checkout', sections: [], seedCart: true });
await shoot('/checkout.html', { w: 390, h: 844, name: 'checkout-mobile', sections: [], seedCart: true });
await browser.close();
