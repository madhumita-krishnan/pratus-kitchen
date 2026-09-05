import { gsap, reduced, animate, glueLastWords } from './motion.js';
import { PRODUCTS, bySlug, money } from './products.js';
import copy from '../content/product.json';
import { initNav, toast } from './nav.js';
import { cart, syncBadges } from './cart.js';

initNav();

const slug = new URLSearchParams(location.search).get('p') || location.hash.slice(1) || PRODUCTS[0].slug; // hash form is used by the shareable single-file build
const p = bySlug(slug) || PRODUCTS[0];
document.title = `${p.day} ${p.name} — ${copy.titleSuffix}`;

const $ = (s) => document.querySelector(s);
const hero = $('.pdp-hero');
hero.classList.add(`pdp-hero--${p.key}`);
$('.pdp-hero__img').src = p.hero;
$('.pdp-hero__img').alt = `${p.day} ${p.name}`;
$('[data-day]').textContent = p.day;
$('[data-name]').textContent = p.name;
$('[data-tagline]').textContent = p.tagline;
$('[data-price]').firstChild.textContent = money(p.price);
$('[data-description]').textContent = p.description;

// Macros count up from 0 when they scroll in (same [data-count] as the home-page stats)
$('[data-macros]').innerHTML = [
  [p.macros.cal, '', copy.macros.labels.cal], [p.macros.protein, 'g', copy.macros.labels.protein], [p.macros.carbs, 'g', copy.macros.labels.carbs], [p.macros.fat, 'g', copy.macros.labels.fat],
].map(([n, unit, l], i) => `<div class="macro" data-reveal data-reveal-delay="${i * 0.08}"><div class="macro__num" data-count="${n}">0${unit ? `<small>${unit}</small>` : ''}</div><div class="macro__label">${l}</div></div>`).join('');

$('[data-heating]').innerHTML = copy.heating.steps.map((h) => `<div class="heat__item" data-reveal><b>${h.label}</b><span>${h.text}</span></div>`).join('');

$('[data-others]').innerHTML = PRODUCTS.filter((o) => o.slug !== p.slug).map((o) => `
  <a class="card card--${o.key}" href="/product.html?p=${o.slug}" data-reveal>
    <div class="card__media"><img src="${o.card}" alt="" loading="lazy"></div>
    <div class="card__body">
      <p class="card__day">${o.day}</p>
      <h3 class="card__name">${o.name}</h3>
      <div class="card__cta"><span class="card__price">${money(o.price)}</span><span class="btn btn--sm ${o.key === 'paneer' ? '' : 'btn--light'}">${copy.others.button}</span></div>
    </div>
  </a>`).join('');

// quantity + add to cart (cart.js persists it; checkout.html reads it)
let qty = 1;
const out = $('.qty output');
$('[data-qty="-1"]').addEventListener('click', () => { qty = Math.max(1, qty - 1); out.value = qty; });
$('[data-qty="1"]').addEventListener('click', () => { qty += 1; out.value = qty; });
$('[data-add]').addEventListener('click', () => {
  cart.add(p.slug, qty);
  syncBadges(true);
  toast(`${qty} × ${p.day} ${p.shortName} ${copy.addedToast} <a href="/checkout.html">${copy.checkoutLink}</a>`, true);
});

// intro — everything eases in
gsap.from('.nav .pill', { opacity: 0, y: -10, duration: 0.8, ease: 'power3.out', stagger: 0.08, clearProps: 'all' });
gsap.from('.pdp-hero__name', { yPercent: 30, opacity: 0, duration: 1, ease: 'power4.out', delay: 0.1 });
gsap.from('.pdp-hero__img', { scale: 1.08, duration: 1.6, ease: 'power3.out' });
gsap.from(['.pdp-hero__tagline', '.pdp-hero__buy'], { y: 24, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, delay: 0.3 });
// reveals, counters, no-orphan glue
animate();

/* ---- Gallery: an editorial showcase of every shot ----------------------------
   The stage is native scroll (trackpad, finger, keyboard) plus mouse drag with a
   "Drag" cursor pill. The bar underneath follows it: hairline progress, index,
   caption, count. Slides drift a little as they pass (parallax) and scale in on
   entry. Tap a slide to open the same list in the lightbox. */
