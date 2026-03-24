import { describe, it, expect, vi, beforeEach } from 'vitest';
import { answerTemplateService } from '@app/services/answerTemplateService';
import api from '@app/services/api';

vi.mock('@app/services/api');

const mockedApi = vi.mocked(api);

describe('answerTemplateService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should GET /answertemplates and return list', async () => {
      const mockData = [{ id: 1, name: 'Yes/No', options: [] }];
      mockedApi.get.mockResolvedValue({ data: mockData });

      const result = await answerTemplateService.getAll();

      expect(mockedApi.get).toHaveBeenCalledWith('/answertemplates');
      expect(result).toEqual(mockData);
    });
  });

  describe('getById', () => {
    it('should GET /answertemplates/:id', async () => {
      const mockTemplate = { id: 1, name: 'Rating', options: [] };
      mockedApi.get.mockResolvedValue({ data: mockTemplate });

      const result = await answerTemplateService.getById(1);

      expect(mockedApi.get).toHaveBeenCalledWith('/answertemplates/1');
      expect(result).toEqual(mockTemplate);
    });
  });

  describe('create', () => {
    it('should POST /answertemplates with data', async () => {
      const request = {
        name: 'New Template',
        options: [
          { text: 'A', order: 1 },
          { text: 'B', order: 2 },
        ],
      };
      const mockResponse = { id: 5, ...request, createdAt: '2024-01-01' };
      mockedApi.post.mockResolvedValue({ data: mockResponse });

      const result = await answerTemplateService.create(request);

      expect(mockedApi.post).toHaveBeenCalledWith('/answertemplates', request);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should PUT /answertemplates/:id with data', async () => {
      const request = {
        name: 'Updated',
        options: [
          { text: 'X', order: 1 },
          { text: 'Y', order: 2 },
        ],
      };
      mockedApi.put.mockResolvedValue({});

      await answerTemplateService.update(3, request);

      expect(mockedApi.put).toHaveBeenCalledWith('/answertemplates/3', request);
    });
  });

  describe('delete', () => {
    it('should DELETE /answertemplates/:id', async () => {
      mockedApi.delete.mockResolvedValue({});

      await answerTemplateService.delete(2);

      expect(mockedApi.delete).toHaveBeenCalledWith('/answertemplates/2');
    });
  });
});
