import apiClient from './apiClient';

// Local Type Definition - not exported
enum MessageStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  RESPONDED = 'RESPONDED'
}
interface ContactMessage {
  id: string;
  email: string;
  name: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
}
interface ApiResponse {
    message: string;
    data: any;
    pagination?: any;
}

// Fetches all messages with filtering and pagination
export const getMessages = async ({ page = 1, limit = 10, status, search, dateFilter }: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
    dateFilter?: string;
}) => {
    
    const { data } = await apiClient.get('/contact', { params: { page, limit, status, search, dateFilter }});
    return data;
};



// Fetches a single message by ID
export const getMessageById = async (id: string): Promise<ApiResponse> => {
    const { data } = await apiClient.get(`/contact/${id}`);
    return data;
};

// Deletes a message
export const deleteMessage = async (id: string): Promise<void> => {
    await apiClient.delete(`/contact/${id}`);
};

// Sends a reply to a message
export const replyToMessage = async ({ id, replyText }: { id: string, replyText: string }): Promise<ApiResponse> => {
    const { data } = await apiClient.post(`/contact/${id}/reply`, { replyText });
    return data;
};

export const updateMessageStatus = async ({ id, status }: { id: string, status: string }): Promise<void> => {
    await apiClient.patch(`/contact/${id}/status`, { status });
};