# Pratus Kitchen — design system

Everything the site is built from. Rules here, values in `tokens.css`, components in `main.css`; nothing is hard-coded twice.

| What | Where |
|---|---|
| **The rules** — principles, colour, type, hierarchy, spacing, layout (knolling), radii, surfaces, icons, photography, components & states, **motion (§12)**, interaction, accessibility, voice | [DESIGN.md](DESIGN.md) |
| **Tokens** — every value as a CSS custom property: colours, gradients, glass, type scale, spacing, radii, shadows, easings, durations | [src/styles/tokens.css](../src/styles/tokens.css) |
| **Components** — nav + pills, buttons, chips, lineup deck + cards, comparison table, how-it-works steps, story, gallery, CTA banner, footer, account menu, checkout blocks / fields / inputs, account page, toast, lightbox, reviews | [src/styles/main.css](../src/styles/main.css) |
| **Motion behaviours** — reveals, split headings, counters, no-orphan glue (GSAP) | [src/js/motion.js](../src/js/motion.js) |
| **Deck reset** — how the lineup cards are rendered and put back in the stack on every arrival | [src/js/main.js](../src/js/main.js) (the "Lineup cards" block) |
| **Fonts** — Pratus-Regular for headlines, caps and digits; Montserrat (Google Fonts) for body | [public/fonts/](../public/fonts/) |
| **Mark** | [public/brand/ms-pratu.svg](../public/brand/ms-pratu.svg) |
| **How-to icons** (Katie) — freeze, pan, microwave, track | [public/img/how-*.webp](../public/img/) |

Use: link `tokens.css` before `main.css`, load the fonts, follow `DESIGN.md`.

## Motion rules in one breath

Full table and tokens in [DESIGN.md §12](DESIGN.md#12-motion). The rules that matter most:

1. **Arrive with `--ease-out`, leave with `--ease-in`.** Opacity is never eased in; fade with `power2.out` while position/scale settles.
2. **Entrances are one-shot.** Nothing replays on scroll-back. No loops, no marquees, no pulsing (loader and busy spinner excepted).
3. **Stagger a row, never a page.** Max 4 siblings, 0.24s total.
4. **Durations:** press ≤ 200ms, hover ≤ 320ms, entrances 0.8–1.8s, nothing over 2s except the loader.
5. **Leaving resets.** A state a click put an element into (a pulled-out lineup card, an open menu) never survives navigation. When the page is shown again everything is at rest, and hover re-engages only once the pointer actually moves. The user never comes back to a page that looks mid-gesture.
6. **Reduced motion** is respected everywhere: static hero, instant reveals, final counter values.

### The deck pull-out and its reset (rule 5 in practice)

- Rest: outer cards tilt ±6° and sit 28px low; the middle card is upright on top.
- Hover / focus: the slot straightens, rises 32px and scales 1.06 over 0.7s `--ease-out`; its shadow steps up to `--shadow-card-lift`. Neighbours stay tilted.
- Reset: on every `pageshow` (first load, back button, bfcache restore) the page drops focus and puts `.is-resting` on the deck. While resting the hover/focus rule does not apply (`.deck:not(.is-resting) .deck__slot:hover`), so the card you tapped slides back into the stack even if the pointer is still over it. The first `pointermove` removes the class and hover is live again.
