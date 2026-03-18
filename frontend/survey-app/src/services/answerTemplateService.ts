import api from './api';
import type { AnswerTemplate, CreateAnswerTemplateRequest } from '../types';

export const answerTemplateService = {
  getAll: async (): Promise<AnswerTemplate[]> => {
    const response = await api.get<AnswerTemplate[]>('/answertemplates');
    return response.data;
  },

  getById: async (id: number): Promise<AnswerTemplate> => {
    const response = await api.get<AnswerTemplate>(`/answertemplates/${id}`);
    return response.data;
  },

  create: async (data: CreateAnswerTemplateRequest): Promise<AnswerTemplate> => {
    const response = await api.post<AnswerTemplate>('/answertemplates', data);
    return response.data;
  },

  update: async (id: number, data: CreateAnswerTemplateRequest): Promise<void> => {
    await api.put(`/answertemplates/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/answertemplates/${id}`);
  },
};
