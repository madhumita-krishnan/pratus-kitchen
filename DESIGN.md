# PRATUS — Design System

> Culture that performs. Clean, premium, athletic. Think Nike's confidence with an Indian kitchen's warmth.
> Every value here is a CSS custom property in [`src/styles/tokens.css`](src/styles/tokens.css). Components consume tokens; they never hard-code values. Shared behaviours (reveals, counters, no-orphan glue) live in [`src/js/motion.js`](src/js/motion.js).

**Contents** — 1 Principles · 2 Colour · 3 Typography · 4 Hierarchy · 5 Spacing & gutters · 6 Layout & alignment (knolling) · 7 Radii · 8 Surfaces & elevation · 9 Icons · 10 Photography · 11 Components & states · 12 Motion · 13 Interaction · 14 Accessibility · 15 Voice · 16 Files & checklist

---

## 1. Principles

1. **Type does the talking.** Giant condensed display type (the wordmark font) carries the brand. Everything else steps back.
2. **Photography is the colour.** The UI is near-monochrome (Urad Dal White, near-black, one red). Product gradients and photos supply saturation.
3. **Red is a verb.** PRATUS Red is for emphasis and interactivity only — CTAs, the active nav item, a highlighted word, the step numbers. Never a background for body copy.
4. **Soft geometry, hard type.** Generous radii and pill shapes soften the athletic type. Nothing has a sharp 90° corner except the page itself.
5. **Everything is knolled.** Sibling elements share edges. Titles start on the same line, paragraphs start at the same height, labels share a column. If two things are meant to line up, the layout enforces it (grid/subgrid) — never eyeballed.
6. **No orphans, ever.** A line never ends on a single word. Headings balance; paragraphs glue their last two words.
7. **Motion has weight, and nothing just appears.** Every element enters with an ease. The one accent is the tagline's soft slam; everything else is quiet. Nothing loops.

---

## 2. Colour

### Brand
| Token | Hex | Use |
|---|---|---|
| `--c-red` | `#D70F1C` | Primary CTA, emphasis, active states, focus ring |
| `--c-red-dark` | `#820000` | Gradient end for red panels |
| `--c-black` | `#000000` | Gradient end only |
| `--c-ink` | `#0B0A0A` | Dark surfaces, body text (softer than pure black) |
| `--c-white` | `#F0EBED` | **The** brand white (Urad Dal). Page background. |
| `--c-paper` | `#FFFFFF` | Elevated cards on the white page |

### Accents — one per product, never mixed
| Product | Light | Deep | Gradient token | Text on it |
|---|---|---|---|---|
| Paneer Paratha | `#F6CB42` | `#D47611` | `--g-paneer` | Ink |
| Rotli | `#89DAFF` | `#2C92FF` | `--g-rotli` | White |
| Thepla | `#62A45F` | `#244435` | `--g-thepla` | White |

Accent gradients are always `linear-gradient(160deg, light 0%, deep 100%)`. Content sits on the deep (bottom-right) end, which decides the foreground colour above. The three accents appear together only as the stripe under the PRATUS column in the comparison table and as the tilted check squares there.

### Neutrals
Warm greys derived from Urad Dal White: `--c-grey-100` `#E6E0E2` · `-200` `#D3CCCF` · `-400` `#9E979A` · `-600` `#625C5F` · `-800` `#2B2829`. Lines are alpha ink (`--line` 10%, `--line-strong` 18%) so they work on any tint.

### Semantic
`--fg`, `--fg-muted`, `--bg`, `--bg-elev`, `--line`, `--line-strong`, `--focus`. Add `.theme-dark` to a section to invert them (the About section does this) — components don't need dark variants.

### Gradients
| Token | Where |
|---|---|
| `--g-red` | CTA band |
| `--g-ink` | Dark sections |
| `--g-scrim` | Bottom scrim over photos so text reads |
| `--g-sheen` | Button hover sweep |

### Colour rules
- Muted text (`--fg-muted`) is for supporting copy only: leads, step copy, labels, captions. Never for a heading or a button.
- Red never touches red: no red text on the red CTA panel, no red button on a red surface (use `--light` there).
- White text sits on photos only behind a scrim or gradient; never raw.

---

## 3. Typography

| Role | Family | Weight / case | Token |
|---|---|---|---|
| Display / wordmark / headings / big numbers | **Pratus** (custom, `/fonts/Pratus-Regular.otf`) → fallback Anton | 400, ALL CAPS | `--font-display` |
| Everything else | **Montserrat** | 500 body, 600 UI, 700 buttons/labels, 800 chips; italic 700 for the tagline only | `--font-body` |

The Pratus font ships uppercase, digits and basic punctuation only. Always `text-transform: uppercase`. Units after a display number (`30g`, `90s`) render as small caps-height letters at `0.5em`.

