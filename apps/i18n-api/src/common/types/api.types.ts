/**
 * API 响应类型定义
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  errors?: Record<string, string[]>;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type ID = string;

export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface FeishuUserInfoData {
  name: string;
  en_name: string;
  avatar_url: string;
  avatar_thumb: string;
  avatar_middle: string;
  avatar_big: string;
  open_id: string;
  union_id: string;
  email: string;
  enterprise_email: string;
  user_id: string;
  mobile: string;
  tenant_key: string;
  employee_no: string;
}

export interface FeishuUserInfo {
  code: number;
  data: FeishuUserInfoData;
  msg?: string;
}

export interface FeishuAccessTokenResponse {
  code: number;
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope: string;
  token_type: string;
}
