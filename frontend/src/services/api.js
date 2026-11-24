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

export const getResponseData = (response) => response.data?.data ?? response.data;

export const syncEntityImages = async (entityType, entityId, images, existingImages = []) => {
  const existingById = new Map(
    existingImages.filter((image) => image?._id).map((image) => [String(image._id), image])
  );
  const retainedIds = new Set();

  for (const [position, image] of images.entries()) {
    const data = {
      image_url: image.image_url,
      alt_text: image.alt_text || '',
      position
    };
    const existing = image._id ? existingById.get(String(image._id)) : null;

    if (existing) {
      retainedIds.add(String(existing._id));
      await apiService.patch(`/images/${existing._id}`, data);
    } else {
      await apiService.post('/images', {
        ...data,
        entity_type: entityType,
        entity_id: entityId
      });
    }
  }

  for (const image of existingById.values()) {
    if (!retainedIds.has(String(image._id))) {
      await apiService.delete(`/images/${image._id}`);
    }
  }
};

export default apiService;