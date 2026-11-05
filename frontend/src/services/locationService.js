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

export const syncLocationImages = async (locationId, images, existingImages = []) => {
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
        entity_type: 'Location',
        entity_id: locationId
      });
    }
  }

  for (const image of existingById.values()) {
    if (!retainedIds.has(String(image._id))) {
      await apiService.delete(`/images/${image._id}`);
    }
  }
};
