import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  css: {
    // The Next.js app in the parent folder ships a Tailwind v3 postcss config.
    // An inline (empty) config stops Vite walking up and picking it up.
    postcss: {},
  },
  server: {
    // Forward API calls to the Cloudflare Worker running via `npm run dev` in ../backend
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
});
