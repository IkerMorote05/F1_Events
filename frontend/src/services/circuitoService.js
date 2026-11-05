import { apiService } from './api';

const getResponseData = (response) => response.data?.data ?? response.data;

export const getCircuitosAdmin = async () => (
  await apiService.get('/circuitos', { params: { includeDeleted: true } })
).data;
export const getCircuitoById = async (id) => getResponseData(await apiService.get(`/circuitos/${id}`));
export const createCircuito = async (data) => getResponseData(await apiService.post('/circuitos', data));
export const updateCircuito = async (id, data) => getResponseData(await apiService.patch(`/circuitos/${id}`, data));
export const deleteCircuito = async (slug) => getResponseData(
  await apiService.patch(`/circuitos/${slug}/soft-delete`)
);
export const setCircuitoActive = async (slug, isActive) => getResponseData(
  await apiService.patch(`/circuitos/${slug}/is-active`, { isActive })
);
export const restoreCircuito = async (slug) => getResponseData(
  await apiService.patch(`/circuitos/${slug}/restore-delete`)
);

export const syncCircuitoImages = async (circuitoId, images, existingImages = []) => {
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
        entity_type: 'Circuito',
        entity_id: circuitoId
      });
    }
  }

  for (const image of existingById.values()) {
    if (!retainedIds.has(String(image._id))) {
      await apiService.delete(`/images/${image._id}`);
    }
  }
};
