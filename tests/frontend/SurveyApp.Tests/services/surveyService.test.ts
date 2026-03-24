import { describe, it, expect, vi, beforeEach } from 'vitest';
import { surveyService } from '@app/services/surveyService';
import api from '@app/services/api';

vi.mock('@app/services/api');

const mockedApi = vi.mocked(api);

describe('surveyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should GET /surveys and return survey list', async () => {
      const mockData = [{ id: 1, title: 'Survey 1' }];
      mockedApi.get.mockResolvedValue({ data: mockData });

      const result = await surveyService.getAll();

      expect(mockedApi.get).toHaveBeenCalledWith('/surveys');
      expect(result).toEqual(mockData);
    });
  });

  describe('getById', () => {
    it('should GET /surveys/:id', async () => {
      const mockSurvey = { id: 1, title: 'Test' };
      mockedApi.get.mockResolvedValue({ data: mockSurvey });

      const result = await surveyService.getById(1);

      expect(mockedApi.get).toHaveBeenCalledWith('/surveys/1');
      expect(result).toEqual(mockSurvey);
    });
  });

  describe('create', () => {
    it('should POST /surveys with data', async () => {
      const request = {
        title: 'New', description: 'Desc',
        startDate: '2024-01-01', endDate: '2024-12-31',
        isActive: true, questions: [], assignedUserIds: [],
      };
      const mockResponse = { id: 10, ...request };
      mockedApi.post.mockResolvedValue({ data: mockResponse });

      const result = await surveyService.create(request);

      expect(mockedApi.post).toHaveBeenCalledWith('/surveys', request);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should PUT /surveys/:id with data', async () => {
      const request = {
        title: 'Updated', description: 'Desc',
        startDate: '2024-01-01', endDate: '2024-12-31',
        isActive: true, questions: [], assignedUserIds: [],
      };
      mockedApi.put.mockResolvedValue({});

      await surveyService.update(5, request);

      expect(mockedApi.put).toHaveBeenCalledWith('/surveys/5', request);
    });
  });

  describe('delete', () => {
    it('should DELETE /surveys/:id', async () => {
      mockedApi.delete.mockResolvedValue({});

      await surveyService.delete(3);

      expect(mockedApi.delete).toHaveBeenCalledWith('/surveys/3');
    });
  });

  describe('getReport', () => {
    it('should GET /surveys/:id/report', async () => {
      const mockReport = { surveyId: 1, surveyTitle: 'Test', totalAssigned: 5, totalCompleted: 3 };
      mockedApi.get.mockResolvedValue({ data: mockReport });

      const result = await surveyService.getReport(1);

      expect(mockedApi.get).toHaveBeenCalledWith('/surveys/1/report');
      expect(result).toEqual(mockReport);
    });
  });

  describe('getMySurveys', () => {
    it('should GET /surveys/my', async () => {
      const mockSurveys = [{ id: 1, title: 'My Survey', isCompleted: false }];
      mockedApi.get.mockResolvedValue({ data: mockSurveys });

      const result = await surveyService.getMySurveys();

      expect(mockedApi.get).toHaveBeenCalledWith('/surveys/my');
      expect(result).toEqual(mockSurveys);
    });
  });

  describe('getSurveyForAnswering', () => {
    it('should GET /surveys/:id/answer', async () => {
      const mockSurvey = { id: 1, title: 'Answer This' };
      mockedApi.get.mockResolvedValue({ data: mockSurvey });

      const result = await surveyService.getSurveyForAnswering(1);

      expect(mockedApi.get).toHaveBeenCalledWith('/surveys/1/answer');
      expect(result).toEqual(mockSurvey);
    });
  });

  describe('submit', () => {
    it('should POST /surveys/submit with data', async () => {
      const request = { surveyId: 1, answers: [{ questionId: 1, selectedOptionId: 2 }] };
      mockedApi.post.mockResolvedValue({});

      await surveyService.submit(request);

      expect(mockedApi.post).toHaveBeenCalledWith('/surveys/submit', request);
    });
  });

  describe('getUsers', () => {
    it('should GET /users', async () => {
      const mockUsers = [{ id: 1, email: 'test@test.com' }];
      mockedApi.get.mockResolvedValue({ data: mockUsers });

      const result = await surveyService.getUsers();

      expect(mockedApi.get).toHaveBeenCalledWith('/users');
      expect(result).toEqual(mockUsers);
    });
  });
});
