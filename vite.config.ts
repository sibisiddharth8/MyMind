import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import sitemap from 'vite-plugin-sitemap'
import getProjectRoutes from './sitemap-generator.js'

export default defineConfig(async ({ command }) => {
  
  const dynamicRoutes = command === 'build' ? await getProjectRoutes() : [];

  return {
    base: "/",
    plugins: [
      react(),
      tailwindcss(),
      sitemap({
        hostname: 'https://sibisiddharth.me',
        
        // THIS IS THE FIX: We add the '/#' prefix to our static page routes.
        // The root '/' stays as it is.
        staticRoutes: ['/', '/#/projects', '/#/terms'],
        
        dynamicRoutes: dynamicRoutes,
      }),
    ],
  }
})