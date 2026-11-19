import { apiService } from './api';

const getResponseData = (response) => response.data?.data ?? response.data;

const syncUsuarioProfile = (usuario) => {
  if (!usuario || typeof usuario !== 'object' || Array.isArray(usuario)) {
    throw new Error('La respuesta de la API contiene un usuario no válido.');
  }

  const profile = usuario.profile && typeof usuario.profile === 'object'
    && !Array.isArray(usuario.profile)
    ? usuario.profile
    : null;

  return {
    ...usuario,
    nombre: profile?.nombre ?? usuario.nombre,
    apellidos: profile?.apellidos ?? usuario.apellidos,
    avatar: profile && Object.prototype.hasOwnProperty.call(profile, 'avatar')
      ? profile.avatar
      : usuario.avatar ?? null,
  };
};

const getUsuarioResponse = async (request) => {
  const usuario = getResponseData(await request);
  return syncUsuarioProfile(usuario);
};

export const getUsuariosAdmin = async () => {
  const usuarios = getResponseData(
    await apiService.get('/usuarios', { params: { includeDeleted: true } })
  );
  if (!Array.isArray(usuarios)) {
    throw new Error('La respuesta de la API no contiene una lista de usuarios válida.');
  }
  return usuarios.map(syncUsuarioProfile);
};
export const getUsuarioById = async (identifier) => getUsuarioResponse(
  apiService.get(`/usuarios/${identifier}`)
);
export const createUsuario = async (data) => getUsuarioResponse(
  apiService.post('/usuarios', data)
);
export const updateUsuario = async (id, data) => getUsuarioResponse(
  apiService.patch(`/usuarios/${id}`, data)
);
export const deleteUsuario = async (id) => getUsuarioResponse(
  apiService.delete(`/usuarios/${id}`)
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
