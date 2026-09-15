import { gsap, reduced, animate, glueLastWords } from './motion.js';
import { PRODUCTS, bySlug, money } from './products.js';
import copy from '../content/product.json';
import { initNav, toast } from './nav.js';
import { cart, syncBadges } from './cart.js';
import { api, apiEnabled } from './api.js';

initNav();

const slug = new URLSearchParams(location.search).get('p') || location.hash.slice(1) || PRODUCTS[0].slug; // hash form is used by the shareable single-file build
const p = bySlug(slug) || PRODUCTS[0];
document.title = `${p.day} ${p.name} — ${copy.titleSuffix}`;

const $ = (s) => document.querySelector(s);
document.querySelector('.pdp').classList.add(`pdp--${p.key}`);

// Photos: the pack shot first, then every gallery shot; a thumbnail swaps the main image
const photos = [{ src: p.hero, alt: `${p.day} ${p.name}` }, ...(p.gallery || [])];
const main = $('[data-pdp-main]');
const thumbs = $('[data-pdp-thumbs]');
thumbs.innerHTML = photos.map((g, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-thumb="${i}"><img src="${g.src}" alt="" loading="${i < 4 ? 'eager' : 'lazy'}"></button>`).join('');
const showPhoto = (i) => {
  const g = photos[i];
  const swap = () => { main.src = g.src; main.alt = g.alt; };
  thumbs.querySelectorAll('[data-thumb]').forEach((b) => b.setAttribute('aria-selected', String(Number(b.dataset.thumb) === i)));
  if (reduced) { swap(); return; }
  gsap.to(main, { opacity: 0, duration: 0.15, ease: 'power2.in', onComplete: () => { swap(); gsap.fromTo(main, { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }); } });
};
main.src = photos[0].src; main.alt = photos[0].alt;
thumbs.addEventListener('click', (e) => { const b = e.target.closest('[data-thumb]'); if (b) showPhoto(Number(b.dataset.thumb)); });
$('[data-day]').textContent = p.day;
$('[data-name]').textContent = p.name;
$('[data-tagline]').textContent = p.tagline;
$('[data-price]').firstChild.textContent = money(p.price);
$('[data-description]').textContent = p.description;

// Macros count up from 0 when they scroll in (same [data-count] as the home-page stats)
$('[data-macros]').innerHTML = [
  [p.macros.cal, '', copy.macros.labels.cal], [p.macros.protein, 'g', copy.macros.labels.protein], [p.macros.carbs, 'g', copy.macros.labels.carbs], [p.macros.fat, 'g', copy.macros.labels.fat],
].map(([n, unit, l], i) => `<div class="macro" data-reveal data-reveal-delay="${i * 0.08}"><div class="macro__num" data-count="${n}">0${unit ? `<small>${unit}</small>` : ''}</div><div class="macro__label">${l}</div></div>`).join('');

$('[data-ingredients]').textContent = p.ingredients || '';
$('[data-heating]').innerHTML = copy.heating.steps.map((h) => `<div class="heat__item" data-reveal><b>${h.label}</b><span>${h.text}</span></div>`).join('');

$('[data-others]').innerHTML = PRODUCTS.filter((o) => o.slug !== p.slug).map((o) => `
  <a class="card card--${o.key}" href="/product.html?p=${o.slug}" data-reveal>
    <div class="card__media"><img src="${o.card}" alt="" loading="lazy"></div>
    <div class="card__body">
      <div>
        <p class="card__day">${o.day}</p>
        <h3 class="card__name">${o.name}</h3>
      </div>
      <div class="card__cta"><span class="card__price">${money(o.price)}</span><span class="btn btn--sm btn--light">${copy.others.button}</span></div>
    </div>
  </a>`).join('');

// Reviews: the sample reviews plus the ones written on this page. A written review is
// pending until the owner approves it; with the API off, both live in localStorage.
// ponytail: `?demo=account` stands in for the owner (same switch as the account menu) — real
// moderation happens in the backend admin, see docs/API-CONTRACT.md → reviews.
const STARS = (n) => `<span class="stars" aria-label="${n} out of 5 stars">${'<i></i>'.repeat(5)}<b style="width:${n * 20}%">${'<i></i>'.repeat(5)}</b></span>`;
const esc = (t) => String(t).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const REV_KEY = 'pratus-reviews';
const isOwner = new URLSearchParams(location.search).get('demo') === 'account';
const local = { // reviews written in this browser: { [slug]: [{ name, stars, title, quote, status }] }
  get: () => { try { return JSON.parse(localStorage.getItem(REV_KEY) || '{}')[p.slug] || []; } catch { return []; } },
  set: (list) => { const all = JSON.parse(localStorage.getItem(REV_KEY) || '{}'); all[p.slug] = list; localStorage.setItem(REV_KEY, JSON.stringify(all)); },
};
const renderReviews = () => {
  const mine = local.get();
  const reviews = [...mine.filter((r) => r.status === 'approved'), ...(p.reviews || [])];
  const shown = [...mine.filter((r) => r.status === 'pending'), ...reviews]; // the author (and the owner) still sees a pending one
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.stars, 0) / reviews.length : 0;
  $('[data-rev-avg]').textContent = avg.toFixed(1);
  $('[data-rev-stars]').innerHTML = STARS(avg);
  $('[data-rev-count]').textContent = `${reviews.length} ${copy.reviews.countLabel}`;
  $('[data-rev-bars]').innerHTML = [5, 4, 3, 2, 1].map((n) => {
    const pct = reviews.length ? Math.round(100 * reviews.filter((r) => r.stars === n).length / reviews.length) : 0;
    return `<li><span>${n} ${copy.reviews.starLabel}${n === 1 ? '' : 's'}</span><i style="--w:${pct}%"></i><span>${pct}%</span></li>`;
  }).join('');
  $('[data-reviews]').innerHTML = shown.map((r, i) => `
    <article class="review${r.status === 'pending' ? ' review--pending' : ''}" data-reveal data-reveal-delay="${(i * 0.08).toFixed(2)}">
      <p class="review__by"><b>${esc(r.name)}</b>${r.status === 'pending' ? `<span class="chip chip--ink">${copy.reviews.pending}</span>` : ''}</p>
      ${STARS(r.stars)}
      <h3 class="review__title">${esc(r.title)}</h3>
      <div><p class="review__quote">${esc(r.quote)}</p>${r.status === 'pending' && isOwner ? `<p class="review__mod"><button class="btn btn--sm btn--primary" type="button" data-mod="approved" data-id="${r.id}">${copy.reviews.approve}</button><button class="btn btn--sm btn--ghost" type="button" data-mod="removed" data-id="${r.id}"><span>${copy.reviews.remove}</span></button></p>` : ''}</div>
    </article>`).join('');
  animate($('[data-reviews]'));
};
renderReviews();
$('[data-reviews]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-mod]'); if (!b) return;
  local.set(local.get().flatMap((r) => (r.id !== b.dataset.id ? [r] : b.dataset.mod === 'approved' ? [{ ...r, status: 'approved' }] : [])));
  renderReviews();
});
$('[data-review-form]').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const r = Object.fromEntries(new FormData(form));
  r.stars = Number(r.stars);
  const btn = form.querySelector('button[type="submit"]');
  btn.classList.add('is-busy');
  try {
    if (apiEnabled) await api.createReview(p.slug, r);
    local.set([{ ...r, id: String(Date.now()), status: 'pending' }, ...local.get()]);
  } catch { btn.classList.remove('is-busy'); toast(copy.reviews.postError); return; }
  btn.classList.remove('is-busy');
  form.reset(); form.closest('details').open = false;
  toast(copy.reviews.thanks);
  renderReviews();
});

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
if (!reduced) {
  gsap.from('.nav .pill', { opacity: 0, y: -10, duration: 0.8, ease: 'power3.out', stagger: 0.08, clearProps: 'all' });
  gsap.from('.pdp__main', { opacity: 0, scale: 0.98, duration: 1.2, ease: 'power3.out' });
  gsap.from('.pdp__buy > *', { y: 20, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.05, delay: 0.15, clearProps: 'all' });
}
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
