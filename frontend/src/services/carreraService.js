import { apiService } from './api';

const getResponseData = (response) => response.data?.data ?? response.data;

export const getCarrerasAdmin = async () => (
  await apiService.get('/carreras', { params: { includeDeleted: true } })
).data;
export const getCarreraById = async (id) => getResponseData(await apiService.get(`/carreras/${id}`));
export const createCarrera = async (data) => getResponseData(await apiService.post('/carreras', data));
export const updateCarrera = async (id, data) => getResponseData(await apiService.patch(`/carreras/${id}`, data));
export const deleteCarrera = async (slug) => getResponseData(
  await apiService.patch(`/carreras/${slug}/soft-delete`)
);
export const setCarreraActive = async (slug, isActive) => getResponseData(
  await apiService.patch(`/carreras/${slug}/is-active`, { isActive })
);
export const restoreCarrera = async (slug) => getResponseData(
  await apiService.patch(`/carreras/${slug}/restore-delete`)
);

export const syncCarreraImages = async (carreraId, images, existingImages = []) => {
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
        entity_type: 'Carrera',
        entity_id: carreraId
      });
    }
  }

  for (const image of existingById.values()) {
    if (!retainedIds.has(String(image._id))) {
      await apiService.delete(`/images/${image._id}`);
    }
  }
};
