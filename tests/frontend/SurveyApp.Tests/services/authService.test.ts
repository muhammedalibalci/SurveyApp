import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '@app/services/authService';
import api from '@app/services/api';

vi.mock('@app/services/api');

const mockedApi = vi.mocked(api);

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should POST to /auth/login and return user data', async () => {
      const mockUser = { id: 1, email: 'test@test.com', fullName: 'Test', role: 'User' };
      mockedApi.post.mockResolvedValue({ data: mockUser });

      const result = await authService.login('test@test.com', 'password');

      expect(mockedApi.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@test.com',
        password: 'password',
      });
      expect(result).toEqual(mockUser);
    });

    it('should propagate error on failed login', async () => {
      mockedApi.post.mockRejectedValue(new Error('Unauthorized'));

      await expect(authService.login('bad@test.com', 'wrong')).rejects.toThrow('Unauthorized');
    });
  });

  describe('register', () => {
    it('should POST to /auth/register and return user data', async () => {
      const mockUser = { id: 2, email: 'new@test.com', fullName: 'New User', role: 'User' };
      mockedApi.post.mockResolvedValue({ data: mockUser });

      const result = await authService.register('new@test.com', 'password', 'New User');

      expect(mockedApi.post).toHaveBeenCalledWith('/auth/register', {
        email: 'new@test.com',
        password: 'password',
        fullName: 'New User',
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should POST to /auth/logout', async () => {
      mockedApi.post.mockResolvedValue({});

      await authService.logout();

      expect(mockedApi.post).toHaveBeenCalledWith('/auth/logout');
    });
  });

  describe('me', () => {
    it('should GET /auth/me and return user data', async () => {
      const mockUser = { id: 1, email: 'test@test.com', fullName: 'Test', role: 'Admin' };
      mockedApi.get.mockResolvedValue({ data: mockUser });

      const result = await authService.me();

      expect(mockedApi.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });

    it('should propagate error when session is invalid', async () => {
      mockedApi.get.mockRejectedValue(new Error('Unauthorized'));

      await expect(authService.me()).rejects.toThrow('Unauthorized');
    });
  });
});
