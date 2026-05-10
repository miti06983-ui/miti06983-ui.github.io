import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'buffer-polyfill',
      transformIndexHtml(html) {
        return html.replace(
          '</body>',
          `<script>
            if (typeof globalThis.Buffer === 'undefined') {
              globalThis.Buffer = require('buffer').Buffer;
            }
          </script></body>`
        )
      }
    }
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      buffer: 'buffer/'
    }
  },
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  optimizeDeps: {
    include: ['buffer'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
})
