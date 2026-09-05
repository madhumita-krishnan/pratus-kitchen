// Shared motion + typography behaviours. One vocabulary for every page (DESIGN.md §8–§9).
import { gsap } from '../vendor-gsap/index.js';
import { ScrollTrigger } from '../vendor-gsap/ScrollTrigger.js';

gsap.registerPlugin(ScrollTrigger);
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced) document.documentElement.classList.add('reduced-motion');
document.documentElement.classList.remove('no-js');

const NBSP = ' ';

/* ---- Typography: no orphans ------------------------------------------
   The last two words of every heading, paragraph and caption are glued with a
   non-breaking space so a line never ends on a single word. `text-wrap: pretty`
   in the CSS does the same where the browser supports it; this is the guarantee. */
export function glueLastWords(el) {
  if ('split' in el.dataset || 'noglue' in el.dataset) return;
  if (el.textContent.trim().split(/\s+/).length < 4) return;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  let wordAfter = false;
  for (let i = nodes.length - 1; i >= 0; i--) {
    const t = nodes[i].nodeValue;
    const body = t.replace(/\s+$/, '');
    if (wordAfter && body.length < t.length) { nodes[i].nodeValue = body + NBSP; return; } // gap before a word in the next node
    const k = body.lastIndexOf(' ');
    if (k > 0) { nodes[i].nodeValue = body.slice(0, k) + NBSP + body.slice(k + 1) + t.slice(body.length); return; }
    if (body.trim()) wordAfter = true;
  }
}
export function noOrphans(root = document) {
  root.querySelectorAll('h1, h2, h3, h4, p, li, figcaption, .lead').forEach(glueLastWords);
}

/* ---- Scroll reveal: rise 28px + fade, once, at 88% of the viewport ---- */
export function reveals(root = document) {
  const els = root.querySelectorAll('[data-reveal]');
  if (reduced) { els.forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; }); return; }
  els.forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      delay: Number(el.dataset.revealDelay || 0),
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
}

/* ---- Split headline: words rise out of a clipped line ------------------
   The last two words share a no-wrap group so the headline can't orphan either. */
export function splits(root = document) {
  root.querySelectorAll('[data-split]').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    const w = (t) => `<span class="split__w"><span>${t}</span></span>`;
    const glue = words.length >= 3 ? 2 : 0;
    el.innerHTML = words.slice(0, words.length - glue).map(w).join(' ')
      + (glue ? ` <span class="split__glue">${words.slice(-glue).map(w).join(' ')}</span>` : '');
    if (reduced) return;
    gsap.from(el.querySelectorAll('.split__w > span'), {
      yPercent: 110, duration: 0.9, ease: 'power4.out', stagger: 0.06,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });
}

/* ---- Counters: [data-count="30"] eases 0 → 30 over 1.4s when it scrolls in ---- */
export function counters(root = document) {
  root.querySelectorAll('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const node = el.firstChild; // the text node; a <small> unit may follow it
    if (reduced) { node.textContent = end; return; }
    const o = { v: 0 };
    gsap.to(o, {
      v: end, duration: 1.4, ease: 'power3.out',
      onUpdate: () => { node.textContent = Math.round(o.v); },
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });
}

/* Run the full set on a root. Call again for anything rendered later. */
export function animate(root = document) {
  noOrphans(root);
  splits(root);
  reveals(root);
  counters(root);
}

export { gsap, ScrollTrigger };
