import apiClient from './apiClient';

interface ApiResponse {
    message: string;
    data: any;
    pagination?: {
        total: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    }
}

// Fetch Categories for Filter Tabs
export const getCertificateCategories = async (): Promise<ApiResponse> => {
  const { data } = await apiClient.get('/certificate-categories');
  return data;
};

// Fetch Certificates (Public) - supports pagination & filtering
export const getCertificates = async ({ page = 1, limit = 9, categoryId, name }: { page?: number, limit?: number, categoryId?: string, name?: string }): Promise<ApiResponse> => {
  const { data } = await apiClient.get('/certificates', { 
      params: { page, limit, categoryId, name } 
  });
  return data;
};

export const getCertificateById = async (id: string): Promise<ApiResponse> => {
  const { data } = await apiClient.get(`/certificates/${id}`);
  return data;
};