import client from './api.js';

export const authService = {
  register: (data) => client.post('/api/auth/register', data),
  login: (data) => client.post('/api/auth/login', data),
  logout: () => client.post('/api/auth/logout'),
  getMe: () => client.get('/api/auth/me'),
  googleLogin: (credential) => client.post('/api/auth/google', { credential }),
  linkGoogleAccount: (credential, email) => client.post('/api/auth/google/link', { credential, email }),
  googleRegister: (data) => client.post('/api/auth/google/register', data),
};

export const userService = {
  search: (query) => client.post('/api/users/search', { query }),
  checkUsernameAvailability: (username) => client.get('/api/users/username-availability', { params: { username } }),
  getById: (id) => client.get(`/api/users/${id}`),
  updateProfile: (data) => client.patch('/api/users/profile', data),
  updateAvatar: (data) => client.patch('/api/users/avatar', data),
  updateLocation: (data) => client.patch('/api/users/location', data),
  requestAccountDeletion: () => client.post('/api/users/account-deletion/request'),
  confirmAccountDeletion: (code) => client.post('/api/users/account-deletion/confirm', { code }),
};

export const chatService = {
  getChats: () => client.get('/api/chats'),
  createChat: (recipientId) => client.post('/api/chats/create', { recipientId }),
  getChatById: (chatId) => client.get(`/api/chats/${chatId}`),
  clearChat: (chatId) => client.post(`/api/chats/${chatId}/clear`),
  deleteChat: (chatId) => client.delete(`/api/chats/${chatId}`),
  updateRetention: (retentionHours) => client.patch('/api/chats/retention', { retentionHours }),
};

export const messageService = {
  getMessages: (chatId, page = 1) => client.get(`/api/messages/${chatId}`, { params: { page } }),
  sendMessage: (data) => client.post('/api/messages/send', data),
  deleteMessage: (id) => client.delete(`/api/messages/${id}`),
  editMessage: (id, data) => client.patch(`/api/messages/${id}`, data),
};
