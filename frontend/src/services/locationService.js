import { apiService, getResponseData, syncEntityImages } from './api';

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

export const syncLocationImages = (locationId, images, existingImages = []) => (
  syncEntityImages('Location', locationId, images, existingImages)
);
