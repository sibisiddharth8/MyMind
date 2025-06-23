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