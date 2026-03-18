import api from './api';
import type { Question, CreateQuestionRequest } from '../types';

export const questionService = {
  getAll: async (): Promise<Question[]> => {
    const response = await api.get<Question[]>('/questions');
    return response.data;
  },

  getById: async (id: number): Promise<Question> => {
    const response = await api.get<Question>(`/questions/${id}`);
    return response.data;
  },

  create: async (data: CreateQuestionRequest): Promise<Question> => {
    const response = await api.post<Question>('/questions', data);
    return response.data;
  },

  update: async (id: number, data: CreateQuestionRequest): Promise<void> => {
    await api.put(`/questions/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/questions/${id}`);
  },
};
