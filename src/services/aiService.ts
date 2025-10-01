import apiClient from "./apiClient";

interface AiResponse {
    message: string;
    aiDescription: string;
}

export const generateAIDescription_Public = async (projectId: string): Promise<AiResponse> => {
    const { data } = await apiClient.get(`/projects/${projectId}/ai-description-public`);
    return data;
}