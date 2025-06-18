import apiClient from './apiClient';

// Type for a single education entry (internal use only)
interface Education {
  id: string;
  institutionName: string;
  courseName: string;
  logo: string | null; // <-- ADD '| null' HERE
  startDate: string;
  endDate?: string | null;
  description: string;
  grade: string;
  institutionLink?: string | null;
}

export type EducationData = Partial<Omit<Education, 'id' | 'createdAt' | 'updatedAt'>>;

interface ApiResponse {
    message: string;
    data: any;
}

// Fetches all education entries, sorted by end date
export const getEducations = async (): Promise<ApiResponse> => {
  const { data } = await apiClient.get('/education');
  return data;
};

// Creates a new education entry
export const createEducation = async (formData: FormData): Promise<ApiResponse> => {
  const { data } = await apiClient.post('/education', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// Updates an existing education entry
export const updateEducation = async ({ id, formData }: { id: string, formData: FormData }): Promise<ApiResponse> => {
  const { data } = await apiClient.put(`/education/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// Deletes an education entry
export const deleteEducation = async (id: string): Promise<void> => {
  await apiClient.delete(`/education/${id}`);
};