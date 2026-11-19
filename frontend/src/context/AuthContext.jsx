import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiService } from '../services/api';
import {
  AUTH_EXPIRED_EVENT,
  clearAuthSession,
  readAuthSession,
  saveAuthSession
} from '../services/authStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(readAuthSession);

  const login = useCallback(async (credentials) => {
    const response = await apiService.post('/auth/login', credentials);
    const data = response.data?.data;
    if (!data?.token || !data?.user) {
      throw new Error('La respuesta del servidor no contiene una sesión válida.');
    }

    const nextSession = { token: data.token, user: data.user };
    saveAuthSession(nextSession);
    setSession(nextSession);
    return data.user;
  }, []);

  const clearSession = useCallback(() => {
    clearAuthSession();
    setSession(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    if (!session) return;
    const nextSession = {
      ...session,
      user: { ...session.user, ...updatedUser }
    };
    saveAuthSession(nextSession);
    setSession(nextSession);
  }, [session]);

  const logout = useCallback(async () => {
    if (!session?.token) {
      clearSession();
      return;
    }

    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      if (error.response?.status === 401) {
        clearSession();
        return;
      }
      throw error;
    }

    clearSession();
  }, [clearSession, session?.token]);

  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, clearSession);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, clearSession);
  }, [clearSession]);

  useEffect(() => {
    const preference = session?.user?.profile?.settings?.theme;
    const systemTheme = window.matchMedia?.('(prefers-color-scheme: light)');
    const applyTheme = () => {
      const theme = preference === 'light' || preference === 'dark'
        ? preference
        : systemTheme?.matches ? 'light' : 'dark';
      document.documentElement.dataset.theme = theme;
    };

    applyTheme();
    if (preference === 'light' || preference === 'dark' || !systemTheme) return undefined;

    systemTheme.addEventListener('change', applyTheme);
    return () => systemTheme.removeEventListener('change', applyTheme);
  }, [session]);

  const user = session?.user ?? null;
  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(session?.token && user),
    isAdmin: user?.role?.toLowerCase() === 'admin',
    login,
    logout,
    updateUser
  }), [session, user, login, logout, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
