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
