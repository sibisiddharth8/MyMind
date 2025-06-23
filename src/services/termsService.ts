import apiClient from './apiClient';

// Local Type Definition
interface TermAndCondition {
  id: string;
  title: string;
  content: string;
  imagePath?: string | null;
  order: number;
}

interface ApiResponse {
    message: string;
    data: TermAndCondition[];
}

/**
 * Fetches all terms and conditions, sorted by order from the backend.
 */
export const getTerms = async (): Promise<ApiResponse> => {
  const { data } = await apiClient.get('/terms');
  return data;
};