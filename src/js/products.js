// Product catalogue. The words, macros and prices live in src/content/products.json (Bansari edits
// those); this file only attaches the image assets and gradient that belong to the front end.
// Gallery photos keep their own 3:2 / 2:3 ratio (w/h are the real pixel sizes for layout before load).
import content from '../content/products.json';

// Per-product assets, keyed by slug. Adding a product = an entry here + an entry in products.json.
const ASSETS = {
  'paneer-paratha': { key: 'paneer', gradient: 'var(--g-paneer)', galleryShape: ['l', 'l', 'l', 'p', 'l', 'l'] },
  rotli:            { key: 'rotli',  gradient: 'var(--g-rotli)',  galleryShape: ['l', 'p', 'l', 'l', 'p', 'l'] },
  thepla:           { key: 'thepla', gradient: 'var(--g-thepla)', galleryShape: ['p', 'l', 'l', 'l', 'p', 'l'] },
};
const SIZE = { l: [1600, 1067], p: [1067, 1600] };

export const PRODUCTS = content.products.map((p) => {
  const a = ASSETS[p.slug];
  if (!a) throw new Error(`products.json has "${p.slug}" but products.js has no assets for it`);
  return {
    ...p,
    key: a.key,
    gradient: a.gradient,
    card: `/img/${a.key}-card.webp`,
    hero: `/img/${a.key}-hero.webp`,
    gallery: (p.gallery || []).map((g, i) => {
      const [w, h] = SIZE[a.galleryShape[i] || 'l'];
      return { ...g, src: `/img/${a.key}-g${i + 1}.webp`, w, h };
    }),
  };
});

export const SHIPPING = content.shipping;

export const bySlug = (slug) => PRODUCTS.find((p) => p.slug === slug);
export const money = (n) => `$${n.toFixed(0)}`;
