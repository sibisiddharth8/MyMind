import apiClient from './apiClient';

// Local type definition for this service.
interface LinksData {
  linkedin?: string;
  github?: string;
  instagram?: string;
  portal?: string;
}

interface ApiResponse {
    message: string;
    data: LinksData;
}

/**
 * Fetches the social and professional links.
 */
export const getLinksData = async (): Promise<ApiResponse> => {
  const { data } = await apiClient.get('/links');
  return data;
};