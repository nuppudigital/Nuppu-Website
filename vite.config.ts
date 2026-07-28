import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// /app-preview and /admin are separate standalone SPAs (app-prototype/ and
// admin-dashboard/) served as static files from public/app-preview and
// public/admin. In dev, Vite's own SPA history fallback intercepts
// extensionless requests like "/app-preview/" before the static file is
// reached and serves this site's index.html instead. Rewriting the request
// to the explicit file here (registered without returning a function, so it
// runs before Vite's internal middlewares) keeps the clean URL working in
// dev the same way it does in production.
function staticSpaFallback(prefix: string): Plugin {
  return {
    name: `${prefix.slice(1)}-fallback`,
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith(prefix)) {
          const pathname = req.url.split('?')[0];
          const lastSegment = pathname.split('/').pop() ?? '';
          if (!lastSegment.includes('.')) {
            req.url = `${prefix}/index.html`;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    staticSpaFallback('/app-preview'),
    staticSpaFallback('/admin'),
    // React and Tailwind plugins are required for this project setup.
    // Keep both plugins enabled unless the build setup is intentionally changed.
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
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
      // Matches the backend's default PORT (see api/index.js / .env.example).
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
