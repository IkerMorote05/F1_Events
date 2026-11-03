import { apiService } from './api';

const getResponseData = (response) => response.data?.data ?? response.data;

export const getCategoriasCircuitosAdmin = async () => (
  await apiService.get('/categorias-circuitos', { params: { includeDeleted: true } })
).data;
export const getCategoriaCircuitosById = async (identifier) => getResponseData(
  await apiService.get(`/categorias-circuitos/${identifier}`)
);
export const createCategoriaCircuitos = async (data) => getResponseData(
  await apiService.post('/categorias-circuitos', data)
);
export const updateCategoriaCircuitos = async (id, data) => getResponseData(
  await apiService.patch(`/categorias-circuitos/${id}`, data)
);
export const deleteCategoriaCircuitos = async (id) => getResponseData(
  await apiService.delete(`/categorias-circuitos/${id}`)
);
