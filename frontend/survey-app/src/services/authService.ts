import api from './api';
import type { AuthResponse } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', { email, password, fullName });
    return response.data;
  },
};
