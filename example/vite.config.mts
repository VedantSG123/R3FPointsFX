import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import path from 'path'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    mdx({
      rehypePlugins: [remarkGfm, rehypeSlug],
      providerImportSource: '@mdx-js/react',
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    // SEO and performance optimizations
    minify: 'esbuild',
    target: 'esnext',
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // Chunk splitting for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'ui-vendor': [
            'lucide-react',
            '@radix-ui/react-accordion',
            '@radix-ui/react-checkbox',
          ],
          'router-vendor': ['react-router'],
          'animation-vendor': ['gsap'],
        },
        // Clean file names for better SEO
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  resolve: {
    alias: {
      'r3f-points-fx': path.resolve(__dirname, '../lib/main.ts'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  envDir: './env',
  // Preload directives for critical resources
  server: {
    headers: {
      Link: '</assets/main.js>; rel=preload; as=script',
    },
  },
})
