import apiClient from './apiClient';

// Local Type Definitions
interface Member {
  id: string;
  name: string;
  profileImage?: string | null;
  linkedinLink?: string | null;
  githubLink?: string | null;
}
export type MemberData = Partial<Omit<Member, 'id' | 'createdAt' | 'updatedAt'>>;
interface ApiResponse {
    message: string;
    data: any;
}

// Fetches members with pagination and search
export const getMembers = async ({ page = 1, limit = 10, name }: { page: number, limit: number, name?: string }): Promise<ApiResponse> => {
  const { data } = await apiClient.get('/members', { params: { page, limit, name } });
  return data;
};

// --- THIS IS THE NEW FUNCTION THAT WAS MISSING ---
// Fetches all members without pagination, for use in dropdowns.
export const getAllMembersSimple = async (): Promise<ApiResponse> => {
    const { data } = await apiClient.get('/members?limit=1000'); // Use a large limit to get all
    return data;
}

// Creates a new member
export const createMember = async (formData: FormData): Promise<ApiResponse> => {
  const { data } = await apiClient.post('/members', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// Updates a member
export const updateMember = async ({ id, formData }: { id: string, formData: FormData }): Promise<ApiResponse> => {
  const { data } = await apiClient.put(`/members/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// Deletes a member
export const deleteMember = async (id: string): Promise<void> => {
  await apiClient.delete(`/members/${id}`);
};