// Checkout: cart lines + totals from cart.js, a three-step form, and a done state.
// With VITE_API_URL set, Place order posts to the backend (docs/API-CONTRACT.md);
// otherwise the submit is simulated so the page can be reviewed without a server.
import { gsap, reduced, animate } from './motion.js';
import { initNav, toast } from './nav.js';
import { cart } from './cart.js';
import { bySlug, money, SHIPPING } from './products.js';
import { api, apiEnabled } from './api.js';
import copy from '../content/checkout.json';

initNav();

const $ = (s, r = document) => r.querySelector(s);
const grid = $('[data-checkout]');
const empty = $('[data-empty]');
const done = $('[data-done]');
const form = $('[data-form]');
let method = SHIPPING.methods[0].id;
let pay = 'card';

/* ---- Render ---------------------------------------------------------- */
function lineHTML(l) {
  const p = bySlug(l.slug);
  return `
    <div class="line" data-line="${p.slug}">
      <div class="line__thumb card--${p.key}"><img src="${p.card}" alt="" width="1400" height="933"></div>
      <div class="line__info">
        <p class="line__day">${p.day}</p>
        <p class="line__name">${p.shortName}</p>
        <button class="line__remove" type="button" data-remove>${copy.summary.remove}</button>
      </div>
      <div class="line__side">
        <span class="line__price">${money(p.price * l.qty)}</span>
        <div class="qty qty--sm" role="group" aria-label="${copy.summary.quantityOf} ${p.shortName}">
          <button type="button" data-qty="-1" aria-label="Decrease">−</button>
          <output aria-live="polite">${l.qty}</output>
          <button type="button" data-qty="1" aria-label="Increase">+</button>
        </div>
      </div>
    </div>`;
}

function renderMethods() {
  const sub = cart.subtotal();
  $('[data-methods]').innerHTML = SHIPPING.methods.map((m) => {
    const free = m.freeOver != null && sub >= m.freeOver;
    return `
      <label class="choice">
        <input type="radio" name="method" value="${m.id}" ${m.id === method ? 'checked' : ''}>
        <span class="choice__body"><b>${m.label}</b><span>${m.note}</span></span>
        <span class="choice__price">${free ? copy.delivery.free : money(m.price)}</span>
      </label>`;
  }).join('');
}

function renderTotals() {
  const sub = cart.subtotal();
  const ship = cart.shipping(method);
  const n = cart.count();
  $('[data-count-label]').textContent = `${n} ${n === 1 ? copy.summary.meal : copy.summary.meals}`;
  $('[data-subtotal]').textContent = money(sub);
  $('[data-shipping]').textContent = ship === 0 ? copy.delivery.free : money(ship);
  document.querySelectorAll('[data-grand]').forEach((el) => { el.textContent = money(sub + ship); });
  // free-shipping meter (standard method threshold)
  const left = cart.toFree();
  const goal = SHIPPING.methods[0].freeOver;
  $('[data-meter-text]').innerHTML = left > 0
    ? `<b>${money(left)}</b> ${copy.summary.awayFromFree}`
    : copy.summary.freeUnlocked;
  $('[data-meter]').classList.toggle('is-full', left === 0);
  $('[data-meter-fill]').style.width = `${Math.min(100, (sub / goal) * 100)}%`;
}

function render() {
  const lines = cart.lines();
  const has = lines.length > 0;
  if (!done.hidden) return;              // the done panel owns the page once an order is in
  grid.hidden = !has;
  empty.hidden = has;
  $('.checkout .section__head').hidden = !has; // empty + done panels carry their own statement
  if (!has) return;
  $('[data-lines]').innerHTML = lines.map(lineHTML).join('');
  renderMethods();
  renderTotals();
}
render();
animate();

/* ---- Lines: qty + remove ---------------------------------------------- */
$('[data-lines]').addEventListener('click', (e) => {
  const row = e.target.closest('[data-line]');
  if (!row) return;
  const slug = row.dataset.line;
  const q = e.target.closest('[data-qty]');
  if (q) {
    const cur = cart.lines().find((l) => l.slug === slug)?.qty || 0;
    cart.set(slug, Math.max(1, cur + Number(q.dataset.qty)));
    render();
  } else if (e.target.closest('[data-remove]')) {
    if (reduced) { cart.remove(slug); render(); return; }
    gsap.to(row, { opacity: 0, x: 16, duration: 0.28, ease: 'power2.out', onComplete: () => { cart.remove(slug); render(); } });
  }
});

