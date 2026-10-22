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
