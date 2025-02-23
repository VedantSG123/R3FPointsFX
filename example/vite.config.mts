import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  resolve: {
    alias: {
      'r3f-points-fx': path.resolve(__dirname, '../lib/main.ts'),
      '@': path.resolve(__dirname, './src'),
    },
  },
})
