import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Forward API calls to the Cloudflare Worker running via `npm run dev` in ../backend
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
});
