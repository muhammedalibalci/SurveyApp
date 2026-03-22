import api from './api';
import type { Survey, SurveyListItem, CreateSurveyRequest, UserSurvey, SurveyReport, SubmitSurveyRequest } from '../types';
import type { User } from '../types';

export const surveyService = {
  // Admin
  getAll: async (): Promise<SurveyListItem[]> => {
    const response = await api.get<SurveyListItem[]>('/surveys');
    return response.data;
  },

  getById: async (id: number): Promise<Survey> => {
    const response = await api.get<Survey>(`/surveys/${id}`);
    return response.data;
  },

  create: async (data: CreateSurveyRequest): Promise<Survey> => {
    const response = await api.post<Survey>('/surveys', data);
    return response.data;
  },

  update: async (id: number, data: CreateSurveyRequest): Promise<void> => {
    await api.put(`/surveys/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/surveys/${id}`);
  },

  getReport: async (id: number): Promise<SurveyReport> => {
    const response = await api.get<SurveyReport>(`/surveys/${id}/report`);
    return response.data;
  },

  // User
  getMySurveys: async (): Promise<UserSurvey[]> => {
    const response = await api.get<UserSurvey[]>('/surveys/my');
    return response.data;
  },

  getSurveyForAnswering: async (id: number): Promise<Survey> => {
    const response = await api.get<Survey>(`/surveys/${id}/answer`);
    return response.data;
  },

  submit: async (data: SubmitSurveyRequest): Promise<void> => {
    await api.post('/surveys/submit', data);
  },

  // Users list (admin)
  getUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },
};
