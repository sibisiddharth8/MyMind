import apiClient from './apiClient';

// --- Type Definitions (Internal Use Only) ---
// Note: We are not exporting these types.
interface Member { id: string; name: string; }
interface ProjectMember { id: string; role: string; member: Member; }
interface ProjectCategory { id: string; name: string; }
interface Project {
  id: string;
  name: string;
  projectImage: string;
  startDate: string;
  endDate?: string | null;
  githubLink?: string | null;
  liveLink?: string | null;
  tags: string[];
  category: ProjectCategory;
  members: ProjectMember[];
}
interface ApiResponse { message: string; data: any; }

// --- Category API Functions ---
export const getProjectCategories = async (): Promise<ApiResponse> => {
  const { data } = await apiClient.get('/project-categories');
  return data;
};
export const createProjectCategory = async (name: string): Promise<ApiResponse> => {
    const { data } = await apiClient.post('/project-categories', { name });
    return data;
};

// --- Project API Functions ---
export const getProjects = async ({ page = 1, limit = 9, categoryId, name }: { page: number, limit: number, categoryId?: string, name?: string }): Promise<ApiResponse> => {
    const { data } = await apiClient.get('/projects', { params: { page, limit, categoryId, name }});
    return data;
};

export const createProject = async (formData: FormData): Promise<ApiResponse> => {
    const { data } = await apiClient.post('/projects', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data;
};

export const updateProject = async ({ id, formData }: { id: string; formData: FormData }): Promise<ApiResponse> => {
    const { data } = await apiClient.put(`/projects/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data;
};

export const deleteProject = async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
};