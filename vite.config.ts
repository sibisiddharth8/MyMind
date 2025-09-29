import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// remove these two lines:
// import sitemap from 'vite-plugin-sitemap'
// import getProjectRoutes from './sitemap-generator.js'

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    tailwindcss(),
  ],
})
