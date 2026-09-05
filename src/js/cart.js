// Cart state, shared by every page. Front-end only: lives in localStorage until
// the shop is wired to Stripe/Shopify, at which point this module becomes the
// adapter and the pages stay as they are.
import { PRODUCTS, bySlug, SHIPPING } from './products.js';

const KEY = 'pratus-cart';

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return raw.filter((l) => bySlug(l.slug) && l.qty > 0);
  } catch { return []; }
}
function write(lines) {
  localStorage.setItem(KEY, JSON.stringify(lines));
  dispatchEvent(new CustomEvent('cart:change', { detail: lines }));
  return lines;
}

export const cart = {
  lines: read,
  add(slug, qty = 1) {
    const lines = read();
    const l = lines.find((x) => x.slug === slug);
    l ? (l.qty += qty) : lines.push({ slug, qty });
    return write(lines);
  },
  set(slug, qty) {
    const lines = read().map((l) => (l.slug === slug ? { ...l, qty } : l)).filter((l) => l.qty > 0);
    return write(lines);
  },
  remove(slug) { return write(read().filter((l) => l.slug !== slug)); },
  clear() { return write([]); },
  count() { return read().reduce((n, l) => n + l.qty, 0); },
  subtotal() { return read().reduce((n, l) => n + l.qty * bySlug(l.slug).price, 0); },
  // Standard shipping is free past the threshold; the express upgrade never is.
  shipping(method = 'standard') {
    const m = SHIPPING.methods.find((x) => x.id === method) || SHIPPING.methods[0];
    return m.freeOver != null && this.subtotal() >= m.freeOver ? 0 : m.price;
  },
  // Dollars still to spend before standard shipping is free (0 when already there)
  toFree() { return Math.max(0, SHIPPING.methods[0].freeOver - this.subtotal()); },
};

/* Keep every cart badge on the page in step with the cart. */
export function syncBadges(pop = false) {
  const n = cart.count();
  document.querySelectorAll('.nav__badge').forEach((b) => {
    b.hidden = n === 0;
    b.textContent = n;
    if (pop && n) b.dispatchEvent(new CustomEvent('badge:pop', { bubbles: true }));
  });
}

export { PRODUCTS };