### Scale (fluid)
| Token | Size | Used for |
|---|---|---|
| `--text-hero` | `clamp(5rem, 17vw, 17.5rem)` | Hero wordmark only |
| tagline | `clamp(.875rem, hero × 0.135, 2.25rem)` | Hero tagline — sized off the wordmark so it is always narrower |
| `--text-h1` | `clamp(3.25rem, 8vw, 8rem)` | Section statements ("Pick your fuel.", "Us vs. them.", PDP product name, CTA title) |
| `--text-h2` | `clamp(2.5rem, 5.5vw, 5.25rem)` | Section titles, the About quote |
| `--text-h3` | `clamp(1.75rem, 3vw, 2.75rem)` | Card names, step titles |
| `--text-h4` | `clamp(1.25rem, 1.8vw, 1.5rem)` | Sub-heads (Montserrat 700) |
| `--text-lead` | `clamp(1.125rem, 1.4vw, 1.375rem)` | Intro paragraphs, PDP tagline |
| `--text-body` | `1rem` | Body |
| `--text-small` | `0.875rem` | Buttons, nav links, prices, toast |
| `--text-micro` | `0.75rem` | Eyebrows, chips, captions, labels, footer legal |

Big numbers: stat tiles `clamp(2.5rem, 4vw, 3.75rem)`, macro tiles `clamp(2.5rem, 4vw, 4rem)`, step numbers `3rem`, PDP price `2.5rem`, footer wordmark `3.5rem`, table logo `1.75rem`. All display font, all `tabular-nums`.

### Line-height & tracking
| Token | Value | Where |
|---|---|---|
| `--lh-display` | `0.9` | Display type (`0.85` on the hero wordmark, `0.88` PDP name, `0.92` quotes, `0.95` step titles, `1` numbers) |
| `--lh-tight` | `1.1` | h4, UI |
| `--lh-body` | `1.55` | Body (`1.45` for leads) |
| `--track-display` | `0.01em` | Headings. The hero wordmark alone opens to `0.06em`; nothing else passes `0.04em` |
| `--track-eyebrow` | `0.18em` | Eyebrows, labels, captions, footer h4 |
| `--track-button` | `0.08em` | Buttons (`0.06em` nav links, `0.04em` chips/toast, `0.02em` prices/tagline) |

### Eyebrow
Micro / 700 / `0.18em` / uppercase / muted, with a 24×2px red dash before it (`.eyebrow`). Centred eyebrows (`.eyebrow--center`) drop the dash. An eyebrow always sits directly above a heading, gap `--s-4`.

### Text rules
- **No orphans.** `h1–h4 { text-wrap: balance }`, `p, li, figcaption { text-wrap: pretty }` in CSS, and `motion.js → noOrphans()` glues the last two words of every heading, paragraph, list item and caption with a no-break space. Split headlines keep their last two words in a `white-space: nowrap` group. Opt out with `data-noglue` (only for single-word or two-word strings that must wrap).
- **Measure.** Body copy is capped at `62ch` (`.measure`); story copy `48ch`; PDP tagline `48ch`; footer tagline `32ch`. A display statement is capped by its own wrapper (About quote `14ch`).
- **Alignment.** Body copy is always left-aligned. Centred text is allowed only in hero contexts (hero, comparison head, CTA panel) and inside tiles (stat/macro). Never centre a paragraph longer than two lines.
- **Case.** Display = caps (the font enforces it). Eyebrows, chips, buttons, labels, captions = caps via CSS. Body and leads = sentence case. Never title case.
- **Emphasis** inside body copy is `<strong>` in `--fg` on muted text — not red, not italic. Italic is reserved for the tagline.
- **Numbers** in running copy are words up to nine, digits from 10; macros are always digits with a unit (`30g`, `470 cal`).

---

## 4. Hierarchy rules

Every section is built from the same ladder, top to bottom, and skips no rungs:

```
eyebrow  →  statement (h1/h2)  →  lead (optional)  →  content  →  action (optional)
```

- **One h1 per page** in DOM terms (the hero wordmark on the home page, the product name on the PDP). Visual h1 size (`--text-h1`) may be used by a section statement, but it is an `<h2>` in markup.
- **Size says importance.** Statement > lead > body > label. Never put two display sizes next to each other with less than one full step between them (h1 next to h3 is fine; h2 next to h3 is not).
- **Three levels per view.** A card or tile has at most three type levels (eyebrow / name / chips-or-copy). A section has at most four (eyebrow / statement / lead / content).
- **Weight never substitutes for size.** Montserrat 700 is for UI and labels; it doesn't make a heading.
- **Colour is the last resort.** Hierarchy comes from size and spacing first, muted colour second, red never (red is interaction/emphasis, not rank).
- **Section order (home).** Hero → Lineup (`#order`) → How it works (`#how`) → About Pratus (`#story`, dark) → Us vs them (`#why`) → Gallery → CTA → Mission (parked, to be deleted) → Footer. Light/dark alternates: white · white · **ink** · paper · white · red panel · ink footer.
- **Section head spacing.** Eyebrow → statement gap `--s-4`; head → content gap `clamp(40px, 5vw, 72px)`; statement → lead sits in the same head grid.

---

## 5. Spacing & gutters

**Base unit: 4px.** Use tokens, not arbitrary pixels.

