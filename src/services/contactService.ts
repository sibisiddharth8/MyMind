import apiClient from './apiClient';

export const sendMessage = async (data: { subject: string, message: string }, token: string) => {
    const response = await apiClient.post('/contact', data, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};