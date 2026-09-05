import { gsap, reduced, animate } from './motion.js';
import { initHero } from './hero.js';
import { PRODUCTS, money } from './products.js';
import { initNav, toast } from './nav.js';

/* ---- Nav (burger, section highlight, cart badge, account menu) ---- */
initNav();

/* ---- Loader → hero intro --------------------------------------------- */
// A thepla gets eaten bite by bite while the hero texture and fonts load,
// then everything eases in. Nothing on the page simply appears.
const hero = document.querySelector('.hero');
const loader = document.querySelector('.loader');
const pills = document.querySelectorAll('.nav .pill');
const heroApi = hero ? initHero(hero) : { ready: Promise.resolve(), play() {} };

gsap.set(pills, { opacity: 0, y: -10 });
let eating;
if (loader && !reduced) {
  const bites = loader.querySelectorAll('.loader__bites circle');
  const thepla = loader.querySelector('.loader__thepla');
  eating = gsap.timeline({ repeat: -1, repeatDelay: 0.3 })
    .fromTo(bites, { attr: { r: 0 } }, { attr: { r: (i, el) => +el.dataset.r }, duration: 0.32, ease: 'back.out(1.5)', stagger: 0.17 })
    .to(thepla, { opacity: 0, scale: 0.82, duration: 0.45, ease: 'power2.in' }, '+=0.25')
    .set(thepla, { scale: 1 })
    .to(thepla, { opacity: 1, duration: 0.3, ease: 'power2.out' });
}
const minShow = new Promise((r) => setTimeout(r, reduced ? 0 : 1400));
Promise.all([heroApi.ready, document.fonts.ready, minShow]).then(() => {
  const tl = gsap.timeline();
  if (loader) {
    tl.to(loader, { opacity: 0, duration: 0.7, ease: 'power2.out', onComplete: () => { eating?.kill(); loader.remove(); } });
  }
  tl.add(() => heroApi.play(), loader ? '-=0.35' : 0)
    .to(pills, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, clearProps: 'all' }, '<0.2'); // clearProps: the mobile menu pill's own opacity/transform must win afterwards
});

/* ---- Lineup cards (rendered from data so PDP stays in sync) ---------- */
const lineup = document.querySelector('[data-lineup]');
if (lineup) {
  lineup.innerHTML = PRODUCTS.map((p) => `
    <div class="deck__slot">
    <article class="card card--${p.key}" data-reveal>
      <div class="card__media">
        <img src="${p.card}" alt="${p.day} ${p.name} pouch" loading="lazy" width="1400" height="933">
      </div>
      <div class="card__top">
        <span class="chip"><strong>${p.macros.protein}g</strong>&nbsp;protein</span>
        <span class="chip">${p.macros.cal} cal</span>
      </div>
      <div class="card__body">
        <p class="card__day">${p.day}</p>
        <h3 class="card__name">${p.name}</h3>
        <div class="card__macros">
          <span class="chip">${p.macros.carbs}g carbs</span>
          <span class="chip">${p.macros.fat}g fat</span>
          <span class="chip">Vegetarian</span>
        </div>
        <div class="card__cta">
          <span class="card__price">${money(p.price)} · 1 meal</span>
          <a class="btn btn--sm ${p.key === 'paneer' ? '' : 'btn--light'}" href="/product.html?p=${p.slug}">Shop now
            <svg class="btn__arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
          </a>
        </div>
      </div>
      <a class="card__link" href="/product.html?p=${p.slug}" aria-label="View ${p.day} ${p.name}"></a>
    </article>
    </div>`).join('');
}

/* ---- Gallery arrows -------------------------------------------------- */
const track = document.querySelector('.gallery__track');
document.querySelectorAll('[data-gallery-dir]').forEach((b) =>
  b.addEventListener('click', () => {
    const w = track.firstElementChild.getBoundingClientRect().width + 24;
    track.scrollBy({ left: Number(b.dataset.galleryDir) * w, behavior: 'smooth' });
  }));

/* ---- Reveals, split headlines, counters, no-orphan glue ----------------- */
animate();

/* ---- Story: the founder photo zooms in and drifts as you scroll -------- */
const storyImg = document.querySelector('.story__bg img');
if (storyImg && !reduced) {
  gsap.from(storyImg, { scale: 1.12, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: '.story', start: 'top 75%', once: true } });
  gsap.fromTo(storyImg, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: '.story', start: 'top bottom', end: 'bottom top', scrub: true } });
}

/* ---- Footer form (front-end only) ------------------------------------ */
document.querySelector('.footer__form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  toast('You’re on the list. Welcome to the culture.');
  e.target.reset();
});

export { toast };
