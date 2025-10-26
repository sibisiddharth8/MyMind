import apiClient from './apiClient';
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

export const getAboutData = async (): Promise<ApiResponse> => {
  const { data } = await apiClient.get('/about');
  return data;
};