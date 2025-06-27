import axios from 'axios';

// This script will be run by Vite during the build process
export default async function getDynamicRoutes() {
  // We use your live API URL to get the list of projects
  const apiUrl = 'https://api.sibisiddharth.me/api/projects?limit=1000';
  
  try {
    console.log('Fetching dynamic routes for sitemap...');
    const response = await axios.get(apiUrl);
    const projects = response.data.data; // Assuming the API returns { data: [...] }
    
    if (!Array.isArray(projects)) {
      console.warn('Sitemap: Could not generate project routes, API did not return an array.');
      return [];
    }
    
    const routes = projects.map((project: { id: string }) => `/projects/${project.id}`);
    console.log(`Sitemap: Found ${routes.length} project routes.`);
    return routes;
  } catch (error: any) {
    console.warn('Sitemap: Failed to fetch dynamic routes.', error.message);
    return [];
  }
}