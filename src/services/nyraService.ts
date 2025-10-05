import apiClient from "./apiClient";

// Define the shape of a chat message for type safety
export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

interface NyraResponse {
    reply: string;
}

/**
 * Sends a message and conversation history to the Nyra API.
 * @param message The new message from the user.
 * @param history The array of previous messages in the conversation.
 * @returns The AI's reply.
 */
export const askNyra = async (message: string, history: ChatMessage[]): Promise<NyraResponse> => {
    const { data } = await apiClient.post('/chat', {
        message,
        history,
    });
    return data;
};