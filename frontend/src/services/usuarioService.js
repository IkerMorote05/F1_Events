import { apiService } from './api';

const getResponseData = (response) => response.data?.data ?? response.data;

export const getUsuariosAdmin = async () => (
  await apiService.get('/usuarios', { params: { includeDeleted: true } })
).data;
export const getUsuarioById = async (identifier) => getResponseData(
  await apiService.get(`/usuarios/${identifier}`)
);
export const createUsuario = async (data) => getResponseData(
  await apiService.post('/usuarios', data)
);
export const updateUsuario = async (id, data) => getResponseData(
  await apiService.patch(`/usuarios/${id}`, data)
);
export const deleteUsuario = async (id) => getResponseData(
  await apiService.delete(`/usuarios/${id}`)
);
export const getUsuarioRoles = async () => getResponseData(
  await apiService.get('/roles')
);
export const getUsuarioImages = async () => getResponseData(
  await apiService.get('/images')
);

export const syncUsuarioImages = async (usuarioId, images, existingImages = []) => {
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
        entity_type: 'Usuario',
        entity_id: usuarioId
      });
    }
  }

  for (const image of existingById.values()) {
    if (!retainedIds.has(String(image._id))) {
      await apiService.delete(`/images/${image._id}`);
    }
  }
};
