import axios from 'axios';

declare const console: { warn: (...args: any[]) => void };

export default async function getProjectRoutes() {
  try {
    const response = await axios.get('https://api.sibisiddharth.me/api/projects?limit=1000');
    const projects = response.data.data;
    
    if (!Array.isArray(projects)) {
      return [];
    }

    // test deploy
    return projects.map(project => `/#/projects/${project.id}`);
  } catch (error) {
    if (error instanceof Error) {
      console.warn('Sitemap: Failed to fetch dynamic routes.', error.message);
    } else {
      console.warn('Sitemap: Failed to fetch dynamic routes.', String(error));
    }
    return [];
  }
}