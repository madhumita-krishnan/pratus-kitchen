// Product catalogue. The words, macros and prices live in src/content/products.json (Bansari edits
// those); this file only attaches the image assets and gradient that belong to the front end.
import content from '../content/products.json';

// Per-product assets, keyed by slug. Paths are written out in full (not built at runtime) so the
// share build can find and inline them. Adding a product = an entry here + one in products.json.
// Gallery shots: l = landscape 1600×1067, p = portrait 1067×1600, in page order.
const L = [1600, 1067], P = [1067, 1600];
const ASSETS = {
  'paneer-paratha': { key: 'paneer', card: '/img/paneer-card.webp', hero: '/img/paneer-hero.webp',
    gallery: [['/img/paneer-g1.webp', L], ['/img/paneer-g2.webp', L], ['/img/paneer-g3.webp', L], ['/img/paneer-g4.webp', P], ['/img/paneer-g5.webp', L], ['/img/paneer-g6.webp', L]] },
  rotli: { key: 'rotli', card: '/img/rotli-card.webp', hero: '/img/rotli-hero.webp',
    gallery: [['/img/rotli-g1.webp', L], ['/img/rotli-g2.webp', P], ['/img/rotli-g3.webp', L], ['/img/rotli-g4.webp', L], ['/img/rotli-g5.webp', P], ['/img/rotli-g6.webp', L]] },
  thepla: { key: 'thepla', card: '/img/thepla-card.webp', hero: '/img/thepla-hero.webp',
    gallery: [['/img/thepla-g1.webp', P], ['/img/thepla-g2.webp', L], ['/img/thepla-g3.webp', L], ['/img/thepla-g4.webp', L], ['/img/thepla-g5.webp', P], ['/img/thepla-g6.webp', L]] },
};

export const PRODUCTS = content.products.map((p) => {
  const a = ASSETS[p.slug];
  if (!a) throw new Error(`products.json has "${p.slug}" but products.js has no assets for it`);
  return {
    ...p,
    key: a.key,
    card: a.card,
    hero: a.hero,
    gallery: a.gallery.map(([src, [w, h]], i) => ({ ...(p.gallery?.[i] || { cap: '', alt: '' }), src, w, h })),
  };
});

export const SHIPPING = content.shipping;

export const bySlug = (slug) => PRODUCTS.find((p) => p.slug === slug);
export const money = (n) => `$${n.toFixed(0)}`;
