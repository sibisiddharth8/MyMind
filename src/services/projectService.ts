import apiClient from './apiClient';

// This function fetches your project categories for the filter dropdown
export const getProjectCategories = async () => {
  const { data } = await apiClient.get('/project-categories');
  return data;
};

// This function fetches your 3 most recent projects for the homepage
export const getRecentProjects = async () => {
  const { data } = await apiClient.get('/projects/recent?limit=3');
  return data;
};

// This function fetches the main list of projects with all filters
export const getProjects = async ({ page = 1, limit = 6, categoryId, name }: {
  page: number;
  limit: number;
  categoryId?: string;
  name?: string;
}) => {
    const { data } = await apiClient.get('/projects', { params: { page, limit, categoryId, name }});
    return data;
};

// This function fetches the full details for a single project
export const getProjectById = async (id: string) => {
    const { data } = await apiClient.get(`/projects/${id}`);
    return data;
}