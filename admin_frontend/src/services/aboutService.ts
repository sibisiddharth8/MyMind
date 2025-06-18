import apiClient from './apiClient';

// Type definition for the data structure, useful for type-checking
export interface AboutData {
  id: string;
  name: string;
  roles: string[];
  description: string;
  image?: string;
  cv?: string;
  createdAt: string;
  updatedAt: string;
}

// Type for the API response wrapper
interface ApiResponse {
    message: string;
    data: AboutData;
}

// Fetches the existing about data
export const getAboutData = async (): Promise<ApiResponse> => {
  const { data } = await apiClient.get('/about');
  return data;
};

// Updates the about data using FormData for file uploads
export const updateAboutData = async (formData: FormData): Promise<ApiResponse> => {
  const { data } = await apiClient.put('/about', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// Deletes all about data
export const deleteAboutData = async (): Promise<void> => {
  await apiClient.delete('/about');
};