| Token | px | Typical use |
|---|---|---|
| `--s-1` | 4 | Chip icon gap, nav link gap |
| `--s-2` | 8 | Chip gap, badge padding, small stacks |
| `--s-3` | 12 | Eyebrow dash gap, row gap inside cards, list items |
| `--s-4` | 16 | Eyebrow → heading, paragraph gap, card body rows |
| `--s-5` | 24 | Tile padding, nav link padding, chip row → caption |
| `--s-6` | 32 | Card padding, button padding, story copy top |
| `--s-7` | 48 | Section-head → action, footer column gap, step number → title |
| `--s-8` | 64 | PDP hero padding, large stacks |
| `--s-9` | 96 | Footer top padding |
| `--s-10` | 128 | — |
| `--s-11` | 160 | — |

### Page layout
| Token | Value | Meaning |
|---|---|---|
| `--container` | `1440px` | Max content width |
| `--gutter` | `clamp(20px, 4vw, 56px)` | Page edge padding (20 at 375 → 40 at 1000 → 56 at 1400+) |
| `--gap` | `clamp(16px, 2vw, 32px)` | Between grid items and cards |
| `--section-y` | `clamp(88px, 11vw, 176px)` | Vertical padding for every section. `.section--tight` = 60% |
| `--nav-h` | `72px` | Fixed nav height (pills are 48px inside it) |

Rules:
- The gutter is the **only** horizontal page padding. Full-bleed elements (hero, About photo, gallery track, footer) run edge to edge; their content still aligns to the container. The gallery track pads its inline start with `max(gutter, (100vw − container)/2)` so the first tile lines up with the section head.
- Internal padding steps down with the element: section frame `--s-6`+ · card `--s-6` · tile `--s-5` · chip `6px 12px` · pill 0 (height only).
- Vertical rhythm between stacked things inside a component: `--s-2` for tightly bound pairs (number → label), `--s-3` for rows, `--s-4` for paragraphs, `--s-6`/`--s-7` before an action.
- Two elements never touch: minimum gap is `--s-2`.

### Breakpoints
`600` (single-column footer) · `768` (mobile nav, 1-col grids, stacked deck, stacked heat labels) · `1024` (2-col grids, stacked splits, stacked About).

---

## 6. Layout & alignment (knolling)

A 12-column mental model, expressed as `.grid-3` / `.grid-2` (3 → 2 → 1 columns at 1024 / 768).

**Rules for anything laid out in a row or a grid:**
1. **Shared rows.** Sibling cards that carry the same parts (number / title / copy) use CSS subgrid so each part lives on one row across all cards. Titles start on the same line, copy starts at the same height, regardless of how many lines a title wraps to (`.steps` / `.step`).
2. **Shared columns.** Label + text pairs share one label column across the list (`.heat`), so every text column starts at the same x. On phones the label stacks above the text instead — a shared column would starve the copy.
3. **Top-align in rows, bottom-align only in heads.** Content in a row of cards aligns to the top (`align-items: start`). The only end-aligned pairing is a section head's statement + lead (`.section__head--split`), which share a baseline.
4. **Equal heights come from the grid,** never from `min-height` guesses. (`min-height` on the deck cards broke the phone layout; the aspect ratio owns the height now.)
5. **Centre the subject, not the box.** A product photo is centred on the pouch (see §10), and the pouch is the same size across the row.
6. **Optical, not mathematical, where type is involved.** The hero wordmark gets `padding-left: 0.06em` to balance its trailing tracking; a chip with an icon leads with `--s-1` less padding. Everything else is mathematical.
7. **Symmetry in pairs.** Split layouts are `0.9fr 1.1fr` or `1.1fr 0.9fr` (media : text), never 1:1 — the text side is always the wider one.
8. **Deck.** The three lineup cards sit in a fanned stack: ±6°, overlapping 7%, centre card on top. Below 768 they stack vertically with `--gap`.

---

## 7. Corner radii

| Token | Value | Applies to |
|---|---|---|
| `--r-xs` | 6px | Focus rings on square things, tiny tags |
| `--r-sm` | 12px | Inputs, small tiles, the "us" check squares (10px) |
| `--r-md` | 20px | Media inside cards, stat/macro tiles, heat items |
| `--r-lg` | 28px | Product cards, step cards, gallery tiles, buy panel, mobile nav dropdown |
| `--r-xl` | 40px | Section frames: comparison table wrap, CTA panel |
| `--r-pill` | 999px | Buttons, nav pills, chips, inputs, toast, qty stepper |

Rule of thumb: the larger the element, the larger the radius; a child never has a larger radius than its parent (`--r-md` inside `--r-lg` inside `--r-xl`). Full-bleed sections (hero, About, footer) have no radius.

---

## 8. Surfaces & elevation

| Surface | Background | Border | Shadow |
|---|---|---|---|
| Page | `--bg` (Urad white) | — | — |
| Tile / step / heat item | `--bg-elev` (paper) | 1px `--line` | `--shadow-1` (stat only) |
| Product card | product gradient | — | `--shadow-card` → `--shadow-card-lift` |
| Comparison frame | paper; PRATUS column Urad white | 1px `--line` | — |
| Glass (nav pills, buy panel) | `--glass-bg` 86% Urad white + `blur(18px) saturate(1.4)` | 1px inner white hairline `--glass-line` | `--shadow-1` / `--shadow-2` |
| Dark section (`.theme-dark`) | `--c-ink` | alpha-white lines | — |
| Toast | ink | — | `--shadow-3` |

