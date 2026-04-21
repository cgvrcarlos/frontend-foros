'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import type { User, RegisterDto } from '@/types/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      document.cookie = `accessToken=${token}; path=/; SameSite=Lax`;
      api.get<User>('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Lax';
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const { data } = await api.post<{ accessToken: string; refreshToken?: string; user: User }>(
      '/auth/login', { email, password }
    );
    localStorage.setItem('accessToken', data.accessToken);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    const { data: fullUser } = await api.get<User>('/auth/me');
    setUser(fullUser);
    document.cookie = `accessToken=${data.accessToken}; path=/; SameSite=Lax`;
    return fullUser;
  };

  const register = async (formData: RegisterDto): Promise<void> => {
    const { data } = await api.post<{ accessToken: string; user: User }>('/auth/register', formData);
    localStorage.setItem('accessToken', data.accessToken);
    const { data: fullUser } = await api.get<User>('/auth/me');
    setUser(fullUser);
    document.cookie = `accessToken=${data.accessToken}; path=/; SameSite=Lax`;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Lax';
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
