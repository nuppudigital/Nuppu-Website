import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Deployed standalone at admin.nuppuapp.fi (its own Vercel project, Root
  // Directory = admin-dashboard) - base '/' there. The root project's legacy
  // build:admin script still copies dist/ into Nuppu Website/public/admin/
  // and serves it at the /admin subpath during cutover, so it sets
  // ADMIN_BASE_PATH=/admin/ to override this default - see that project's
  // package.json and vercel.json.
  base: process.env.ADMIN_BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
});