| Shadow token | Use |
|---|---|
| `--shadow-1` | Resting pills and stat tiles |
| `--shadow-2` | Hover lift, floating panels, buy panel |
| `--shadow-3` | Strong hover on cards, toasts |
| `--shadow-card` / `--shadow-card-lift` | Deck cards at rest / pulled out |
| `--shadow-glow-red` | Primary button hover |

Shadows are ink-tinted, never grey. Elevation only ever steps **up** on hover (1 → 2, card → card-lift); nothing gets flatter on interaction.

The stylesheet is linked from `<head>` (not imported from JS) so there is never a flash of unstyled content.

---

## 9. Icons

One set, drawn inline as SVG, always `currentColor`.

| Where | Size | Grid / stroke | Icons |
|---|---|---|---|
| Nav actions | 22px | 24 grid, 2px stroke, round caps + joins, no fill | menu (3 bars), account (circle + arc), cart |
| Gallery arrows | 18px in a 48px round outline button | 24 grid, 2px | arrow-left, arrow-right |
| Button arrow (`.btn__arrow`) | 14px | 16 grid, 2px | arrow-right; nudges 4px on hover |
| Table marks | 18px in a 32px (them) / 36px (us) box | 16 grid, 1.75px (them) / 2.75px (us) | check; "no" is an em dash, not an icon |
| Brand mark | 30px in the 64px brand pill; also the favicon | `/brand/ms-pratu.svg`, filled | the lifter |
| Qty stepper | text glyphs `−` / `+` at 1.25rem | — | — |

Rules:
- Stroke icons only; the brand mark is the only filled shape. No emoji, no icon fonts.
- An icon never stands alone without an accessible name (`aria-label` on the control, or `aria-hidden` when next to a text label).
- Icons take the text colour of their control and change with it (hover/active). They are never coloured red on their own.
- Don't introduce a new icon without adding it to this table.

---

## 10. Photography & imagery

- **Product card photos** are pre-framed by `scripts/optimize-images.mjs` (`npm run images -- cards`) to the card media box: **1.13 : 1**, pouch centred horizontally, pouch centre at **45%** of the height, pouch height **55%** of the frame. This is what makes the three products read at the same size on the deck. Add a new product by giving the script the pouch's bounding box (fractions of the oriented source); where the crop runs off the photo the edge is mirrored. The thepla source carries a wrong EXIF orientation — its sensor frame is the upright one, so it is framed with `rotate: false`.
- **Card treatment.** The photo fills the top 68% of the card and dissolves into the product gradient with a mask (`#000 62% → transparent`). Chips sit on the photo; text sits on the gradient. Hover scales the photo to 1.08 over 1.2s.
- **Full-bleed photo sections (About).** The portrait is pinned to the right 60% of the section at 112% height (room for parallax) and extended leftwards into solid ink with a horizontal gradient (`ink → ink 34% → 78% 48% → 28% 62% → 0 76%`); top and bottom scrims keep the section edges ink. Copy sits on the solid side, left-aligned. Below 1024 the photo stacks on top (`clamp(420px, 78vh, 640px)`) and fades into ink at the bottom; copy follows on solid ink. Never place copy over an unscrimmed photo.
- **Hero.** `Main hero.png` treatment: the photo with a top-heavy vignette (80% → 5% top to bottom) behind the wordmark, rendered through the WebGL ripple.
- **Home gallery** tiles are 4:5, even tiles offset 48px down; captions are frosted pills.
- **Product-page gallery** photos are the six best shots per product (`GALLERY` in the script, `npm run images -- gallery`), resized to a 1600px longest side and **never cropped on desktop**: the showcase gives every photo one shared height (`clamp(440px, 72vh, 820px)`; `60vh` under 1024) and lets its width follow the 3:2 or 2:3 ratio, so portrait and landscape sit side by side. `w`/`h` in `products.js` are the real pixel sizes so the stage lays out before the images load. On phones the slides become one uniform 4:5 column per swipe and the photo is cover-cropped to it (centre), which is why every gallery shot keeps its pouch near the middle of the frame. Nothing is ever drawn on top of a gallery photo — captions live in the bar under the stage.
- **Loader** is the real thepla (`/img/thepla-loader.webp`) clipped to a disc.
- Source photos live in `../Website Photos`; never commit edited JPGs — edit the script and re-run it. Output is WebP q80–82, max 2400px.

---

## 11. Components & states

Every interactive component has the same five states. The table lists what changes; anything not listed stays at rest values.

| State | Trigger | Motion |
|---|---|---|
| Rest | — | — |
| Hover | pointer over (`@media (hover)` devices) | `--dur` `--ease-out` |
| Focus | keyboard focus (`:focus-visible`) | 2px `--focus` ring, 3px offset, radius matches the control |
| Active | pressed | `--dur-fast`, lift returns to 0 |
| Disabled | `:disabled` / `aria-disabled` | 40% opacity, no pointer events, no hover |

