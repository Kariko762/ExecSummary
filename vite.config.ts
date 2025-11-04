import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure all assets are bundled for offline use
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
