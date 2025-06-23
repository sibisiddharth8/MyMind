import apiClient from './apiClient';

// Local Type Definition for a single education entry
interface Education {
  id: string;
  logo: string | null;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string | null;
  description: string;
}

interface ApiResponse {
    message: string;
    data: Education[];
}

/**
 * Fetches all education entries, sorted by date from the backend.
 */
export const getEducationHistory = async (): Promise<ApiResponse> => {
  const { data } = await apiClient.get('/education');
  return data;
};