import { apiService } from './api';

export const getClasificacionPublica = async () => {
  const response = await apiService.get('/clasificacion/publica');
  return response.data?.data;
};
