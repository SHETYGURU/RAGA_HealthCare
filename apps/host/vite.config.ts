import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        name: 'RAGA Healthcare App',
        short_name: 'RAGA App',
        description: 'B2B Healthcare SaaS UI',
        theme_color: '#ffffff',
        icons: [{ src: '/vite.svg', sizes: '192x192', type: 'image/svg+xml' }]
      }
    })
  ],
  resolve: {
    alias: {
      remoteApp: path.resolve(__dirname, '../remote/src/modules')
    }
  },
  server: { port: 5000, strictPort: true },
  build: { 
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-utils';
            return 'vendor';
          }
        }
      }
    }
  }
})
