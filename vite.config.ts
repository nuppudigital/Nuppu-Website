import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// /admin (admin-dashboard/) and /app-preview (app-prototype/) are separate
// standalone projects, each built on its own and copied into public/admin
// and public/app-preview respectively (see the build:admin / build:prototype
// scripts). In dev, Vite's own SPA history fallback would otherwise intercept
// extensionless requests like "/admin" or "/app-preview" before the static
// file is reached and serve this site's index.html instead. Rewriting the
// request to the explicit file here keeps the clean URL working in dev the
// same way it does in production.
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
