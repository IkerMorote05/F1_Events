import { apiService } from './api';

const getResponseData = (response) => response.data?.data ?? response.data;

export const getCategoriasGlobalesAdmin = async () => (
  await apiService.get('/categorias-globales', { params: { includeDeleted: true } })
).data;
export const getCategoriaGlobalById = async (identifier) => getResponseData(
  await apiService.get(`/categorias-globales/${identifier}`)
);
export const createCategoriaGlobal = async (data) => getResponseData(
  await apiService.post('/categorias-globales', data)
);
export const updateCategoriaGlobal = async (id, data) => getResponseData(
  await apiService.patch(`/categorias-globales/${id}`, data)
);
export const deleteCategoriaGlobal = async (id) => getResponseData(
  await apiService.delete(`/categorias-globales/${id}`)
);
