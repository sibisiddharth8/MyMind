import apiClient from './apiClient';

// Local type definition for this service. Not exported.
interface AboutData {
  id: string;
  name: string;
  roles: string[];
  description: string;
  image?: string;
  cv?: string;
}

interface ApiResponse {
    message: string;
    data: AboutData;
}

/**
 * Fetches the main "About" data for the portfolio.
 */
export const getAboutData = async (): Promise<ApiResponse> => {
  const { data } = await apiClient.get('/about');
  return data;
};