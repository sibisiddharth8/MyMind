import apiClient from './apiClient';

// Type is now for internal use and is NOT exported
interface LinksData {
  id?: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
  portal?: string;
}

interface ApiResponse {
    message: string;
    data: LinksData;
}

// Fetches the existing links data
export const getLinksData = async (): Promise<ApiResponse> => {
  const { data } = await apiClient.get('/links');
  return data;
};

// Creates or updates the links data
export const updateLinksData = async (linksData: Partial<LinksData>): Promise<ApiResponse> => {
  const { data } = await apiClient.put('/links', linksData);
  return data;
};

// Deletes the links document
export const deleteLinksData = async (): Promise<void> => {
  await apiClient.delete('/links');
};