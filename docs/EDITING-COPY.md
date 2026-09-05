# Editing the website copy

Every word on the site lives in five JSON files in `src/content/`. Change the text there,
push, and the live site updates. You never need to open an HTML, CSS or JS file.

| File | What is in it |
|---|---|
| `site.json` | Navigation labels, the account menu, the footer, the newsletter messages |
| `home.json` | The home page top to bottom: hero tagline, lineup, how it works, story, comparison table, gallery captions, call to action |
| `product.json` | Product-page copy that is the same for every product: headings, heating steps, gallery lead, button labels |
| `products.json` | The catalogue: each product's name, tagline, description, macros, price, photo captions; shipping methods and rates |
| `checkout.json` | The checkout page: every label, hint, note, the empty-bag state, the order-placed state, error and promo messages |

## The rules

1. **Edit the right-hand side only.** Each line is `"key": "text"`. Change the text. Never change,
   remove or reorder the key on the left — the page looks the string up by that name, and a
   missing key stops the build with an error naming the key.
2. **Keep the quotes and commas.** A missing comma or an unescaped `"` inside a string breaks the
   file. Write a straight double quote inside text as `\"`, or use curly quotes “ ” instead.
   GitHub's editor highlights JSON errors before you commit.
3. **Headlines are typed in sentence case.** The display font sets them in capitals on its own.
   `"title": "Pick your fuel."` renders as PICK YOUR FUEL.
4. **`<strong>` is the only tag allowed** inside a string. It makes a phrase bold (white on the dark
   story panel). No links, line breaks or other HTML.
5. **Never change a `slug`** in `products.json`. It is the product's web address and the key the cart
   and the backend use. `id` values under `shipping.methods` are the same kind of thing.
6. **Lines starting with an underscore** (`"_readme"`, `"_note"`) are notes to you. They are ignored
   by the site. You can edit or delete them freely.
7. **Lists stay lists.** `steps`, `paragraphs`, `rows`, `items`, `gallery` are arrays. You can edit any
   entry and add or remove entries in `steps`, `paragraphs` and `rows`. `gallery` and `items` are paired
   with photos in the design, so keep those six entries six.
8. **Numbers stay numbers.** `price`, `macros`, `value`, `freeOver` are numbers, not strings: `14`, not `"14"`.

## What you will see

- Edits show on the live site within a couple of minutes of pushing to `main`.
- Locally, `npm run dev` shows changes the moment you save the file.
- If a build fails, the deploy log names the missing key or the line with the JSON error.

## What the design owns

Spacing, type sizes, colours, photos, layout and motion all live outside `src/content/`. If a piece of
copy needs a different treatment, or you need a new field that does not exist yet, ask Madhumita
rather than editing the page files: the page is what looks the key up, so a new key needs a new
placeholder in the markup too.
