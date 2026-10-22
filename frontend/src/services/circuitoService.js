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
