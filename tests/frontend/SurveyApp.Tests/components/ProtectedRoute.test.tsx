import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '@app/components/ProtectedRoute';

const mockUseAuth = vi.fn();

vi.mock('@app/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderWithRouter(ui: React.ReactElement, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading spinner when auth is loading', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, user: null, loading: true });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(document.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('should render children when authenticated and no role required', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, email: 'test@test.com', fullName: 'Test', role: 'User' },
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should render children when authenticated with matching role', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, email: 'admin@test.com', fullName: 'Admin', role: 'Admin' },
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute role="Admin">
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('should redirect to /login when not authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, user: null, loading: false });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to /login when role does not match', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, email: 'user@test.com', fullName: 'User', role: 'User' },
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute role="Admin">
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });
});
