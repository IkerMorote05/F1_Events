import { apiService } from './api';

const getResponseData = (response) => response.data?.data ?? response.data;

export const getVariantsAdmin = async () => (
  await apiService.get('/variants', { params: { includeDeleted: true } })
).data;
export const getVariantById = async (identifier) => getResponseData(
  await apiService.get(`/variants/${identifier}`)
);
export const createVariant = async (data) => getResponseData(
  await apiService.post('/variants', data)
);
export const updateVariant = async (id, data) => getResponseData(
  await apiService.patch(`/variants/${id}`, data)
);
export const deleteVariant = async (id) => getResponseData(
  await apiService.delete(`/variants/${id}`)
);
