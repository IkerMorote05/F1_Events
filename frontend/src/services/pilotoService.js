import { apiService } from './api';

const getResponseData = (response) => response.data?.data ?? response.data;

export const getPilotos = async () => (await apiService.get('/pilotos')).data;
export const getPilotosAdmin = async () => (
  await apiService.get('/pilotos', { params: { includeDeleted: true } })
).data;
export const getPilotoById = async (id) => getResponseData(await apiService.get(`/pilotos/${id}`));
export const createPiloto = async (data) => getResponseData(await apiService.post('/pilotos', data));
export const updatePiloto = async (id, data) => getResponseData(await apiService.patch(`/pilotos/${id}`, data));
export const deletePiloto = async (slug) => getResponseData(
  await apiService.patch(`/pilotos/${slug}/soft-delete`)
);
export const setPilotoActive = async (slug, isActive) => getResponseData(
  await apiService.patch(`/pilotos/${slug}/is-active`, { isActive })
);
export const restorePiloto = async (slug) => getResponseData(
  await apiService.patch(`/pilotos/${slug}/restore-delete`)
);