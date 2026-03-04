import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'BusTrack SL',
        short_name: 'BusTrack',
        description: 'Sri Lanka Smart Bus Announcer',
        theme_color: '#1d4ed8',
        background_color: '#f0f4ff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f68c.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f68c.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f68c.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
```

**Ctrl+S → terminal:**
```