import apiClient from './apiClient';

export const initiateRegistration = async (data: any) => {
    const response = await apiClient.post('/users/register', data);
    return response.data;
};
export const verifyUser = async (data: any) => {
    const response = await apiClient.post('/users/verify', data);
    return response.data;
};
export const loginPublicUser = async (credentials: any) => {
    const response = await apiClient.post('/users/login', credentials);
    return response.data;
};
export const forgotPublicUserPassword = async (data: any) => {
    const response = await apiClient.post('/users/forgot-password', data);
    return response.data;
};
export const resetPublicUserPassword = async (data: any) => {
    const response = await apiClient.post(`/users/reset-password/${data.token}`, { password: data.password });
    return response.data;
};
export const continueWithGoogle = async (token: string) => {
    const response = await apiClient.post('/users/auth/google', { token });
    return response.data;
};

export const getUserActivity = async (type?: string, page: number = 1, limit: number = 10) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const { data } = await apiClient.get(`/activity?${params.toString()}`);
    return data;
};

export const updatePublicProfile = async (formData: FormData) => {
    const { data } = await apiClient.put('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
};

export const changePublicPassword = async (data: any) => {
    const { data: response } = await apiClient.put('/change-password', data);
    return response;
};