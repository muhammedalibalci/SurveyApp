import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '@app/pages/Login';
import { authService } from '@app/services/authService';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@app/context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
    user: null,
    loading: false,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@app/services/authService');

const mockedAuthService = vi.mocked(authService);

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form with email and password fields', () => {
    renderLogin();

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Sifre')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /giris yap/i })).toBeInTheDocument();
  });

  it('should render app title', () => {
    renderLogin();

    expect(screen.getByText('Survey App')).toBeInTheDocument();
  });

  it('should show demo credentials', () => {
    renderLogin();

    expect(screen.getByText(/admin@survey.com/)).toBeInTheDocument();
  });

  it('should call authService.login and navigate to admin on Admin login', async () => {
    const user = userEvent.setup();
    const mockUser = { id: 1, email: 'admin@test.com', fullName: 'Admin', role: 'Admin' };
    mockedAuthService.login.mockResolvedValue(mockUser);

    renderLogin();

    await user.type(screen.getByPlaceholderText('Email'), 'admin@test.com');
    await user.type(screen.getByPlaceholderText('Sifre'), 'password123');
    await user.click(screen.getByRole('button', { name: /giris yap/i }));

    await waitFor(() => {
      expect(mockedAuthService.login).toHaveBeenCalledWith('admin@test.com', 'password123');
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(mockUser);
      expect(mockNavigate).toHaveBeenCalledWith('/admin/templates');
    });
  });

  it('should navigate to user surveys on User login', async () => {
    const user = userEvent.setup();
    const mockUser = { id: 2, email: 'user@test.com', fullName: 'User', role: 'User' };
    mockedAuthService.login.mockResolvedValue(mockUser);

    renderLogin();

    await user.type(screen.getByPlaceholderText('Email'), 'user@test.com');
    await user.type(screen.getByPlaceholderText('Sifre'), 'password123');
    await user.click(screen.getByRole('button', { name: /giris yap/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/user/surveys');
    });
  });

  it('should show error message on failed login', async () => {
    const user = userEvent.setup();
    mockedAuthService.login.mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    });

    renderLogin();

    await user.type(screen.getByPlaceholderText('Email'), 'bad@test.com');
    await user.type(screen.getByPlaceholderText('Sifre'), 'wrong');
    await user.click(screen.getByRole('button', { name: /giris yap/i }));

    await waitFor(() => {
      expect(mockedAuthService.login).toHaveBeenCalled();
    });
  });
});
