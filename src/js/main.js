import { gsap, reduced, animate } from './motion.js';
import { PRODUCTS, money, asset } from './products.js';
import { initNav, toast } from './nav.js';
import { api, apiEnabled } from './api.js';
import home from '../content/home.json';
import site from '../content/site.json';

/* ---- Nav (burger, section highlight, cart badge, account menu) ---- */
initNav();

/* ---- Loader → hero intro --------------------------------------------- */
// A thepla gets eaten bite by bite while the hero photo and fonts load, then
// everything eases in: the photo settles from a slight zoom, the letters drop
// in, the tagline and scroll cue follow. Calm, no slam, no ripple.
const hero = document.querySelector('.hero');
const loader = document.querySelector('.loader');
const pills = document.querySelectorAll('.nav .pill');
const heroPhoto = hero?.querySelector('.hero__photo');
const heroBits = hero ? [hero.querySelectorAll('.hero__wordmark span'), hero.querySelector('.hero__tag'), hero.querySelector('.hero__scroll')] : [];
if (hero) gsap.set(heroBits, { opacity: 0 });
const heroApi = {
  ready: heroPhoto ? heroPhoto.decode().catch(() => {}) : Promise.resolve(),
  play() {
    if (!hero) return;
    const [letters, tag, cue] = heroBits;
    if (reduced) { gsap.set(heroBits, { opacity: 1 }); return; }
    gsap.timeline()
      .from(heroPhoto, { scale: 1.08, duration: 2.4, ease: 'power3.out' }, 0)
      .fromTo(letters, { yPercent: -60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.05 }, 0.1)
      .fromTo(tag, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.4')
      .fromTo(cue, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.5');
    // content lifts and fades as the hero scrolls out
    gsap.to(hero.querySelector('.hero__content'), { yPercent: -18, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  },
};

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
        <div>
          <p class="card__day">${p.day}</p>
          <h3 class="card__name">${p.nameHtml}</h3>
        </div>
        <div class="card__cta">
          <span class="card__price">${money(p.price)}</span>
          <a class="btn btn--sm btn--light" href="/product.html?p=${p.slug}">${home.lineup.button}</a>
        </div>
      </div>
      <a class="card__link" href="/product.html?p=${p.slug}" aria-label="View ${p.day} ${p.name}"></a>
    </article>
    </div>`).join('');

  /* Coming back from a product page, the card you tapped is still pulled out of the stack:
     the click left it focused, and the pointer may still be over it. Every arrival (first
     load, back button, bfcache restore) drops focus and holds the deck at rest until the
     pointer actually moves again — then hover is live as normal. */
  addEventListener('pageshow', () => {
    document.activeElement?.blur?.();
    lineup.classList.add('is-resting');
    addEventListener('pointermove', () => lineup.classList.remove('is-resting'), { once: true });
  });
}

/* ---- Copy-driven blocks (src/content/home.json) ------------------------
   Steps, the story paragraphs and the comparison rows are lists, so they render
   from the content file here instead of being repeated in the HTML. */
const steps = document.querySelector('[data-steps]');
if (steps) {
  // Katie's icons, one row per step (step 2 shows both ways to heat)
  const ICONS = [['/img/how-freeze.webp'], ['/img/how-pan.webp', '/img/how-microwave.webp'], ['/img/how-track.webp']];
  steps.innerHTML = home.how.steps.map((st, i) => `
    <div class="step" data-reveal${i ? ` data-reveal-delay="${(i * 0.08).toFixed(2)}"` : ''}>
      <div class="step__head"><span class="step__num">0${i + 1}</span><span class="step__icons">${(ICONS[i] || []).map((src) => `<img src="${asset(src)}" alt="" loading="lazy" height="400">`).join('')}</span></div>
      <h3 class="step__title">${st.title}</h3><p class="step__copy">${st.copy}</p></div>`).join('');
}
const story = document.querySelector('[data-story]');
if (story) story.innerHTML = home.story.paragraphs.map((p) => `<p data-reveal>${p}</p>`).join('');
const compare = document.querySelector('[data-compare]');
if (compare) {
  const CHECK = (w) => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5l3.2 3L13 4.5"/></svg>`;
  compare.innerHTML = home.why.rows.map((row) => `
    <tr><th scope="row">${row.feature}</th>${row.them.map((yes) => (yes
      ? `<td><i class="mark mark--yes" aria-label="Yes">${CHECK(1.75)}</i></td>`
      : '<td><i class="mark mark--no" aria-label="No">&mdash;</i></td>')).join('')}<td class="is-us"><i class="mark mark--us" aria-label="Yes">${CHECK(2.75)}</i></td></tr>`).join('');
}

/* ---- Gallery arrows -------------------------------------------------- */
const track = document.querySelector('.gallery__track');
document.querySelectorAll('[data-gallery-dir]').forEach((b) =>
  b.addEventListener('click', () => {
    const w = track.firstElementChild.getBoundingClientRect().width + 12;
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

/* ---- Footer form: newsletter (posts to the API when it is configured) ------------------------------------ */
document.querySelector('.footer__form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector('input[type="email"]').value.trim();
  if (apiEnabled) {
    const btn = form.querySelector('button');
    btn.classList.add('is-busy');
    try { await api.subscribe(email, 'footer'); }
    catch { btn.classList.remove('is-busy'); toast(site.footer.joinError); return; }
    btn.classList.remove('is-busy');
  }
  toast(site.footer.joinToast);
  form.reset();
});

export { toast };
