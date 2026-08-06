import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import { authService } from '../api/services';
import type { User } from '../types/models';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (payload: { email: string; password: string; rememberMe: boolean }) => Promise<void>;
  register: (payload: { fullName: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('exchange_token'));
  const [loading, setLoading] = useState(true);

  const persistAuth = (jwt: string, currentUser: User) => {
    localStorage.setItem('exchange_token', jwt);
    localStorage.setItem('exchange_user', JSON.stringify(currentUser));
    setToken(jwt);
    setUser(currentUser);
  };

  const login = useCallback(async (payload: { email: string; password: string; rememberMe: boolean }) => {
    const response = await authService.login(payload);
    persistAuth(response.data.token, response.data.user);

    if (!payload.rememberMe) {
      sessionStorage.setItem('exchange_session', '1');
    }
  }, []);

  const register = useCallback(async (payload: { fullName: string; email: string; password: string }) => {
    await authService.register(payload);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('exchange_token');
    localStorage.removeItem('exchange_user');
    sessionStorage.removeItem('exchange_session');
    setToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) {
      return;
    }

    const response = await authService.profile();
    setUser(response.data);
    localStorage.setItem('exchange_user', JSON.stringify(response.data));
  }, [token]);

  useEffect(() => {
    const bootstrap = async () => {
      const rawUser = localStorage.getItem('exchange_user');
      if (rawUser) {
        setUser(JSON.parse(rawUser));
      }

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await refreshProfile();
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [logout, refreshProfile, token]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refreshProfile }),
    [user, token, loading, login, register, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
