import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Shared code aliases for cleaner imports
      '@shared': path.resolve(__dirname, '../src'),
      '@design-system': path.resolve(__dirname, '../src/design-system'),
      '@renderers': path.resolve(__dirname, '../src/renderers'),
      '@types': path.resolve(__dirname, '../src/types'),
      '@schemas': path.resolve(__dirname, '../src/schemas'),
      
      // Force all React imports to use CMS's React instance
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },
})
