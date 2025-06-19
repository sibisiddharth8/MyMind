import apiClient from './apiClient';

// Local Type Definition
interface TermAndCondition {
  id: string;
  title: string;
  content: string;
  imagePath?: string | null;
  order: number;
}

export type TermData = Partial<Omit<TermAndCondition, 'id' | 'createdAt' | 'updatedAt'>>;

interface ApiResponse {
    message: string;
    data: any;
}

// --- API Functions ---

export const getTerms = async (): Promise<ApiResponse> => {
  const { data } = await apiClient.get('/terms');
  return data;
};

export const createTerm = async (formData: FormData): Promise<ApiResponse> => {
  const { data } = await apiClient.post('/terms', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
};

export const updateTerm = async ({ id, formData }: { id: string, formData: FormData }): Promise<ApiResponse> => {
  const { data } = await apiClient.put(`/terms/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
};

export const deleteTerm = async (id: string): Promise<void> => {
  await apiClient.delete(`/terms/${id}`);
};

export const updateTermOrder = async (termOrders: { id: string, order: number }[]): Promise<ApiResponse> => {
    const { data } = await apiClient.patch('/terms/order', { termOrders });
    return data;
};