### Buttons (`.btn`)
Pill, `min-height` 48px (`--sm` 40, `--lg` 56), padding `0 --s-6` (`--sm` `--s-5`, `--lg` `--s-7`), Montserrat 700, `--text-small` (`--sm` micro), `0.08em`, uppercase, `white-space: nowrap`. Optional trailing `.btn__arrow` (14px).

| Variant | Rest | Hover | Where |
|---|---|---|---|
| default | ink / white text | lift 2px, `--shadow-2`, sheen sweep | on white surfaces (About uses `--light` because it is dark) |
| `--primary` | red / white | lift 2px, `--shadow-glow-red`, sheen | the one red button per view: Add to cart, Join |
| `--light` | Urad white / ink | lift 2px, `--shadow-2`, sheen | on photos, gradients, dark sections, the red CTA |
| `--ghost` | transparent, 1.5px current-colour ring | fills with current colour, label inverts | secondary actions on any surface |

States: active = translateY(0) in `--dur-fast`; disabled = 40% opacity; busy (`.is-busy`) hides the label and shows a 16px ring spinner in the button's foreground colour (the only permitted loop). One `--primary` per view.

### Nav (`.nav`, `.pill`)
Three floating glass pills: brand mark (64px) · links · actions. Fixed, 72px tall, 48px pills, page gutter inset. Links are 40px pills, `--text-small` 700 `0.06em` caps: hover 8% ink wash; **active** (section in view) inverts to ink/white. Icon buttons are 40px round: hover 8% ink wash. Cart badge: 16px red pill, 10px/800, top-right of the icon. Under 768 the links pill becomes a dropdown (`.is-open`) under the nav, `--r-lg`, 52px rows, fades/slides in `--dur`.

### Chips (`.chip`)
Pill, `6px 12px`, micro/700/`0.04em` caps, frosted white 18% with a 28% hairline and 8px blur. On the paneer card they flip to 10% ink / 14% ink line. Chips are informational — no hover, no focus; never a button.

### Product card (`.card--paneer|rotli|thepla`)
4 : 5.2 gradient panel, `--r-lg`, `--shadow-card`. Photo top 68% masked into the gradient. Top row: protein chip + calorie chip. Body (bottom, `--s-6` padding, rows `--s-4`): day (eyebrow, no dash, 800) → name (`--text-h3`-ish display) → macro chips → price + `--sm` button. The whole card is one link (`.card__link` overlay); the button is a second target above it.
States: hover/focus-within in the deck pulls the slot out (`rotate(0) translateY(-32px) scale(1.06)`, `--shadow-card-lift`, 0.7s) and the photo scales to 1.08; standalone (PDP "Other fuel") lifts 6px with `--shadow-3`. Focus ring sits 4px inside the card edge. On phones the card is 4 : 6 so the pouch clears the text.

### Step card (`.step`)
Paper, `--r-lg`, 1px line, `--s-6` padding. Three subgrid rows: red display number (`01`), display title (`--text-h3`), muted copy. Hover lifts 4px with `--shadow-2`. Not a link.

### Stat / Macro tile (`.stat`, `.macro`)
Paper, `--r-md`, 1px line, `--s-5` padding. Display number (`[data-count]`, counts up on entry) with a `0.5em` unit, micro label `--s-2` below. Stats are left-aligned in a 3-up (2-up on phones); macros are centred in a 4-up (2-up). No hover — they are not interactive.

### Comparison table (`.compare`)
Paper frame, `--r-xl`, 1px line, `min-width: 760px` in a scrolling wrap. Row heads Montserrat 700 left; column heads micro eyebrows. "Them" cells: a thin grey-600 check or a grey-400 em dash, no chrome. PRATUS is the **last** column on Urad white with a yellow/blue/green stripe under the display logo; its cells are a bold check on a 36px tilted (−4° / 3° / −2°, the `--tilt` custom property) product-colour square with a matching soft shadow.
Hover a row (`@media (hover)`): the "them" cells warm to Urad white and the Pratus square does a one-shot wiggle (`mark-wiggle`, `--dur-slow`: ±14° around its own tilt while scaling to 1.18, settling back) with its shadow stepped up. Runs once per hover, never loops; off under reduced motion.

### Gallery
Native scroll-snap row; tiles `min(78vw, 560px)` wide, 4 : 5, `--r-lg`, even tiles offset `--s-7` down. Frosted pill captions bottom-left. Arrows: 48px round outline buttons in the head; hover fills ink/white and lifts 2px. Track scrolls by one tile + gap.

### About / Story (`.story`, dark)
Full-bleed ink section, `min-height clamp(640px, 92vh, 980px)`, content vertically centred. Left column: eyebrow → display quote (`--text-h2`, max `14ch`) → three muted paragraphs (`48ch`, strong in white) → `--light` button. Right: the founder portrait per §10, zooming in 1.12 → 1 on entry and drifting ±4% with scroll. Founder credit (`Founder` micro + `Pratiti` display) bottom-right over the photo; on phones it follows the copy.

### CTA band (`.cta__panel`)
`--r-xl` red gradient panel inside the gutters, `clamp(64px, 9vw, 128px)` padding, 6%-white ghost wordmark behind centred eyebrow (75% white) → `--text-h1` title → `--light --lg` button.

