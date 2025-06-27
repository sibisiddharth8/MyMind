import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import sitemap from 'vite-plugin-sitemap'
import getProjectRoutes from './sitemap-generator'

// By exporting an async function, we can safely use 'await' inside.
export default defineConfig(async ({ command }) => {
  
  // This is a performance optimization:
  // We only fetch all the project URLs when running the 'build' command.
  // During 'dev', we pass an empty array.
  const dynamicRoutes = command === 'build' 
    ? await getProjectRoutes() 
    : [];

  return {
    base: '/',
    plugins: [
      react(), 
      tailwindcss(),
      sitemap({
        hostname: 'https://sibisiddharth.me',
        staticRoutes: ['/', '/projects', '/terms'],
        // Pass the resolved array of routes to the plugin
        dynamicRoutes: dynamicRoutes,
      }),
    ],
  }
})