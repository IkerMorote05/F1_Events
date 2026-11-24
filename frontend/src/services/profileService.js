import { apiService, getResponseData } from './api';

export const getMyProfile = async () => getResponseData(
  await apiService.get('/profile/me')
);

export const updateMyProfile = async (data) => getResponseData(
  await apiService.patch('/profile/me', data)
);
