import apiClient from './apiClient';

// Local Type Definitions
interface Skill {
  id: string;
  name: string;
  image: string;
}
export interface SkillCategory {
  id: string;
  name: string;
  skills: Skill[];
}
interface ApiResponse {
    message: string;
    data: SkillCategory[];
}

/**
 * Fetches all skill categories, with their nested skills included.
 */
export const getSkillCategories = async (): Promise<ApiResponse> => {
  const { data } = await apiClient.get('/skill-categories');
  return data;
};