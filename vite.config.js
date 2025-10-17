import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // This will remove console.logs in production
      },
    },
  },
  server: {
    port: 3000,
    open: true
  }
})