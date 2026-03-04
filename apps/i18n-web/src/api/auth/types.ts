import { UserInfo } from '@/types/common';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserInfo;
  accessToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}
