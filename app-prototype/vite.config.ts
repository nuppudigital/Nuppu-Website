import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Served as a static SPA from Nuppu Website/public/app-preview — see that
  // project's vite.config.ts (dev fallback) and vercel.json (rewrite rule).
  base: '/app-preview/',
  plugins: [react(), tailwindcss()],
});
