import apiClient from './apiClient';

// Type is defined here for this file's use only. Notice there is no 'export'.
interface LoginCredentials {
  email: string;
  password: string;
}

export const loginUser = async (credentials: LoginCredentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await apiClient.post('/auth/forgot-password', { email });
  return response.data;
};