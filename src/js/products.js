// Product catalogue. Copy is lifted verbatim from the pouch labels.
// Card photos are pre-framed by scripts/optimize-images.mjs (pouch centred, same size on every card);
// gallery photos keep their own 3:2 / 2:3 ratio (w/h are the real pixel sizes for layout before load).
// TODO(business): confirm prices — placeholders until Pratiti signs off.
export const PRODUCTS = [
  {
    slug: 'paneer-paratha',
    key: 'paneer',
    day: 'Push Day',
    name: 'Paneer Paratha',
    shortName: 'Paneer Paratha',
    tagline: 'Press heavier and recover smarter with our push-day-ready paneer paratha.',
    description:
      'A classic Punjabi flatbread stuffed with spiced, protein-rich paneer. Made to be eaten like a real meal, not a supplement — and tracked like one.',
    macros: { cal: 470, protein: 30, carbs: 29, fat: 26 },
    price: 14,
    card: '/img/paneer-card.webp',
    hero: '/img/paneer-hero.webp',
    gradient: 'var(--g-paneer)',
    // product-page gallery (scripts/optimize-images.mjs → gallery); order = order on the page
    gallery: [
      { src: '/img/paneer-g1.webp', w: 1600, h: 1067, alt: 'Push Day Paneer Paratha pouch held up mid-flex', cap: 'Push day' },
      { src: '/img/paneer-g2.webp', w: 1600, h: 1067, alt: 'Paneer paratha pouch on turf with a dumbbell', cap: 'Turf' },
      { src: '/img/paneer-g3.webp', w: 1600, h: 1067, alt: 'Paneer paratha pouch on the track', cap: 'Lane 4' },
      { src: '/img/paneer-g4.webp', w: 1067, h: 1600, alt: 'Founder lying on the track beside a paneer paratha pouch', cap: 'Rest day' },
      { src: '/img/paneer-g5.webp', w: 1600, h: 1067, alt: 'Paneer paratha on the yard line', cap: 'Yard line' },
      { src: '/img/paneer-g6.webp', w: 1600, h: 1067, alt: 'Founder flexing with the paneer paratha pouch', cap: 'Founder' },
    ],
  },
  {
    slug: 'rotli',
    key: 'rotli',
    day: 'Pr-otein',
    name: 'Rotli',
    shortName: 'Rotli + Shaak',
    tagline: 'Set a new personal record starting with lunch.',
    description:
      'Soft, tofu-based pr-otein rotlis paired with our Chin-Up Chana Bataka Shaak. The Gujarati home plate, rebuilt for training days.',
    macros: { cal: 380, protein: 19, carbs: 37, fat: 17 },
    price: 14,
    card: '/img/rotli-card.webp',
    hero: '/img/rotli-hero.webp',
    gradient: 'var(--g-rotli)',
    // product-page gallery (scripts/optimize-images.mjs → gallery); order = order on the page
    gallery: [
      { src: '/img/rotli-g1.webp', w: 1600, h: 1067, alt: 'Rotli pouch handed off on the track', cap: 'Handoff' },
      { src: '/img/rotli-g2.webp', w: 1067, h: 1600, alt: 'Rotli pouch and shaak tub on turf with dumbbells', cap: 'Turf' },
      { src: '/img/rotli-g3.webp', w: 1600, h: 1067, alt: 'Rotli pouch at the tennis net', cap: 'Court side' },
      { src: '/img/rotli-g4.webp', w: 1600, h: 1067, alt: 'Rotli pouch, shaak tub and dumbbell on the field', cap: 'Field' },
      { src: '/img/rotli-g5.webp', w: 1067, h: 1600, alt: 'Founder on the track with rotli and shaak', cap: 'Rest day' },
      { src: '/img/rotli-g6.webp', w: 1600, h: 1067, alt: 'Rotli and shaak tubs packed in a cooler', cap: 'Packed cold' },
    ],
  },
  {
    slug: 'thepla',
    key: 'thepla',
    day: 'Thunder Thigh',
    name: 'Thepla',
    shortName: 'Thepla',
    tagline: 'Fuel your leg day one bite at a time.',
    description:
      'A macro-tracked take on a classic Gujarati wholewheat and fenugreek flatbread. Savoury, portable, and built for the days that hurt.',
    macros: { cal: 400, protein: 21, carbs: 39, fat: 17 },
    price: 12,
    card: '/img/thepla-card.webp',
    hero: '/img/thepla-hero.webp',
    gradient: 'var(--g-thepla)',
    // product-page gallery (scripts/optimize-images.mjs → gallery); order = order on the page
    gallery: [
      { src: '/img/thepla-g1.webp', w: 1067, h: 1600, alt: 'Thepla pouch on turf with a dumbbell and phone', cap: 'Turf' },
      { src: '/img/thepla-g2.webp', w: 1600, h: 1067, alt: 'Three thepla pouches on the blacktop', cap: 'Blacktop' },
      { src: '/img/thepla-g3.webp', w: 1600, h: 1067, alt: 'Thepla pouch beside a dumbbell on the yard line', cap: 'Yard line' },
      { src: '/img/thepla-g4.webp', w: 1600, h: 1067, alt: 'Founder sitting on the track with thepla and paneer paratha', cap: 'Track' },
      { src: '/img/thepla-g5.webp', w: 1067, h: 1600, alt: 'Founder on the track with a thepla pouch', cap: 'Rest day' },
      { src: '/img/thepla-g6.webp', w: 1600, h: 1067, alt: 'Thepla pouch and dumbbell on the field', cap: 'Field' },
    ],
  },
];

export const HEATING = [
  { label: 'Pan (recommended)', text: 'Remove parchment paper and heat on a pan until warm and soft.' },
  { label: 'Quick option', text: 'Microwave each piece between a paper towel for 10–15 seconds.' },
  { label: 'Track it', text: 'Log your meal in MyFitnessPal — just search “PRATUS”.' },
  { label: 'Storage', text: 'Keep frozen.' },
];

// TODO(business): confirm carrier rates and the free-shipping threshold (the PDP already promises "free over $60").
export const SHIPPING = {
  methods: [
    { id: 'standard', label: 'Standard', note: 'Frozen, insulated. 2–3 business days.', price: 9, freeOver: 60 },
    { id: 'express',  label: 'Express',  note: 'Next business day, ordered before noon.', price: 18, freeOver: null },
  ],
};

export const bySlug = (slug) => PRODUCTS.find((p) => p.slug === slug);
export const money = (n) => `$${n.toFixed(0)}`;
