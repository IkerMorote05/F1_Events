import { apiService } from './api';

const getResponseData = (response) => response.data?.data ?? response.data;

export const getRolesAdmin = async () => (
  await apiService.get('/roles', { params: { includeDeleted: true } })
).data;
export const getRolById = async (identifier) => getResponseData(
  await apiService.get(`/roles/${identifier}`)
);
export const createRol = async (data) => getResponseData(
  await apiService.post('/roles', data)
);
export const updateRol = async (id, data) => getResponseData(
  await apiService.patch(`/roles/${id}`, data)
);
export const deleteRol = async (id) => getResponseData(
  await apiService.delete(`/roles/${id}`)
);
