import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// /admin is the admin-dashboard/ project, built separately and copied into
// public/admin (see the build:admin script). In dev, Vite's own SPA history
// fallback would otherwise intercept extensionless requests like "/admin"
// before the static file is reached and serve this site's index.html instead.
// Rewriting the request to the explicit file here keeps the clean URL working
// in dev the same way it does in production.
function adminFallback(): Plugin {
  return {
    name: 'admin-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/admin')) {
          const pathname = req.url.split('?')[0];
          const lastSegment = pathname.split('/').pop() ?? '';
          if (!lastSegment.includes('.')) {
            req.url = '/admin/index.html';
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [adminFallback(), react(), tailwindcss()],
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
