import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url' // Standard Vite way to resolve paths

export default defineConfig({
  plugins: [vue()],
  assetsInclude: ['**/*.pdf'],
  base: '/IMGD-Student-Archive/', 
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})