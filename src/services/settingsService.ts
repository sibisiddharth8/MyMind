import apiClient from './apiClient';

interface SettingsData {
    maintenance: boolean;
    maintenanceMessage?: string;
    maintenanceEndTime?: string;
    createdAt: string;
    updatedAt: string;
}

interface ApiResponse {
    message: string;
    data: SettingsData;
}

export const getSettingsData = async (): Promise<ApiResponse> => {
    const { data } = await apiClient.get('/settings');
    return data;
}