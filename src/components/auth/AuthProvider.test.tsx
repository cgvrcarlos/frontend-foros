import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthProvider';
import api from '@/lib/api';

// Mock de la API
vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('AuthProvider', () => {
  afterEach(() => {
    localStorage.clear();
    vi.resetAllMocks(); // resetAllMocks limpia implementaciones, clearAllMocks no
  });

  it('provides user null and loading false when no token', async () => {
    const TestComponent = () => {
      const { user, loading } = useAuth();
      return (
        <div>
          <span data-testid="user">{user ? user.email : 'no-user'}</span>
          <span data-testid="loading">{loading ? 'loading' : 'not-loading'}</span>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });
  });

  it('loads user from API when token exists', async () => {
    const mockUser = { id: '1', email: 'test@test.com', role: 'USER' };
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockUser });
    localStorage.setItem('accessToken', 'mock-token');

    const TestComponent = () => {
      const { user } = useAuth();
      return <div data-testid="user">{user?.email}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@test.com');
    });
  });

  it('login function updates user state', async () => {
    const mockResponse = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: '1', email: 'test@test.com', role: 'USER' },
    };
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockResponse });

    const TestComponent = () => {
      const { login, user } = useAuth();

      const handleLogin = async () => {
        await login('test@test.com', 'password123');
      };

      return (
        <div>
          <button onClick={handleLogin} data-testid="login-btn">Login</button>
          <span data-testid="user">{user?.email}</span>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@test.com');
    });
    expect(localStorage.getItem('accessToken')).toBe('access-token');
  });

  it('logout clears user and tokens', async () => {
    // Setup: usuario cargado desde API
    const mockUser = { id: '1', email: 'test@test.com', role: 'USER' };
    localStorage.setItem('accessToken', 'mock-token');
    localStorage.setItem('refreshToken', 'mock-refresh');
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockUser });

    const TestComponent = () => {
      const { logout, user } = useAuth();
      return (
        <div>
          <button onClick={logout} data-testid="logout-btn">Logout</button>
          <span data-testid="user">{user ? 'has-user' : 'no-user'}</span>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Esperar que el usuario se cargue primero
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('has-user');
    });

    // Hacer logout
    await act(async () => {
      screen.getByTestId('logout-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });
});