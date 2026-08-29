import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// admin-dashboard/ and app-prototype/ get built separately and copied into
// public/admin and public/app-preview (see build:admin / build:prototype). Without
// this, Vite's dev-mode SPA fallback intercepts "/admin" and "/app-preview" and
// serves this site's own index.html instead of the sub-app's.
function staticSubAppFallback(mountPath: string): Plugin {
  return {
    name: `${mountPath.slice(1)}-fallback`,
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith(mountPath)) {
          const pathname = req.url.split('?')[0];
          const lastSegment = pathname.split('/').pop() ?? '';
          if (!lastSegment.includes('.')) {
            req.url = `${mountPath}/index.html`;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    staticSubAppFallback('/admin'),
    staticSubAppFallback('/app-preview'),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // only for raw asset imports - don't add .css/.tsx/.ts here, that'll break things
  assetsInclude: ['**/*.svg', '**/*.csv'],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    proxy: {
      // keep in sync with the backend's default PORT (api/index.js / .env.example)
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
