// Nav behaviour shared by every page: burger menu, section highlight, cart badge, account menu.
import { gsap, reduced } from './motion.js';
import { cart, syncBadges } from './cart.js';
import site from '../content/site.json';

export function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  /* ---- Every page opens at the top (unless it was asked for an anchor) -------------------
     The review link's host injects a runtime that stores the last scroll position under ONE
     sessionStorage key for the whole artifact and restores it on whichever page loads next,
     retrying on `load` — so a product page opened from a scrolled home page landed mid-page.
     Zero the key before it re-reads it, scroll up now and again after its retry, and turn off
     the browser's own restoration so reload and back behave the same everywhere. */
  if (!location.hash) {
    history.scrollRestoration = 'manual';
    try { sessionStorage.setItem('__frame_scroll', '{"y":0}'); } catch { /* storage blocked: the scrollTo below still runs */ }
    scrollTo(0, 0);
    addEventListener('load', () => scrollTo(0, 0), { once: true });
  }

  /* ---- Anchors on another page ("Our story" from a product page) ---------------------------
     Remember the target on click and scroll to it once the home page has rendered: the
     review link's host drops the hash on the way, and the JS-rendered sections above the
     target would move it after the browser's own jump anyway. */
  const GOTO = 'pratus-goto';
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (a?.hash && a.pathname !== location.pathname) try { sessionStorage.setItem(GOTO, a.hash.slice(1)); } catch { /* the hash still does the job where it survives */ }
  });
  let goto = null;
  try { goto = sessionStorage.getItem(GOTO); sessionStorage.removeItem(GOTO); } catch { /* no storage */ }
  const target = document.getElementById(goto || location.hash.slice(1));
  if (target) addEventListener('load', () => target.scrollIntoView({ block: 'start', behavior: 'instant' }), { once: true });

  /* ---- Burger (phones) ---- */
  const burger = nav.querySelector('.nav__burger');
  burger?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('.nav__links a').forEach((a) => a.addEventListener('click', () => nav.classList.remove('is-open')));

  /* ---- Hide on scroll down, return on scroll up (never while the phone menu is open) ---- */
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    if (Math.abs(y - lastY) > 8 && !nav.classList.contains('is-open')) nav.classList.toggle('is-hidden', y > lastY && y > 120);
    lastY = y;
  }, { passive: true });

  /* ---- Highlight the section in view (home only) ---- */
  const sectionLinks = [...nav.querySelectorAll('.nav__links a[href^="#"]')];
  if (sectionLinks.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        sectionLinks.forEach((a) => a.classList.toggle('is-active', a.hash === `#${en.target.id}`));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sectionLinks.forEach((a) => { const s = document.querySelector(a.hash); s && io.observe(s); });
  }

  /* ---- Cart badge: mirrors the stored cart, pops when something is added ---- */
  syncBadges();
  addEventListener('cart:change', () => syncBadges());
  nav.addEventListener('badge:pop', (e) => {
    if (reduced) return;
    gsap.fromTo(e.target, { scale: 1.6 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
  });
  const cartLink = nav.querySelector('.nav__cart');
  if (cartLink && location.pathname.endsWith('/checkout.html')) cartLink.classList.add('is-active');

  /* ---- Account menu ---------------------------------------------------
     A glass popover under the account icon. Signed-out until someone signs in on
     account.html (`?demo=account` signs in the sample account for reviewers). */
  const account = nav.querySelector('.account');
  if (account) {
    const btn = account.querySelector('.account__btn');
    const menu = account.querySelector('.account__menu');
    if (location.pathname.endsWith('/account.html')) btn.classList.add('is-active');
    const signedOut = { btn: btn.innerHTML, menu: menu.innerHTML };
    const paint = () => {
      const u = user.get();
      account.classList.toggle('is-signed-in', !!u);
      btn.setAttribute('aria-label', u ? `Account: ${u.name}` : 'Account');
      btn.innerHTML = u ? `<span class="account__avatar" aria-hidden="true">${initials(u.name)}</span>` : signedOut.btn;
      menu.innerHTML = u ? `
        <p class="eyebrow">${site.account.eyebrow}</p>
        <p class="account__hello">${site.account.hello} ${u.name.split(' ')[0]}.</p>
        <ul class="account__list">
          <li><a href="/account.html#orders"><span>${site.account.orders}</span><span class="account__count">${u.orders}</span></a></li>
          <li><a href="/account.html#subscription"><span>${site.account.subscription}</span><span class="chip">${site.account.soon}</span></a></li>
          <li><a href="/account.html#addresses"><span>${site.account.addresses}</span></a></li>
          <li><a href="/account.html#details"><span>${site.account.details}</span></a></li>
          <li><a href="/account.html" data-signout><span>${site.account.signOut}</span></a></li>
        </ul>` : signedOut.menu;
      menu.querySelector('[data-signout]')?.addEventListener('click', () => user.clear());
    };
    paint();
    addEventListener('user:change', paint);
    const close = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); account.classList.remove('is-open'); };
    const open = () => {
      menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); account.classList.add('is-open');
      if (!reduced) gsap.fromTo(menu, { opacity: 0, y: -8, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: 'power3.out', clearProps: 'transform' });
    };
    btn.addEventListener('click', () => (menu.hidden ? open() : close()));
    document.addEventListener('click', (e) => { if (!account.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { close(); btn.focus(); } });
  }

  return { cart };
}

/* ---- Who is signed in ----------------------------------------------------
   Front-end only until the backend issues sessions: the profile lives in localStorage.
   `?demo=account` signs in the sample account so reviewers can see the signed-in site. */
const USER_KEY = 'pratus-user';
const DEMO = { name: 'Pratiti Shah', email: 'pratiti@pratuskitchen.com', orders: 3 };
export const user = {
  get() {
    try { const u = JSON.parse(localStorage.getItem(USER_KEY)); if (u?.email) return u; } catch { /* no storage */ }
    return new URLSearchParams(location.search).get('demo') === 'account' ? DEMO : null;
  },
  set(u) { try { localStorage.setItem(USER_KEY, JSON.stringify(u)); } catch { /* no storage */ } dispatchEvent(new Event('user:change')); return u; },
  clear() { try { localStorage.removeItem(USER_KEY); } catch { /* no storage */ } dispatchEvent(new Event('user:change')); },
};
export const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'PK';

export function toast(msg, html = false) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  html ? (t.innerHTML = msg) : (t.textContent = msg);
  t.classList.add('is-on');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('is-on'), 2600);
}