const shots = p.gallery || [];
const track = $('[data-gallery]');
const pad2 = (n) => String(n).padStart(2, '0');
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
if (track && shots.length) {
  track.innerHTML = shots.map((g, i) => `
    <figure class="pgal__item" style="--ratio: ${g.w} / ${g.h}" role="group" aria-label="Photo ${i + 1} of ${shots.length}">
      <button type="button" class="pgal__open" data-gal-open="${i}" aria-label="Open photo ${i + 1} of ${shots.length}: ${g.alt}">
        <img src="${g.src}" alt="${g.alt}" width="${g.w}" height="${g.h}" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async">
      </button>
    </figure>`).join('');
  $('[data-gal-total]').textContent = pad2(shots.length);
  const stage = track.parentElement;
  const items = [...track.children];
  const imgs = items.map((el) => el.querySelector('img'));
  const bar = $('[data-gal-progress]');
  const capEl = $('[data-gal-cap]'), descEl = $('[data-gal-desc]'), idxEl = $('[data-gal-idx]');
  const padLeft = () => parseFloat(getComputedStyle(track).paddingLeft);
  let current = -1, settling = 0, raf = 0;

  // caption bar: index + name + description cross-fade to the active slide
  const setCurrent = (i) => {
    if (i === current) return;
    current = i;
    const g = shots[i];
    $('[data-gal-cur]').textContent = pad2(i + 1);
    const swap = () => { idxEl.textContent = pad2(i + 1); capEl.textContent = g.cap; descEl.textContent = g.alt; glueLastWords(descEl); };
    if (reduced) { swap(); return; }
    gsap.to([idxEl, capEl, descEl], { y: -6, opacity: 0, duration: 0.16, ease: 'power2.in', overwrite: true, onComplete: () => {
      swap(); gsap.fromTo([idxEl, capEl, descEl], { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: 'power3.out', stagger: 0.04 });
    } });
  };
  // progress hairline follows the scroll position continuously; photos drift as they pass the centre
  const paint = () => {
    const max = track.scrollWidth - track.clientWidth;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, track.scrollLeft / max)) : 1})`;
    if (reduced) return;
    const mid = innerWidth / 2;
    items.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      if (r.right < -200 || r.left > innerWidth + 200) return;
      const t = Math.max(-1, Math.min(1, (r.left + r.width / 2 - mid) / innerWidth));
      imgs[i].style.transform = `translate3d(${(-t * 6).toFixed(2)}%, 0, 0) scale(1.14)`;
    });
  };
  const nearest = () => { const x = track.scrollLeft + padLeft(); let best = 0, d = Infinity; items.forEach((el, i) => { const dd = Math.abs(el.offsetLeft - x); if (dd < d) { d = dd; best = i; } }); return best; };
  const goTo = (i) => {
    i = Math.max(0, Math.min(shots.length - 1, i));
    track.scrollTo({ left: items[i].offsetLeft - padLeft(), behavior: reduced ? 'auto' : 'smooth' });
    setCurrent(i);
    clearTimeout(settling); settling = setTimeout(() => { settling = 0; }, 700); // ignore our own scroll while it settles
  };
  track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { paint(); if (!settling) setCurrent(nearest()); }); }, { passive: true });
  addEventListener('resize', paint, { passive: true });
  document.querySelectorAll('[data-gal-dir]').forEach((b) => b.addEventListener('click', () => goTo(current + Number(b.dataset.galDir))));
  setCurrent(0); paint();

  // mouse drag → scroll (touch already scrolls natively). A drag never counts as a click.
  let drag = null, dragged = false;
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag = { x: e.clientX, left: track.scrollLeft, t: performance.now(), v: 0 }; dragged = false;
  });
  track.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!dragged && Math.abs(dx) < 6) return;
    if (!dragged) { dragged = true; track.classList.add('is-dragging'); stage.classList.add('is-dragging'); track.setPointerCapture(e.pointerId); }
    const now = performance.now(); const left = drag.left - dx;
    drag.v = (left - track.scrollLeft) / Math.max(1, now - drag.t); drag.t = now;
    track.scrollLeft = left;
  });
  const endDrag = () => {
    if (!drag) return;
    const wasDrag = dragged; const v = drag.v; drag = null;
    stage.classList.remove('is-dragging');
    if (!wasDrag) return;
    // settle on the nearest slide, nudged the way the pointer was moving
    const x = track.scrollLeft + padLeft();
    let target = nearest();
    if (v > 0.35) target = items.findIndex((el) => el.offsetLeft > x + 2);
    else if (v < -0.35) { target = -1; items.forEach((el, i) => { if (el.offsetLeft < x - 2) target = i; }); }
    if (target < 0) target = nearest();
    goTo(target);
    setTimeout(() => track.classList.remove('is-dragging'), 720); // snap comes back once the scroll has settled
  };
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
  track.addEventListener('lostpointercapture', endDrag);
  track.addEventListener('click', (e) => { if (dragged) { e.preventDefault(); e.stopPropagation(); dragged = false; } }, true);
  track.addEventListener('dragstart', (e) => e.preventDefault());

  // "Drag" cursor pill over the stage (fine pointers only)
  if (fine && !reduced) {
    const cur = stage.querySelector('.pgal__cursor');
    const qx = gsap.quickTo(cur, 'x', { duration: 0.35, ease: 'power3.out' });
    const qy = gsap.quickTo(cur, 'y', { duration: 0.35, ease: 'power3.out' });
    stage.addEventListener('pointerenter', (e) => { gsap.set(cur, { x: e.clientX, y: e.clientY }); stage.classList.add('has-cursor'); });
    stage.addEventListener('pointermove', (e) => { qx(e.clientX); qy(e.clientY); });
    stage.addEventListener('pointerleave', () => stage.classList.remove('has-cursor'));
  }

  // entry: the first slides rise and their photos settle from a slight zoom, staggered
  if (!reduced) {
    const first = items.slice(0, 3);
    gsap.from(first, { y: 40, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.09, scrollTrigger: { trigger: track, start: 'top 85%', once: true } });
    gsap.from(first.map((el) => el.querySelector('.pgal__open')), { scale: 1.12, duration: 1.8, ease: 'power3.out', stagger: 0.09, scrollTrigger: { trigger: track, start: 'top 85%', once: true } });
  }

  /* Lightbox */
  const lb = $('[data-lightbox]');
  const lbImg = $('[data-lb-img]');
  let lbIndex = 0, lastFocus = null;
  const show = (i, dir = 0) => {
    lbIndex = (i + shots.length) % shots.length;
    const g = shots[lbIndex];
    const swap = () => { lbImg.src = g.src; lbImg.alt = g.alt; lbImg.width = g.w; lbImg.height = g.h; $('[data-lb-cap]').textContent = g.cap; $('[data-lb-count]').textContent = `${lbIndex + 1} / ${shots.length}`; };
    if (reduced || !dir) { swap(); return; }
    gsap.to(lbImg, { x: -24 * dir, opacity: 0, duration: 0.18, ease: 'power2.in', onComplete: () => { swap(); gsap.fromTo(lbImg, { x: 24 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }); } });
  };
  const openLb = (i) => {
    lastFocus = document.activeElement;
    show(i);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    $('[data-lb-close]').focus();
    if (!reduced) {
      gsap.fromTo(lb, { opacity: 0 }, { opacity: 1, duration: 0.32, ease: 'power2.out' });
      gsap.fromTo(lbImg, { scale: 0.96, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' });
    }
  };
  const closeLb = () => {
    const done = () => { lb.hidden = true; document.body.style.overflow = ''; goTo(lbIndex); lastFocus?.focus?.(); };
    reduced ? done() : gsap.to(lb, { opacity: 0, duration: 0.24, ease: 'power2.in', onComplete: done });
  };
  track.addEventListener('click', (e) => { const b = e.target.closest('[data-gal-open]'); if (b) openLb(Number(b.dataset.galOpen)); });
  $('[data-lb-close]').addEventListener('click', closeLb);
  lb.querySelectorAll('[data-lb-dir]').forEach((b) => b.addEventListener('click', () => show(lbIndex + Number(b.dataset.lbDir), Number(b.dataset.lbDir))));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowRight') show(lbIndex + 1, 1);
    if (e.key === 'ArrowLeft') show(lbIndex - 1, -1);
  });
  // swipe between photos on touch
  let sx = null;
  lb.addEventListener('pointerdown', (e) => { sx = e.clientX; });
  lb.addEventListener('pointerup', (e) => { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 48) show(lbIndex - Math.sign(dx), -Math.sign(dx)); });
}
