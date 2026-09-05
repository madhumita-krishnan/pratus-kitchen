// The one place the front end talks to the backend. Every request goes through here,
// so the pages never know a URL. The contract both sides build to is docs/API-CONTRACT.md.
//
// VITE_API_URL (see .env.example) is the base path, normally "/api". When it is empty the
// shop stays simulated: the cart lives in the browser and Place order fakes a confirmation.
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const apiEnabled = BASE !== '';

async function request(method, path, body) {
  const res = await fetch(`${BASE}/v1${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data = null;
  try { data = await res.json(); } catch { /* no body */ }
  if (!res.ok) {
    const err = new Error(data?.error?.message || `${method} ${path} failed (${res.status})`);
    err.status = res.status; err.code = data?.error?.code; err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  /** GET /v1/products → { products: [{ slug, price, available }] } — prices and stock the backend owns. */
  products: () => request('GET', '/products'),
  /** POST /v1/orders → { orderNumber, eta, total } — creates the order and charges it. */
  createOrder: (order) => request('POST', '/orders', order),
  /** POST /v1/promos/validate → { code, valid, discount } */
  validatePromo: (code, subtotal) => request('POST', '/promos/validate', { code, subtotal }),
  /** POST /v1/newsletter → { subscribed: true } */
  subscribe: (email, source) => request('POST', '/newsletter', { email, source }),
};