### Inputs (`.footer__input`, `.qty`)
Footer email: 48px pill, 6% white fill, 16% white line, placeholder grey-400. Hover 32% line; focus white line + 3px 14% white halo (no outline). Paired with a `--primary` Join button at `--s-2`.
Qty stepper: 48px pill outline (`--line-strong` 1.5px), 44px `−`/`+` buttons (hover 6% ink wash), 32px bold readout (`<output aria-live>`), never below 1.

### Toast (`.toast`)
Fixed bottom-centre, ink pill, `--text-small` 700 `0.04em`, `--shadow-3`. Slides up 20px + fades in `--dur`, stays 2.6s. `role="status"`.

### Product gallery (`.pgal`) + lightbox (`.lightbox`)
PDP section between the heating instructions and "Other fuel" (never above the macros — the hero and the numbers come first). Built like a Nike/Rhode showcase: the photos are big and clean, the chrome is under them.
- **Head.** Split head: eyebrow "In the wild" → `--h2` "Look closer." left; a right-aligned lead (`34ch`, "Shot where it gets eaten…") sharing the baseline. Stacks left-aligned under 768.
- **Stage.** A full-bleed native scroll-snap row, first slide aligned to the container. Slides are `--r-lg`, one shared height (§10), each at its own ratio; on phones one 4:5 column, `100vw − 2·gutter` wide. No caption, chip or scrim on the photo. The only overlay is a 40px frosted expand glyph top-right that rises in on hover (never on phones). Each slide is a `zoom-in` button that opens the lightbox.
- **Drag.** With a mouse the stage drags (pointer events; a move under 6px is still a click) and shows a 72px ink cursor pill reading "Drag" that follows the pointer (`gsap.quickTo`, 0.35s) and shrinks to 0.82 while dragging; the native cursor is hidden over the stage. Snap is suspended during the drag and restored 0.7s after release, when the stage has settled on the nearest slide in the direction of travel. Touch scrolls natively; fine-pointer only.
- **Bar.** Under the stage, inside the container: a 1px `--line-strong` hairline with an ink fill that tracks the scroll position continuously (`scaleX`); then index (`--text-h3` display, red, `01`) + caption (micro 800 caps) + description (small, muted, ≤ `44ch`, last two words glued) left, `01 / 06` count + the two 48px gallery arrows right. Caption text cross-fades 6px up / 8px in (0.16s out, 0.42s `power3.out` in, 0.04s stagger). On phones the caption row and the count/arrows row stack.
- **Motion.** The first three slides rise 40px and fade in over 1.1s `power3.out` (0.09s stagger) while their photos settle from 1.12 over 1.8s, once, when the stage reaches 85% of the viewport. Photos sit at `scale(1.14)` and drift up to ±6% horizontally as their slide passes the viewport centre (parallax on scroll). Under reduced motion: no entry, no drift, no cursor pill.
- **Lightbox.** Tapping opens the same list one photo at a time: ink at 94% with blur, the photo at `min(78vh, 900px)` with `--r-md` and `--shadow-3`, caption + count under it, 48px outline arrows either side (bottom corners on phones), close top-right. Fades in 0.32s while the photo settles from 0.96; photos slide 24px in the direction of travel. Escape / arrow keys / swipe / backdrop click all work; focus goes to Close and returns to the slide; body scroll is locked while open. Closing scrolls the stage to the photo you ended on.

### Account menu (`.account`)
The account icon opens a 280px glass popover (`--r-lg`, `--shadow-3`, same glass as the pills) hanging `--s-3` under the actions pill, right-aligned; on phones it is fixed under the nav at the gutter. Signed out: eyebrow → display line ("Sign in to reorder in one tap.") → full-width ink Sign in button → list (44px rows: Track an order, Subscription + "Soon" chip). Signed in (`?demo=account` until auth exists): the icon becomes a 28px initials avatar on the thepla gradient, the menu greets by name and lists Orders (count pill), Subscription, Addresses, Sign out. Opens with a 0.32s `power3.out` fade/drop, closes on outside click or Escape. Every item toasts "arrives with the shop launch" until wired. **Launch call:** cut the icon until there is something behind it (order history, subscriptions); the cart alone carries the shop.

### Checkout (`checkout.html`)
Reads the cart from `cart.js` (localStorage until the shop is wired). Head: eyebrow → `--text-h1` "Almost there." → lead. Two columns `1.1fr / 0.8fr` (stacked under 1024, summary first): left, three numbered paper blocks like the steps (red display number + display title on one baseline) — Contact, Delivery (2-column fields, `--r-sm` 48px inputs, choice cards for Standard/Express with the price on the right, Free once past the threshold), Payment (segmented Card / Apple Pay, "Test mode" chip) — then the one `--primary --lg` full-width Place order button carrying the total. Right, a sticky paper panel: eyebrow + meal count, line items (72px pouch thumb on the product gradient, day eyebrow, display name, Remove link, price + 36px qty stepper), free-shipping meter (6px stripe bar in the three product colours, green once unlocked), promo row, totals with the total in display type. Empty state and order-in state are centred panels (`--h2` statement, lead, ink button); the done state opens with a 56px yellow check that springs in.

