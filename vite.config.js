import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/pelkie_clicker/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
