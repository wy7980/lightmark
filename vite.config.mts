import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// @see https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  clearScreen: false,
  root: 'src',
  base: './',
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: 'chrome105',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['@codemirror/view', '@codemirror/state', '@codemirror/language'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['@codemirror/view', '@codemirror/state', '@codemirror/language'],
  },
})
