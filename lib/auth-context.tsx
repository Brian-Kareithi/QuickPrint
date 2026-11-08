'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from './api';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  authError: string;
  retryAuth: () => void;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { email: string; password: string; name: string; phone?: string; accountType?: 'CUSTOMER' | 'OWNER' }) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isStaff: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const checkSession = useCallback(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      return;
    }
    setToken(storedToken);
    setLoading(true);
    setAuthError('');
    api.auth.me()
      .then(setUser)
      .catch((err) => {
        if (err?.status === 401 || err?.status === 403) {
          localStorage.removeItem('token');
          setToken(null);
        } else {
          setAuthError(err?.message || "Can't reach the server. Please try again.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { checkSession(); }, [checkSession]);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login(email, password);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
    setAuthError('');
    return res.user as User;
  };

  const register = async (data: { email: string; password: string; name: string; phone?: string; accountType?: 'CUSTOMER' | 'OWNER' }) => {
    const res = await api.auth.register(data);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
    setAuthError('');
    return res.user as User;
  };

  const refresh = async () => {
    setUser(await api.auth.me());
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthError('');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        retryAuth: checkSession,
        login,
        register,
        logout,
        refresh,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isOwner: user?.role === 'OWNER',
        isStaff: user?.role === 'STAFF',
        isCustomer: user?.role === 'CUSTOMER',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