### Product page (`product.html?p=slug`)
Full-height gradient hero coloured by product; photo masked into the gradient (`#000 45% → transparent 95%`, scale 1.08 → 1 on load); eyebrow → `--text-h1` name → lead tagline left, glass buy panel (`--r-lg`, min 300px) bottom-right with display price, qty stepper + `--primary` Add to cart, micro shipping note. Then: macro tiles (count up), copy + heating list (knolled label column), the other two products as cards.

---

## 12. Motion

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(.22,1,.36,1)` | Default for anything arriving or lifting |
| `--ease-in` | `cubic-bezier(.64,0,.78,0)` | Only for things leaving (loader bite fade) |
| `--ease-slam` | `cubic-bezier(.85,0,.15,1)` | Impact entrances (tagline) |
| `--dur-fast` | 160ms | Press feedback |
| `--dur` | 320ms | Hover, colour, toast |
| `--dur-slow` | 640ms | Card lift, sheen sweep |

GSAP equivalents: `power3.out` to arrive, `power4.out` for split words, `power3.inOut` to settle, `power2.out` for fades, `elastic.out(1, .4)` for the cart badge pop, `back.out(1.5)` for loader bites. **Opacity is never eased in** (it reads as a pop at the end) — fade with `power2.out` while position/scale settles.

### Vocabulary (`src/js/motion.js`, `hero.js`)
| Name | Trigger | What happens |
|---|---|---|
| Loader | page load | The thepla disc is eaten bite by bite (8 bites, `back.out` stagger 0.17s) while the hero texture and fonts load, min 1.4s; fades out 0.7s into the hero intro |
| Hero intro | after loader | Letters ease down 60% with `power3.out` (0.9s, 0.05s stagger); nav pills fade/slide in `power3.out` 0.8s, stagger 0.08 (`clearProps` afterwards so the mobile menu's own styles win) |
| Slam | once, tagline only | Opacity 0→1 over 0.5s `power2.out` while scale 1.4→1 + blur 5→0 settle over 0.75s `power3.inOut`; on arrival one WebGL ripple (0.7), a 2px nudge, a faint shockwave ring (45% → 0). Never re-triggers |
| Ambient ripples | pointer / click on hero | 0.12 strength throttled to ~4/s; click 0.45 |
| Reveal `[data-reveal]` | 88% viewport, once | Rise 28px + fade, 1s `power3.out`; `data-reveal-delay` staggers siblings by 0.08s |
| Split `[data-split]` | 85% viewport, once | Words rise 110% out of a clipped line, 0.9s `power4.out`, 0.06s stagger; last two words never separate |
| Counter `[data-count]` | 85% viewport, once | 0 → value over 1.4s `power3.out`, rounded, tabular digits; used by home stats and PDP macros |
| Story photo | section at 75%, once + scroll | Scale 1.12 → 1 over 1.8s `power3.out`; y drifts −4% → +4% scrubbed across the section |
| PDP intro | load | Name rises 30% + fades 1s `power4.out`; photo scale 1.08 → 1 over 1.6s; tagline + buy panel rise 24px, 0.9s, stagger 0.1 |
| Cart badge | add to cart | Scale 1.6 → 1 `elastic.out(1, .4)` 0.5s |
| PDP gallery | stage at 85%, once + scroll | First three slides rise 40px + fade 1.1s `power3.out` (0.09s stagger), photos settle 1.12 → 1 over 1.8s; photos drift ±6% with scroll; caption cross-fades on slide change; the Drag pill follows the pointer at 0.35s |
| Lightbox | tap a gallery slide | Overlay fades 0.32s `power2.out`, photo scales 0.96 → 1 over 0.5s `power3.out`; prev/next slide ±24px, 0.18s out / 0.4s in |
| Compare wiggle | hover a table row | Pratus square wiggles ±14° around its tilt, 1.18 scale, `--dur-slow`, once |
| Account menu | icon click | Fade + drop 8px + scale 0.98 → 1, 0.32s `power3.out` |
| Checkout line remove | Remove | Row slides 16px right and fades, 0.28s `power2.out`, then the list re-renders |
| Order in | Place order | Busy spinner 1.4s → done panel rises 28px; the check springs in `elastic.out(1, .5)` from scale 0 / −40° |
| Hover lifts | pointer | Buttons −2px, steps −4px, cards −6px, deck slot −32px + 1.06; shadow steps up one level |

### Rules
- Respect `prefers-reduced-motion`: the hero shows the static photo, reveals are instant, counters show their final value, the story photo is static.
- **No infinite or looping animation** (no marquees, bouncing scroll cues, pulsing dots). The only exceptions are the loader while loading and a busy button's spinner.
- Entrances are one-shot (`once: true`). Nothing replays on scroll-back.
- Stagger siblings, never a whole page: max stagger group is one row (≤ 4 items, ≤ 0.24s total).
- Durations: micro feedback ≤ 200ms, hover ≤ 320ms, entrances 0.8–1.8s. Nothing longer than 2s except the loader.
- Anything rendered after load (cards, macros) must call `animate(root)` so it gets the same reveals, counters and orphan glue.

---

## 13. Interaction

- **Targets.** Minimum 40×40px (nav icons, `--sm` buttons); 44px on the qty stepper; 48px for primary actions.
- **Whole-card links.** Product cards are one link with a second, real button inside; the deck slot lifts on `:focus-within` so keyboard users get the same pull-out as hover.
- **Hover is a hint, not a requirement.** Every hover state has a rest state that already communicates the affordance (pill shape, outline, arrow). Touch devices lose nothing.
- **Pointer cues.** Hover lifts always pair with a shadow step-up; the arrow icon nudges 4px right; photos scale to 1.05–1.08. No colour-only hovers except the 8% wash on nav pills.
- **Focus** is always visible: 2px red ring, 3px offset, radius matching the control (pill on pills, `--r-xs` elsewhere, 4px inside on cards). Never `outline: none` without a replacement (the footer input swaps it for a white halo).
- **Nav** tracks the section in view (IntersectionObserver, ±45% root margin) and inverts the active link. Anchor scrolls are smooth (auto under reduced motion). The mobile menu closes on link tap.
- **Gallery** is native scroll-snap; arrows are a convenience that scroll by one tile. It works with a trackpad, a finger, or the keyboard.
- **Forms** never submit silently: the newsletter shows a toast and resets; Add to cart stores the line, bumps the badge and toasts with a Checkout link; checkout validates natively (`reportValidity`), shows the busy spinner, then the done state. (All front-end only until wired.)
- **Nothing hijacks scroll.** No scroll-jacking, no pinned sections; the story photo's drift is a scrubbed parallax, not a pin.
- **Hero canvas** accepts pointer movement (ripples) and click; the tagline is the only text with `pointer-events: auto` inside the hero, and it is not selectable.

---

## 14. Accessibility

- Contrast: ink on Urad white 17:1; muted grey-600 on white 6.7:1; white on `#244435`/`#2C92FF`/`#820000` ≥ 4.5:1; ink on `#F6CB42` 11:1. White on photos always sits on a scrim.
- Every icon control has an `aria-label`; decorative SVG/photos are `aria-hidden` / empty `alt`. The wordmark letters are `aria-hidden` inside an `aria-label="PRATUS"` heading.
- Table marks carry `aria-label="Yes|No"`; row heads use `scope`.
- `prefers-reduced-motion` handled in CSS (`.reduced-motion`) and JS (`reduced`).
- `.no-js` shows all content with reveals disabled and the loader hidden.
- Live regions: qty readout `aria-live="polite"`, toast `role="status"`.

