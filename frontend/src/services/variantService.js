import { apiService, getResponseData } from './api';

export const getVariants = async (params = {}) => getResponseData(
  await apiService.get('/variants', { params })
);
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
