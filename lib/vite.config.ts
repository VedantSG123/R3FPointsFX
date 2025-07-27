import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: resolve(__dirname, 'tsconfig.lib.json'),
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'main.ts'),
      formats: ['es', 'cjs'],
      fileName: 'main',
    },
    copyPublicDir: false,
    rollupOptions: {
      external: [
        '@react-three/drei',
        '@react-three/fiber',
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'three',
      ],
    },
  },
})
