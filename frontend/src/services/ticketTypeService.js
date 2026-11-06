import { apiService } from './api';

const getResponseData = (response) => response.data?.data ?? response.data;

export const getTicketTypesAdmin = async () => (
  await apiService.get('/ticket-types', { params: { includeDeleted: true } })
).data;
export const getTicketTypeById = async (identifier) => getResponseData(
  await apiService.get(`/ticket-types/${identifier}`)
);
export const createTicketType = async (data) => getResponseData(
  await apiService.post('/ticket-types', data)
);
export const updateTicketType = async (id, data) => getResponseData(
  await apiService.patch(`/ticket-types/${id}`, data)
);
export const deleteTicketType = async (id) => getResponseData(
  await apiService.delete(`/ticket-types/${id}`)
);
