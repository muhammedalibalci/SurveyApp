import { describe, it, expect, vi, beforeEach } from 'vitest';
import { questionService } from '@app/services/questionService';
import api from '@app/services/api';

vi.mock('@app/services/api');

const mockedApi = vi.mocked(api);

describe('questionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should GET /questions and return list', async () => {
      const mockData = [{ id: 1, text: 'Q1' }];
      mockedApi.get.mockResolvedValue({ data: mockData });

      const result = await questionService.getAll();

      expect(mockedApi.get).toHaveBeenCalledWith('/questions');
      expect(result).toEqual(mockData);
    });

    it('should return empty array when no questions', async () => {
      mockedApi.get.mockResolvedValue({ data: [] });

      const result = await questionService.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should GET /questions/:id', async () => {
      const mockQuestion = { id: 5, text: 'Test Question' };
      mockedApi.get.mockResolvedValue({ data: mockQuestion });

      const result = await questionService.getById(5);

      expect(mockedApi.get).toHaveBeenCalledWith('/questions/5');
      expect(result).toEqual(mockQuestion);
    });
  });

  describe('create', () => {
    it('should POST /questions with data', async () => {
      const request = { text: 'New Q?', answerTemplateId: 1 };
      const mockResponse = { id: 10, ...request };
      mockedApi.post.mockResolvedValue({ data: mockResponse });

      const result = await questionService.create(request);

      expect(mockedApi.post).toHaveBeenCalledWith('/questions', request);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should PUT /questions/:id with data', async () => {
      const request = { text: 'Updated Q?', answerTemplateId: 2 };
      mockedApi.put.mockResolvedValue({});

      await questionService.update(3, request);

      expect(mockedApi.put).toHaveBeenCalledWith('/questions/3', request);
    });
  });

  describe('delete', () => {
    it('should DELETE /questions/:id', async () => {
      mockedApi.delete.mockResolvedValue({});

      await questionService.delete(7);

      expect(mockedApi.delete).toHaveBeenCalledWith('/questions/7');
    });
  });
});
