// Nav behaviour shared by every page: burger menu, section highlight, cart badge, account menu.
import { gsap, reduced } from './motion.js';
import { cart, syncBadges } from './cart.js';

export function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  /* ---- Burger (phones) ---- */
  const burger = nav.querySelector('.nav__burger');
  burger?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('.nav__links a').forEach((a) => a.addEventListener('click', () => nav.classList.remove('is-open')));

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
     A glass popover under the account icon. Signed-out by default; `?demo=account`
     shows the signed-in treatment (initials avatar) so the client can see both. */
  const account = nav.querySelector('.account');
  if (account) {
    const btn = account.querySelector('.account__btn');
    const menu = account.querySelector('.account__menu');
    const signedIn = new URLSearchParams(location.search).get('demo') === 'account';
    if (signedIn) {
      account.classList.add('is-signed-in');
      btn.innerHTML = '<span class="account__avatar" aria-hidden="true">PK</span>';
      btn.setAttribute('aria-label', 'Account: Pratiti');
      menu.innerHTML = `
        <p class="eyebrow">Your account</p>
        <p class="account__hello">Hey Pratiti.</p>
        <ul class="account__list">
          <li><a href="#"><span>Orders</span><span class="account__count">2</span></a></li>
          <li><a href="#"><span>Subscription</span><span class="chip">Soon</span></a></li>
          <li><a href="#"><span>Addresses</span></a></li>
          <li><a href="#"><span>Sign out</span></a></li>
        </ul>`;
    }
    const close = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); account.classList.remove('is-open'); };
    const open = () => {
      menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); account.classList.add('is-open');
      if (!reduced) gsap.fromTo(menu, { opacity: 0, y: -8, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: 'power3.out', clearProps: 'transform' });
    };
    btn.addEventListener('click', () => (menu.hidden ? open() : close()));
    document.addEventListener('click', (e) => { if (!account.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { close(); btn.focus(); } });
    // Nothing behind the menu is wired yet: say so instead of dead links
    menu.addEventListener('click', (e) => {
      const a = e.target.closest('a[href="#"]');
      if (!a) return;
      e.preventDefault();
      toast(signedIn ? 'Account pages arrive with the shop launch.' : 'Sign-in arrives with the shop launch.');
      close();
    });
  }

  return { cart };
}

export function toast(msg, html = false) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  html ? (t.innerHTML = msg) : (t.textContent = msg);
  t.classList.add('is-on');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('is-on'), 2600);
}
