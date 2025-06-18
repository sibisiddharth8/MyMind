import apiClient from './apiClient';

// Type is now for internal reference, NOT exported
interface Experience {
  id: string;
  logo: string;
  role: string;
  companyName: string;
  companyLink?: string | null;
  startDate: string;
  endDate?: string | null;
  description: string;
  skills: string[];
}

export type ExperienceData = Partial<Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>>;

interface ApiResponse {
    message: string;
    data: any;
}

// --- The rest of the functions remain exactly the same ---
export const getExperiences = async (): Promise<ApiResponse> => {
  const { data } = await apiClient.get('/experience');
  return data;
};

export const createExperience = async (formData: FormData): Promise<ApiResponse> => {
  const { data } = await apiClient.post('/experience', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateExperience = async ({ id, formData }: { id: string, formData: FormData }): Promise<ApiResponse> => {
  const { data } = await apiClient.put(`/experience/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteExperience = async (id: string): Promise<void> => {
  await apiClient.delete(`/experience/${id}`);
};