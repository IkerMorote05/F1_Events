import { apiService } from './api';

const getResponseData = (response) => response.data?.data ?? response.data;

export const getLocations = async ({ includeDeleted = false } = {}) => {
  const response = await apiService.get('/locations', {
    params: includeDeleted ? { includeDeleted: true } : undefined
  });
  return response.data?.data ?? response.data;
};

export const getLocationById = async (identifier) => getResponseData(
  await apiService.get(`/locations/${identifier}`)
);
export const createLocation = async (data) => getResponseData(
  await apiService.post('/locations', data)
);
export const updateLocation = async (id, data) => getResponseData(
  await apiService.patch(`/locations/${id}`, data)
);
export const deleteLocation = async (id) => getResponseData(
  await apiService.delete(`/locations/${id}`)
);
