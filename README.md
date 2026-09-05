# Pratus Kitchen — front end

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # → dist/
npm run images     # regenerate public/img from ../Website Photos
npm run images -- cards   # just the three lineup card photos (pouch-centred framing, see DESIGN.md §10)
node scripts/qa-shots.mjs qa   # headless-Chrome screenshots of every section (desktop, mobile, PDP)
node scripts/build-share.mjs index --product=<url>    # single-file review copy → share/index.html
node scripts/build-share.mjs product --home=<url>     # single-file review copy → share/product.html
```

The `share/` files are what gets published as review links (Claude Artifacts); every asset is inlined so one file is the whole page.

Debug hooks on the home page: `window.__pratus.ripple(x, y, strength)` (x, y in 0–1) and `window.__pratus.slam()`.

- Design system: [DESIGN.md](DESIGN.md) — tokens, hierarchy, knolling/no-orphan rules, states, icons, motion.
- Shared motion + typography behaviours: `src/js/motion.js` (`animate(root)` after rendering anything).
- Prices in `src/js/products.js` are placeholders.
- Cart / newsletter are front-end only — wire to Shopify, Stripe or Klaviyo when ready.
