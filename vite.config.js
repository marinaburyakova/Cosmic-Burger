import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
   base: '/https://github.com/marinaburyakova/Cosmic-Burger/',
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      '@': path.resolve( './src'),
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
})