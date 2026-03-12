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

// 获取飞书授权 URL
export const getFeishuAuthUrlApi = () => {
  return httpClient.get<string>('/auth/feishu/auth-url');
};

// 飞书登录
export const loginByFeishuApi = (code: string) => {
  return httpClient.get<LoginResponse>('/auth/feishu/callback', { params: { code } });
};

// 登出
export const signOutApi = () => {
  return httpClient.post<{ message: string }>('/auth/sign-out', {});
};

// 忘记密码
export const resetPasswordApi = (email: string, newPassword: string) => {
  return httpClient.post<{ message: string }>('/auth/reset-password', {
    email,
    password: newPassword,
  });
};
