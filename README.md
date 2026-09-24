# Pratus Kitchen — front end

## 🎨 Design system

**→ [design-system/](design-system/)** — the rules ([DESIGN.md](design-system/DESIGN.md)), the tokens ([tokens.css](src/styles/tokens.css)), the components ([main.css](src/styles/main.css)), the motion vocabulary ([motion.js](src/js/motion.js)), fonts, mark and icons. Start with the [index](design-system/README.md).

---

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # → dist/
npm run images     # regenerate public/img from ../Website Photos
npm run images -- cards   # just the three lineup card photos (pouch-centred framing, see design-system/DESIGN.md §10)
node scripts/qa-shots.mjs qa   # headless-Chrome screenshots of every section (desktop, mobile, PDP)
node scripts/build-share.mjs index --product=<url>    # single-file review copy → share/index.html
node scripts/build-share.mjs product --home=<url>     # single-file review copy → share/product.html
node scripts/build-site-artifact.mjs                  # whole site, relative paths → dist-share/site (one multi-file review link)
```

The `share/` files are what gets published as review links (Claude Artifacts); every asset is inlined so one file is the whole page.

## Who edits what

| Area | Where | Owner |
|---|---|---|
| Copy: every sentence, label, caption, product name, price | `src/content/*.json` | Bansari |
| Design: layout, styles, motion, images, markup | `*.html`, `src/styles/`, `src/js/`, `public/` | Madhumita |
| The API both sides build to | `docs/API-CONTRACT.md` | both |

Copy is filled into the pages at build time by `scripts/vite-content.mjs`: a page says
`{{ home.lineup.title }}` and gets the string from `src/content/home.json`. Lists (steps,
comparison rows, products) are rendered from the same files by the page scripts. A placeholder
with no matching key fails the build with the key named. See `docs/EDITING-COPY.md`.

## Backend

The front end talks to the backend only through `src/js/api.js`, against `docs/API-CONTRACT.md`.
Copy `.env.example` to `.env.local`: with `VITE_API_URL` empty the shop is simulated in the
browser; set it to `/api` and run the backend on `API_PROXY_TARGET` to go live locally. In
production, `vercel.json` rewrites `/api/*` to the backend's URL.

- Design system: [design-system/](design-system/) — rules, tokens, components, motion.
- Shared motion + typography behaviours: `src/js/motion.js` (`animate(root)` after rendering anything).
- Prices and shipping rates in `src/content/products.json` are placeholders.
