import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'node:path';
import content from './scripts/vite-content.mjs';

// SHARE_ENTRY=index|product builds one page into dist-share/<entry> as a single chunk
// (used by scripts/build-share.mjs to make the self-contained review build).
const share = process.env.SHARE_ENTRY;
const inputs = {
  main: resolve(import.meta.dirname, 'index.html'),
  product: resolve(import.meta.dirname, 'product.html'),
  checkout: resolve(import.meta.dirname, 'checkout.html'),
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, '');
  return {
    plugins: [content()],
    // In development, /api/* is forwarded to the backend running locally (see .env.example).
    server: { proxy: { '/api': { target: env.API_PROXY_TARGET || 'http://localhost:8000', changeOrigin: true } } },
    build: share
      ? { outDir: `dist-share/${share}`, emptyOutDir: true, rollupOptions: { input: inputs[share === 'index' ? 'main' : 'product'] } }
      : { rollupOptions: { input: inputs } },
  };
});
