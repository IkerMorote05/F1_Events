import { apiService } from './api';

const getResponseData = (response) => response.data?.data ?? response.data;

export const getPilotos = async () => (await apiService.get('/pilotos')).data;
export const getPilotosAdmin = async () => (
  await apiService.get('/pilotos', { params: { includeDeleted: true } })
).data;
export const getPilotoById = async (id) => getResponseData(await apiService.get(`/pilotos/${id}`));
export const createPiloto = async (data) => getResponseData(await apiService.post('/pilotos', data));
export const updatePiloto = async (id, data) => getResponseData(await apiService.patch(`/pilotos/${id}`, data));
export const deletePiloto = async (slug) => getResponseData(
  await apiService.patch(`/pilotos/${slug}/soft-delete`)
);
export const setPilotoActive = async (slug, isActive) => getResponseData(
  await apiService.patch(`/pilotos/${slug}/is-active`, { isActive })
);
export const restorePiloto = async (slug) => getResponseData(
  await apiService.patch(`/pilotos/${slug}/restore-delete`)
);

export const syncPilotoImages = async (pilotoId, images, existingImages = []) => {
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
        entity_type: 'Piloto',
        entity_id: pilotoId
      });
    }
  }

  for (const image of existingById.values()) {
    if (!retainedIds.has(String(image._id))) {
      await apiService.delete(`/images/${image._id}`);
    }
  }
};