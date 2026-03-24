import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@app/context/AuthContext';
import { authService } from '@app/services/authService';

vi.mock('@app/services/authService');

const mockedAuthService = vi.mocked(authService);

function TestConsumer() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user ? user.email : 'null'}</span>
      <button data-testid="logout-btn" onClick={logout}>Logout</button>
    </div>
  );
}

function LoginConsumer() {
  const { login, user } = useAuth();
  return (
    <div>
      <span data-testid="user-email">{user?.email ?? 'none'}</span>
      <button
        data-testid="login-btn"
        onClick={() => login({ id: 1, email: 'login@test.com', fullName: 'Login User', role: 'Admin' })}
      >
        Login
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading initially then authenticate on successful me()', async () => {
    const mockUser = { id: 1, email: 'test@test.com', fullName: 'Test', role: 'Admin' };
    mockedAuthService.me.mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading').textContent).toBe('true');

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('test@test.com');
  });

  it('should set unauthenticated when me() fails', async () => {
    mockedAuthService.me.mockRejectedValue(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('should handle login action', async () => {
    mockedAuthService.me.mockRejectedValue(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <LoginConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-email').textContent).toBe('none');
    });

    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    expect(screen.getByTestId('user-email').textContent).toBe('login@test.com');
  });

  it('should handle logout action', async () => {
    const mockUser = { id: 1, email: 'test@test.com', fullName: 'Test', role: 'User' };
    mockedAuthService.me.mockResolvedValue(mockUser);
    mockedAuthService.logout.mockResolvedValue();

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });

    await act(async () => {
      screen.getByTestId('logout-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
      expect(screen.getByTestId('user').textContent).toBe('null');
    });
  });

  it('should handle logout even if authService.logout() fails', async () => {
    const mockUser = { id: 1, email: 'test@test.com', fullName: 'Test', role: 'User' };
    mockedAuthService.me.mockResolvedValue(mockUser);
    mockedAuthService.logout.mockRejectedValue(new Error('Network error'));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });

    await act(async () => {
      screen.getByTestId('logout-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
    });
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within an AuthProvider');

    consoleError.mockRestore();
  });
});
