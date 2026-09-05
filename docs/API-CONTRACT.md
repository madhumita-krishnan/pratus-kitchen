# Pratus Kitchen — front end ↔ backend contract

The front end (this repo) is a static site. Everything it needs from a server goes through
`src/js/api.js`, which calls the endpoints below. The backend (Bansari's repo) implements them.
Neither side needs to read the other's code: this file is the agreement.

## Where requests go

- **Production**: the browser calls `https://<site domain>/api/v1/...`. The front-end host
  rewrites `/api/*` to the backend (`vercel.json`), so there is no cross-origin traffic and
  cookies work. The backend's public URL is set once in `vercel.json`.
- **Local development**: `npm run dev` forwards `/api/*` to `API_PROXY_TARGET`
  (default `http://localhost:8000`), so run the backend locally on that port.
- The front end only talks to the API when `VITE_API_URL` is set (normally to `/api`).
  With it empty, the shop is simulated in the browser — useful for design review.

All requests and responses are JSON. Requests send `credentials: include`, so a session
cookie set by the backend comes back on every call.

## Errors

Any non-2xx response carries:

```json
{ "error": { "code": "out_of_stock", "message": "Thepla is sold out this week." } }
```

`message` is shown to the customer as written, so keep it short and in the brand voice.
`code` is for the front end's logic and logs.

## Endpoints

### `GET /v1/products`
Prices and availability the backend owns. The catalogue copy itself (names, taglines,
descriptions, macros) lives in `src/content/products.json` in the front end; the backend
only needs to know the `slug`s: `paneer-paratha`, `rotli`, `thepla`.

```json
{ "products": [ { "slug": "thepla", "price": 12, "available": true } ] }
```
Prices are whole dollars. *Not yet consumed by the front end — the catalogue is static
until Pratiti confirms prices. Kept in the contract so that switch is one change.*

### `POST /v1/orders`
Creates the order, takes payment, returns the confirmation the customer sees.

Request:
```json
{
  "email": "sam@example.com",
  "newsletter": true,
  "shipping": {
    "firstName": "Sam", "lastName": "Patel",
    "address1": "12 Track Lane", "address2": "", "city": "Ann Arbor",
    "state": "MI", "zip": "48104", "phone": "7345550100",
    "method": "standard"
  },
  "payment": { "method": "card", "name": "Sam Patel" },
  "lines": [ { "slug": "thepla", "qty": 2 }, { "slug": "paneer-paratha", "qty": 1 } ],
  "promo": null
}
```
- `shipping.method` is `standard` or `express` (ids from `products.json → shipping.methods`).
- `payment.method` is `card` or `apple`. **Card numbers never reach this API.** When Stripe
  (or whichever provider) is wired in, the front end will send a `paymentToken` from the
  provider's client SDK instead of raw card fields; until then the checkout page is in test
  mode and the backend should treat every order as unpaid/test.
- `lines[].qty` is at least 1. The backend recomputes every price from its own data — never
  trust a total from the browser.

Response `201`:
```json
{ "orderNumber": "PK-1042", "eta": "two to three business days", "total": 45 }
```
`orderNumber` is shown as `#PK-1042`. `eta` is shown verbatim inside the sentence
"Your meals ship cold and land in ___." `total` is whole dollars.

Expected error codes: `invalid_address`, `out_of_stock`, `payment_failed`, `invalid_promo`.

### `POST /v1/promos/validate`
```json
{ "code": "LEGDAY", "subtotal": 38 }
```
Response `200`:
```json
{ "code": "LEGDAY", "valid": true, "discount": 5 }
```
`discount` is whole dollars off the subtotal. `valid: false` with `200` is fine for a code
that simply doesn't exist.

### `POST /v1/newsletter`
```json
{ "email": "sam@example.com", "source": "footer" }
```
Response `200`: `{ "subscribed": true }`. `source` is `footer` today; `checkout` once the
order flow passes `newsletter: true` through (that flag is already in the order request).

## Not in the contract yet

Sign-in and account pages: the nav has an account icon whose menu says these arrive with the
shop launch. Before building auth, decide whether accounts exist at launch at all; the
recommendation on the front-end side is to cut the icon until there are orders and
subscriptions behind it.

## Changing this contract

Change the file first, in a pull request that both of us review, then change the code on
either side. A field added to a response is safe; a field removed or renamed is a breaking
change and needs both repos to move together.
