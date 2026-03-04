import httpClient from '@/services/request';
import type { LoginRequest, LoginResponse, RefreshTokenResponse } from './types';
import { UserInfo } from '@/types/common';

// 登入
export const loginApi = (data: LoginRequest) => {
  return httpClient.post<LoginResponse>('/auth/sign-in', data);
};

// 刷新token
export const refreshTokenApi = () => {
  return httpClient.post<RefreshTokenResponse>('/auth/refresh-token');
};

export const getUserInfoApi = () => {
  return httpClient.get<UserInfo>('/users/me');
};
