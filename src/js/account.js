// Account page: magic-link sign-in (simulated), then the profile — orders with one-tap
// reorder, the subscription teaser, the default address and contact details. Front-end
// only: the signed-in user lives in localStorage and the orders are the SAMPLE set in
// account.json until the backend supplies real ones (docs/API-CONTRACT.md).
import { animate } from './motion.js';
import { initNav, toast, user, initials } from './nav.js';
import { cart } from './cart.js';
import { bySlug, money, SHIPPING } from './products.js';
import copy from '../content/account.json';

initNav();

const $ = (s, r = document) => r.querySelector(s);
const signin = $('[data-signin]');
const profile = $('[data-profile]');
const addressForm = $('[data-address-form]');
const detailsForm = $('[data-details-form]');
const demo = copy.demo;

const nameFromEmail = (email) => email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const orderTotal = (o) => o.lines.reduce((s, l) => s + bySlug(l.slug).price * l.qty, 0) + (SHIPPING.methods.find((m) => m.id === o.method)?.price || 0);
const linesHTML = (lines) => lines.map((l) => { const p = bySlug(l.slug); return `<div class="done__line"><span class="line__thumb card--${p.key}"><img src="${p.card}" alt=""></span><span>${l.qty} × ${p.day} ${p.shortName}</span></div>`; }).join('');

function render(u) {
  const addr = u.address || demo.address;
  $('[data-avatar]').textContent = initials(u.name);
  $('[data-name]').textContent = u.name.split(' ')[0];
  $('[data-email]').textContent = u.email;
  $('[data-since]').textContent = u.since || demo.since;

  $('[data-orders]').innerHTML = demo.orders.length ? demo.orders.map((o) => `
    <article class="order" data-order="${o.no}">
      <div class="order__head">
        <span class="order__no">#${o.no}</span>
        <span class="order__date">${o.date}</span>
        <span class="chip ${o.status === 'delivered' ? 'chip--ink' : 'chip--go'}">${copy.orders[o.status]}</span>
        <span class="order__total">${money(orderTotal(o))}</span>
      </div>
      <div class="done__lines">${linesHTML(o.lines)}</div>
      <div class="order__actions">
        <button class="btn btn--sm" type="button" data-reorder>${copy.orders.reorder}</button>
        ${o.status === 'delivered' ? '' : `<button class="btn btn--sm btn--ghost" type="button" data-track>${copy.orders.track}</button>`}
      </div>
    </article>`).join('') : `<p class="lead measure">${copy.orders.empty}</p>`;

  $('[data-address-lines]').innerHTML = [`${addr.first} ${addr.last}`, addr.addr, addr.addr2, `${addr.city}, ${addr.state} ${addr.zip}`, addr.phone].filter(Boolean).join('<br>');
  Object.entries(addr).forEach(([k, v]) => { if (addressForm[k]) addressForm[k].value = v; });
  const [first = '', ...rest] = u.name.split(' ');
  detailsForm.first.value = first; detailsForm.last.value = rest.join(' '); detailsForm.email.value = u.email; detailsForm.phone.value = u.phone ?? addr.phone; detailsForm.news.checked = u.news ?? true;

  // The fuel tally: everything that has been delivered, and the most-ordered plate
  const delivered = demo.orders.filter((o) => o.status === 'delivered').flatMap((o) => o.lines);
  const qty = {};
  delivered.forEach((l) => { qty[l.slug] = (qty[l.slug] || 0) + l.qty; });
  $('[data-fuel-meals]').textContent = delivered.reduce((s, l) => s + l.qty, 0);
  $('[data-fuel-protein]').textContent = delivered.reduce((s, l) => s + bySlug(l.slug).macros.protein * l.qty, 0);
  const favSlug = Object.keys(qty).sort((a, b) => qty[b] - qty[a])[0];
  const fav = favSlug && bySlug(favSlug);
  $('[data-fav]').innerHTML = fav ? `
    <span class="line__thumb card--${fav.key}"><img src="${fav.card}" alt=""></span>
    <span class="fav__body"><span class="line__day">${copy.fuel.favourite}</span><span class="line__name">${fav.shortName}</span></span>
    <button class="btn btn--sm" type="button" data-reorder-fav="${fav.slug}">${copy.fuel.reorder}</button>` : '';
}

function show() {
  const u = user.get();
  signin.hidden = !!u;
  profile.hidden = !u;
  if (u) render(u);
}
show();
animate();

/* ---- Sign in / out ------------------------------------------------------ */
$('[data-signin-form]').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = e.target.email.value.trim();
  user.set({ name: nameFromEmail(email), email, orders: demo.orders.length });
  toast(copy.signin.sent);
  show();
});
$('[data-signout]').addEventListener('click', () => { user.clear(); show(); scrollTo(0, 0); });

/* ---- Orders: reorder puts the whole order back in the bag ---------------- */
const reorder = (lines) => { lines.forEach((l) => cart.add(l.slug, l.qty)); toast(`${copy.orders.reordered}<a href="/checkout.html">${copy.orders.viewBag}</a>`, true); };
profile.addEventListener('click', (e) => {
  const t = e.target;
  if (t.closest('[data-reorder]')) reorder(demo.orders.find((o) => o.no === t.closest('[data-order]').dataset.order).lines);
  else if (t.closest('[data-reorder-fav]')) reorder([{ slug: t.closest('[data-reorder-fav]').dataset.reorderFav, qty: 1 }]);
  else if (t.closest('[data-track]')) toast(copy.orders.tracking);
  else if (t.closest('[data-notify]')) toast(copy.subscription.toast);
});

/* ---- Address: edit in place --------------------------------------------- */
const editAddress = (on) => { addressForm.hidden = !on; $('[data-address]').hidden = on; if (on) addressForm.first.focus(); };
$('[data-edit-address]').addEventListener('click', () => editAddress(true));
$('[data-cancel-address]').addEventListener('click', () => editAddress(false));
addressForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!addressForm.reportValidity()) return;
  const u = user.get();
  u.address = Object.fromEntries(new FormData(addressForm));
  user.set(u); render(u); editAddress(false); toast(copy.addresses.saved);
});

/* ---- Details ------------------------------------------------------------- */
detailsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!detailsForm.reportValidity()) return;
  const u = user.get();
  u.name = `${detailsForm.first.value.trim()} ${detailsForm.last.value.trim()}`.trim();
  u.email = detailsForm.email.value.trim(); u.phone = detailsForm.phone.value.trim(); u.news = detailsForm.news.checked;
  user.set(u); render(u); toast(copy.details.saved);
  const avatar = document.querySelector('.nav .account__avatar'); if (avatar) avatar.textContent = initials(u.name);
});
