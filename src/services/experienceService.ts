import apiClient from './apiClient';

// Local Type Definition
interface Experience {
  id: string;
  logo: string | null;
  role: string;
  companyName: string;
  companyLink?: string | null;
  startDate: string;
  endDate?: string | null;
  description: string;
  skills: string[];
}

interface ApiResponse {
    message: string;
    data: Experience[];
}

/**
 * Fetches all experience entries, sorted by date from the backend.
 */
export const getExperiences = async (): Promise<ApiResponse> => {
  const { data } = await apiClient.get('/experience');
  return data;
};