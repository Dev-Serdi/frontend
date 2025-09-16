import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Le dice al plugin que genere el service worker
      strategies: 'generateSW',
      
      // Se registrará automáticamente. 'autoUpdate' recarga la página cuando hay nuevo contenido.
      registerType: 'autoUpdate',

      // ✅ Contenido de tu manifest.json incorporado aquí
      manifest: {
        "id": "/",
        "lang": "es",
        "name": "Portal de ayuda",
        "short_name": "Portal de ayuda",
        "description": "Página de soporte para mesa de ayuda y gestión documental",
        "start_url": "/",
        "background_color": "#2f3d58",
        "theme_color": "#2f3d58",
        "orientation": "any",
        "display": "standalone",
        "icons": [
          {
            "src": "/icon-96.png",
            "sizes": "96x96",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "/icon-192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "/icon-512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any maskable"
          }
        ],
        "screenshots": [
          {
            "src": "/screenshot-desktop.png",
            "sizes": "1920x929",
            "type": "image/png",
            "form_factor": "wide",
            "label": "Vista de escritorio de la aplicación"
          },
          {
            "src": "/screenshot-mobile.png",
            "sizes": "395x855",
            "type": "image/png",
            "form_factor": "narrow",
            "label": "Vista móvil de la aplicación"
          }
        ]
      },
      
      // Configuración del Service Worker (Workbox)
      workbox: {
        // Archivos que se guardarán en caché la primera vez que se visite la app (el "cascarón" de la app)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        
        // Estrategia de caché para las llamadas a tu API
        runtimeCaching: [
          {
            // Cachea las peticiones a tu API de backend
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            
            // Estrategia: 'NetworkFirst' intenta ir a la red primero, si falla, usa el caché.
            // Ideal para datos que pueden cambiar pero que es útil tener offline.
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 200, // Máximo número de respuestas a cachear
                maxAgeSeconds: 60 * 60 * 24, // Cachear por 1 día
              },
              cacheableResponse: {
                statuses: [0, 200], // Cachear respuestas exitosas y opacas
              },
            },
          },
        ],
      },
    }),
  ],
  define: {
    global: "window", // Soluciona el problema de 'global is not defined'
  },
  server: {
    allowedHosts: ["all", "localhost"],
    port: 3000,
    proxy: {
      "/api": {
        target:
          "https://serdiappback-hfe8a2f7bgcybacz.eastus-01.azurewebsites.net",
        changeOrigin: true,
      },
    },
  },
});