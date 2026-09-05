import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// SHARE_ENTRY=index|product builds one page into dist-share/<entry> as a single chunk
// (used by scripts/build-share.mjs to make the self-contained review build).
const share = process.env.SHARE_ENTRY;
const inputs = {
  main: resolve(import.meta.dirname, 'index.html'),
  product: resolve(import.meta.dirname, 'product.html'),
  checkout: resolve(import.meta.dirname, 'checkout.html'),
};

export default defineConfig({
  build: share
    ? { outDir: `dist-share/${share}`, emptyOutDir: true, rollupOptions: { input: inputs[share === 'index' ? 'main' : 'product'] } }
    : { rollupOptions: { input: inputs } },
});
