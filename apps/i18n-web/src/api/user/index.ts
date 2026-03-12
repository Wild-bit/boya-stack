import httpClient from '@/services/request';
import type { UserInfo } from '@/types/common';

export const editUserInfoApi = (data: {
  name?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
}) => {
  return httpClient.post<UserInfo>('/users/edit', data);
};
