import { apiService } from './api';

const getResponseData = (response) => response.data?.data ?? response.data;

export const getEscuderias = async () => (await apiService.get('/escuderias')).data;
export const getEscuderiasAdmin = async () => (
  await apiService.get('/escuderias', { params: { includeDeleted: true } })
).data;
export const getEscuderiaById = async (id) => getResponseData(await apiService.get(`/escuderias/${id}`));
export const createEscuderia = async (data) => getResponseData(await apiService.post('/escuderias', data));
export const updateEscuderia = async (id, data) => getResponseData(await apiService.patch(`/escuderias/${id}`, data));
export const deleteEscuderia = async (slug) => getResponseData(
  await apiService.patch(`/escuderias/${slug}/soft-delete`)
);
export const setEscuderiaActive = async (slug, isActive) => getResponseData(
  await apiService.patch(`/escuderias/${slug}/is-active`, { isActive })
);
export const restoreEscuderia = async (slug) => getResponseData(
  await apiService.patch(`/escuderias/${slug}/restore-delete`)
);

export const syncEscuderiaImages = async (escuderiaId, images, existingImages = []) => {
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
        entity_type: 'Escuderia',
        entity_id: escuderiaId
      });
    }
  }

  for (const image of existingById.values()) {
    if (!retainedIds.has(String(image._id))) {
      await apiService.delete(`/images/${image._id}`);
    }
  }
};