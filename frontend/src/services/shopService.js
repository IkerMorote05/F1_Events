import { apiService, getResponseData } from './api';

export const SHOP_HOME_RESOURCES = [
  'categories',
  'locations',
  'circuits',
  'races',
  'pilots',
  'tickets',
  'escuderias',
  'localizaciones'
];

export const getShopHomeResource = async (resource) => {
  if (!SHOP_HOME_RESOURCES.includes(resource)) {
    throw new Error(`Recurso de Home no válido: ${resource}`);
  }
  return getResponseData(await apiService.get(`/shop/home/${resource}`));
};

export const getShopCatalog = async (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
  const response = await apiService.get('/shop', { params: cleanParams });
  return {
    items: Array.isArray(response.data?.data) ? response.data.data : [],
    pagination: response.data?.pagination || {
      total: 0,
      limit: cleanParams.limit || 20,
      offset: cleanParams.offset || 0
    }
  };
};

export const getShopTicketDetail = async (slug) => getResponseData(
  await apiService.get(`/shop/${encodeURIComponent(slug)}`)
);
