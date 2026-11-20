import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'MarketMind AI',
        short_name: 'MarketMind',
        description: 'Smart Market Inventory Management and AI-Powered Sales Forecasting for Onitsha Traders',
        theme_color: '#0F172A',
        background_color: '#0F172A',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // Cache the app shell so it loads instantly on repeat visits
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            // Analytics data: network first, 5-minute cache
            urlPattern: /^https:\/\/.*\/api\/analytics\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'analytics-cache',
              expiration: { maxAgeSeconds: 300 },
            },
          },
          {
            // Dashboard stats: network first, 1-minute cache
            urlPattern: /^https:\/\/.*\/api\/.*dashboard.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'dashboard-cache',
              expiration: { maxAgeSeconds: 60 },
            },
          },
          {
            // Google Fonts: cache-first so the font never re-downloads
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },

  build: {
    // Raise the warning threshold slightly — we know what our chunks look like
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        /**
         * Manual chunk strategy:
         *
         * vendor-react      — React core + router (always needed, tiny, cached forever)
         * vendor-query      — TanStack Query (always needed)
         * vendor-charts     — Recharts + framer-motion (only on chart pages)
         * vendor-utils      — date-fns, clsx, lucide (always needed but small)
         * vendor-misc       — axios, zustand, react-hot-toast (always needed)
         *
         * Everything else (page components) becomes its own automatic chunk
         * via the lazy() calls in App.tsx.
         */
        manualChunks(id) {
          // React core + DOM + Router — keep together, always loaded
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router-dom/') ||
            id.includes('node_modules/react-router/')
          ) {
            return 'vendor-react';
          }

          // Recharts + framer-motion are large — isolate them so they only
          // load when the user opens a chart page
          if (
            id.includes('node_modules/recharts') ||
            id.includes('node_modules/framer-motion') ||
            id.includes('node_modules/d3-')
          ) {
            return 'vendor-charts';
          }

          // TanStack Query
          if (id.includes('node_modules/@tanstack/')) {
            return 'vendor-query';
          }

          // date-fns + clsx + tailwind-merge + lucide
          if (
            id.includes('node_modules/date-fns') ||
            id.includes('node_modules/clsx') ||
            id.includes('node_modules/tailwind-merge') ||
            id.includes('node_modules/lucide-react')
          ) {
            return 'vendor-utils';
          }

          // axios + zustand + react-hot-toast
          if (
            id.includes('node_modules/axios') ||
            id.includes('node_modules/zustand') ||
            id.includes('node_modules/react-hot-toast')
          ) {
            return 'vendor-misc';
          }
        },
      },
    },
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
