import { apiService } from './api';

const getResponseData = (response) => response.data?.data ?? response.data;

export const getEscuderias = async () => (await apiService.get('/escuderias')).data;
export const getEscuderiasAdmin = async () => (
  await apiService.get('/escuderias', { params: { includeDeleted: true } })
).data;
export const getEscuderiaById = async (id) => getResponseData(await apiService.get(`/escuderias/${id}`));
export const createEscuderia = async (data) => getResponseData(await apiService.post('/escuderias', data));
export const updateEscuderia = async (id, data) => getResponseData(await apiService.put(`/escuderias/${id}`, data));
export const deleteEscuderia = async (slug) => getResponseData(
  await apiService.patch(`/escuderias/${slug}/soft-delete`)
);
export const setEscuderiaActive = async (slug, isActive) => getResponseData(
  await apiService.patch(`/escuderias/${slug}/is-active`, { isActive })
);
export const restoreEscuderia = async (slug) => getResponseData(
  await apiService.patch(`/escuderias/${slug}/restore-delete`)
);