import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--hide-scrollbars'] });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shoot = async (path, name, opts = {}) => {
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  if (opts.seed) await p.evaluateOnNewDocument(() => localStorage.setItem('pratus-cart', JSON.stringify([{ slug: 'thepla', qty: 2 }])));
  p.on('pageerror', (e) => console.log('  PAGE ERROR:', e.message));
  await p.goto('http://localhost:5173' + path, { waitUntil: 'networkidle0' }); await sleep(2500);
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  const H = await p.evaluate(() => document.body.scrollHeight);
  const over = await p.evaluate(() => { const w = document.documentElement.clientWidth; return [...document.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect(); return r.right > w + 1 && getComputedStyle(e).position !== 'fixed'; }).slice(0, 12).map((e) => e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0] + ' right=' + Math.round(e.getBoundingClientRect().right)); });
  console.log(name, 'height', H, 'docWidth', await p.evaluate(() => document.documentElement.scrollWidth), 'overflowing:', over.join(' | ') || 'none');
  let i = 0;
  for (let y = 0; y < H; y += 844) { await p.evaluate((y) => scrollTo(0, y), y); await sleep(250); await p.screenshot({ path: `qa/mobile/${name}-${String(i++).padStart(2, '0')}.png` }); }
  await p.close();
};
await shoot('/', 'home');
await shoot('/product.html?p=thepla', 'pdp');
await shoot('/checkout.html', 'checkout', { seed: true });
await b.close();
