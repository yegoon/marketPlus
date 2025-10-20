import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url))
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    historyApiFallback: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  define: {
    'import.meta.env.VITE_ADMIN_EMAIL': JSON.stringify(process.env.VITE_ADMIN_EMAIL)
  }
  }
})