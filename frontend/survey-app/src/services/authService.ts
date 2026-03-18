import api from './api';
import type { User } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const response = await api.post<User>('/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, password: string, fullName: string): Promise<User> => {
    const response = await api.post<User>('/auth/register', { email, password, fullName });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // Cookie'deki token gecerliyse kullanici bilgisini doner
  me: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};
