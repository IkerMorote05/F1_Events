import { apiService } from './api';

const getResponseData = (response) => response.data?.data ?? response.data;

export const getMyProfile = async () => getResponseData(
  await apiService.get('/profile/me')
);

export const updateMyProfile = async (data) => getResponseData(
  await apiService.patch('/profile/me', data)
);
