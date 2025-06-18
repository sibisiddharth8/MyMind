import apiClient from './apiClient';

// --- Type Definitions (Internal Use Only) ---
interface Skill {
  id: string;
  name: string;
  image: string;
  categoryId: string;
}

interface SkillCategory {
  id: string;
  name: string;
  skills: Skill[];
}

interface ApiResponse {
    message: string;
    data: any;
}

// --- Category API Functions ---
export const getSkillCategories = async (): Promise<ApiResponse> => {
  const { data } = await apiClient.get('/skill-categories');
  return data;
};

export const createSkillCategory = async (name: string): Promise<ApiResponse> => {
  const { data } = await apiClient.post('/skill-categories', { name });
  return data;
};

export const updateSkillCategory = async ({ id, name }: { id: string; name: string }): Promise<ApiResponse> => {
  const { data } = await apiClient.put(`/skill-categories/${id}`, { name });
  return data;
};

export const deleteSkillCategory = async (id: string): Promise<void> => {
  await apiClient.delete(`/skill-categories/${id}`);
};

// --- Skill API Functions ---
export const createSkill = async (formData: FormData): Promise<ApiResponse> => {
  const { data } = await apiClient.post('/skills', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateSkill = async ({ id, formData }: { id: string, formData: FormData }): Promise<ApiResponse> => {
  const { data } = await apiClient.put(`/skills/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteSkill = async (id: string): Promise<void> => {
  await apiClient.delete(`/skills/${id}`);
};