---

## 15. Voice

All copy lives in `src/content/*.json` and is filled into the pages at build time (`scripts/vite-content.mjs`); the markup holds structure only. Headlines are typed in sentence case there and set in caps by the display font. `<strong>` is the one tag allowed inside a copy string.


Short. Declarative. Gym-floor confidence, kitchen-table warmth. Product names keep their label prefix (**Push Day** Paneer Paratha, **Pr-otein** Rotli, **Thunder Thigh** Thepla). Site copy talks about **fuel**, not "days" ("Pick your fuel", "Other fuel"). Copy on packaging is canonical — reuse it verbatim where possible. Statements end with a full stop, even at display size ("Pick your fuel."). Eyebrows and chips don't.

---

## 16. Files & checklist

```
site/
├─ index.html               home
├─ product.html             product template (reads ?p=)
├─ checkout.html            cart + checkout (reads cart.js)
├─ DESIGN.md                this file
├─ src/styles/tokens.css    all tokens
├─ src/styles/main.css      base + components
├─ src/js/motion.js         reveals, split headlines, counters, no-orphan glue (shared)
├─ src/js/nav.js            burger, section highlight, cart badge, account menu, toast (shared)
├─ src/js/cart.js           cart state in localStorage, shipping maths (shared)
├─ src/js/main.js           loader → hero, lineup render, story parallax
├─ src/js/hero.js           three.js slam + ripple
├─ src/js/products.js       catalogue + shipping methods (prices are placeholders)
├─ src/js/product-page.js   PDP render, add to cart
├─ src/js/checkout.js       checkout render, delivery/payment, simulated order
├─ src/vendor-gsap/         GSAP 3.15 ESM (from gsap-public)
├─ scripts/optimize-images.mjs  raw JPG → WebP, card framing (npm run images [-- cards])
├─ scripts/qa-shots.mjs         headless-Chrome screenshots
├─ scripts/build-share.mjs      single-file review copies
└─ public/img, public/fonts, public/brand
```

**Before you ship a section, check:**
- [ ] Every value is a token; no new hex, px or ms literals in `main.css`.
- [ ] Eyebrow → statement → lead → content → action, in that order, nothing skipped.
- [ ] No line ends on a single word (resize to 390, 768, 1024, 1440 and look).
- [ ] Sibling titles start on the same line; sibling copy starts at the same height; label columns share a width.
- [ ] Product photos are framed by the script, not by `object-position`.
- [ ] Hover, focus, active and disabled states all exist and step elevation **up**.
- [ ] Entrances use the vocabulary in §12 and run once; nothing loops.
- [ ] Reduced motion and no-JS both show everything.
- [ ] Red appears only on interactive or emphasised things; one primary button per view.
