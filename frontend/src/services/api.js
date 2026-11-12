import axios from 'axios';
import { AUTH_EXPIRED_EVENT, clearAuthSession, readAuthSession } from './authStorage';

export const apiService = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

apiService.interceptors.request.use((config) => {
  const session = readAuthSession();
  if (session?.token) config.headers.Authorization = `Bearer ${session.token}`;
  return config;
});

apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      clearAuthSession();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  }
);

export default apiService;