import { api } from './api';

const CHAT_URL = '/chat';

export const chatApi = {
  getConversations: (params?: Record<string, any>) =>
    api.get(`${CHAT_URL}/conversations`, { params }),

  getConversation: (id: string) =>
    api.get(`${CHAT_URL}/conversations/${id}`),

  createConversation: (data: any) =>
    api.post(`${CHAT_URL}/conversations`, data),

  sendMessage: (conversationId: string, data: any) =>
    api.post(`${CHAT_URL}/conversations/${conversationId}/messages`, data),
};

export default chatApi;
