import apiClient from './apiClient';

// This function fetches all required data for the dashboard concurrently
export const getDashboardStats = async () => {
  const [contactStats, skillSummary, projectSummary, recentMessages] = await Promise.all([
    apiClient.get('/contact/stats'),
    apiClient.get('/skill-categories/summary'),
    apiClient.get('/project-categories/summary'),
    apiClient.get('/contact?limit=5') // Fetch the 5 most recent messages
  ]);

  return {
    contactStats: contactStats.data.data,
    skillSummary: skillSummary.data.data,
    projectSummary: projectSummary.data.data,
    recentMessages: recentMessages.data.data
  };
};