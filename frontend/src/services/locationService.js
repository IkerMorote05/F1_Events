import { apiService } from './api';

export const getLocations = async () => {
  const response = await apiService.get('/locations');
  return response.data?.data ?? response.data;
};
