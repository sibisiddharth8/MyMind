import apiClient from './apiClient';

// --- Local Type Definitions ---
interface LoginCredentials {
  email: string;
  password: string;
}

interface ForgotPasswordData {
  email: string;
}

interface ResetPasswordData {
  token: string;
  password: string;
}

// --- API Functions ---

// This function calls the ADMIN login endpoint
export const loginAdmin = async (credentials: LoginCredentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data; // This returns the { token, user, message } object from the API
};

// This function calls the ADMIN forgot password endpoint
export const forgotAdminPassword = async (data: ForgotPasswordData) => {
  const response = await apiClient.post('/auth/forgot-password', data);
  return response.data;
};

// This function calls the ADMIN reset password endpoint
export const resetAdminPassword = async (data: ResetPasswordData) => {
  const response = await apiClient.post(`/auth/reset-password/${data.token}`, { password: data.password });
  return response.data;
};