/* ---- Delivery method --------------------------------------------------- */
$('[data-methods]').addEventListener('change', (e) => { method = e.target.value; renderTotals(); });

/* ---- Payment segment --------------------------------------------------- */
document.querySelectorAll('[data-pay]').forEach((b) => b.addEventListener('click', () => {
  pay = b.dataset.pay;
  document.querySelectorAll('[data-pay]').forEach((x) => { const on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-selected', String(on)); });
  const cardBox = $('[data-pay-card]');
  const appleBox = $('[data-pay-apple]');
  cardBox.hidden = pay !== 'card';
  appleBox.hidden = pay !== 'apple';
  cardBox.querySelectorAll('input').forEach((i) => { i.disabled = pay !== 'card'; });
  $('[data-submit]').firstChild.textContent = pay === 'apple' ? copy.payment.payApple : copy.payment.placeOrder;
}));

/* ---- Promo ------------------------------------------------------------- */
$('[data-promo]').addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = e.target.querySelector('input').value.trim();
  if (!code) { toast(copy.summary.promoEmpty); return; }
  if (!apiEnabled) { toast(`“${code}” ${copy.summary.promoNotLive}`); return; }
  try {
    const r = await api.validatePromo(code, cart.subtotal());
    toast(r.valid ? `“${code}” applied.` : `“${code}” ${copy.summary.promoInvalid}`);
  } catch { toast(`“${code}” ${copy.summary.promoInvalid}`); }
});

/* ---- Place order --------------------------------------------------------
   Builds the order from the form + cart. With the API configured it is POSTed to
   /v1/orders and the backend's order number and ETA are shown; otherwise the
   confirmation is simulated after a short delay. */
const orderPayload = () => ({
  email: form.email.value,
  newsletter: form.news.checked,
  shipping: {
    firstName: form.first.value, lastName: form.last.value,
    address1: form.addr.value, address2: form.addr2.value, city: form.city.value,
    state: form.state.value, zip: form.zip.value, phone: form.phone.value,
    method,
  },
  payment: { method: pay, name: form.ccname?.value || '' }, // card details go to the payment provider, never to us
  lines: cart.lines().map((l) => ({ slug: l.slug, qty: l.qty })),
  promo: $('#promo').value.trim() || null,
});
const etaFor = (m) => SHIPPING.methods.find((x) => x.id === m)?.eta || '';
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const btn = $('[data-submit]');
  btn.classList.add('is-busy');
  const lines = cart.lines();
  const email = form.email.value;
  let result;
  if (apiEnabled) {
    try { result = await api.createOrder(orderPayload()); }
    catch (err) { btn.classList.remove('is-busy'); toast(err.data?.error?.message || copy.payment.failed); return; }
  } else {
    await new Promise((r) => setTimeout(r, 1400));
    result = { orderNumber: `PK-${String(Math.floor(1000 + Math.random() * 9000))}`, eta: etaFor(method) };
  }
  {
    $('[data-order-no]').textContent = `#${result.orderNumber}`;
    $('[data-done-email]').textContent = email;
    $('[data-done-eta]').textContent = result.eta || etaFor(method);
    $('[data-done-lines]').innerHTML = lines.map((l) => {
      const p = bySlug(l.slug);
      return `<div class="done__line"><span class="line__thumb card--${p.key}"><img src="${p.card}" alt=""></span><span>${l.qty} × ${p.day} ${p.shortName}</span></div>`;
    }).join('');
    cart.clear();
    grid.hidden = true;
    $('.checkout .section__head').hidden = true; // the done panel carries its own statement
    done.hidden = false;
    scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    if (!reduced) {
      gsap.from(done, { y: 28, opacity: 0, duration: 1, ease: 'power3.out' });
      gsap.from('.done__mark', { scale: 0, rotate: -40, duration: 0.8, ease: 'elastic.out(1, 0.5)', delay: 0.3 });
    }
  }
});

/* ---- Intro -------------------------------------------------------------- */
if (!reduced) gsap.from('.nav .pill', { opacity: 0, y: -10, duration: 0.8, ease: 'power3.out', stagger: 0.08, clearProps: 'all' });
