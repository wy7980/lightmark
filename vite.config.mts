import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// @see https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte({
    configFile: 'svelte.config.js'
  })],
  clearScreen: false,
  root: 'src',
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: process.env.TAURI_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
    outDir: '../dist',
    emptyOutDir: true,
  },
})
