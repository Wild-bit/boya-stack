/**
 * 统一请求封装
 * 基于 fetch 的轻量级 HTTP 客户端
 */

import type { ApiResponse, ApiErrorResponse, User } from '@packages/shared';
import { ERROR_CODE } from '@packages/shared';
import { env } from '@/config';
import { message } from 'antd';
import { TOKEN_LOCAL_STORAGE_KEY, USER_LOCAL_STORAGE_KEY } from '@/contants';
import { UserInfo } from '@/types/common';

// 请求配置
interface RequestConfig extends RequestInit {
  timeout?: number;
  params?: Record<string, string | number | boolean | undefined>;
  _retry?: boolean; // 标记是否为重试请求，避免无限循环
}

// 请求拦截器
type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;

// 响应拦截器
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

// 自定义 HTTP 错误类
export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

// Token 存储 key
const TOKEN_KEY = TOKEN_LOCAL_STORAGE_KEY;

// 获取 Token
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// 设置 Token
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

// 获取用户
export function getUser(): UserInfo | null {
  const user = localStorage.getItem(USER_LOCAL_STORAGE_KEY);
  return user ? JSON.parse(user) : null;
}

// 设置用户
export function setUser(user: UserInfo): void {
  localStorage.setItem(USER_LOCAL_STORAGE_KEY, JSON.stringify(user));
}

// 移除用户
export function removeUser(): void {
  localStorage.removeItem(USER_LOCAL_STORAGE_KEY);
}

// 移除 Token
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Token 刷新状态管理
let isRefreshing = false;
let pendingRequests: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

// 执行所有等待中的请求
function onRefreshed(newToken: string) {
  pendingRequests.forEach(({ resolve }) => resolve(newToken));
  pendingRequests = [];
}

// 通知所有等待的请求刷新失败
function onRefreshFailed(error: Error) {
  pendingRequests.forEach(({ reject }) => reject(error));
  pendingRequests = [];
}

// 刷新 access token
async function refreshAccessToken(): Promise<string> {
  const response = await fetch(`${env.apiBaseUrl}/auth/refresh-token`, {
    method: 'POST',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new HttpError(data.message || '刷新令牌失败', response.status, data.code, data.errors);
  }

  return data.data.accessToken;
}

class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // 添加请求拦截器
  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  // 添加响应拦截器
  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  // 设置认证 Token
  setAuthToken(token: string | null) {
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  // 构建完整 URL（含查询参数）
  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    if (!this.baseUrl) throw new Error('baseUrl is required');

    const url = new URL(this.baseUrl + endpoint);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  // 核心请求方法
  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { timeout = 30000, params, _retry = false, ...fetchConfig } = config;

    // 执行请求拦截器
    let finalConfig: RequestConfig = {
      ...fetchConfig,
      headers: {
        ...this.defaultHeaders,
        ...fetchConfig.headers,
      },
    };

    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig);
    }

    // 创建 AbortController 用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(this.buildUrl(endpoint, params), {
        ...finalConfig,
        signal: controller.signal,
        credentials: 'include',
      });

      clearTimeout(timeoutId);

      // 克隆响应以便多次读取
      const responseClone = response.clone();
      const data = await response.json();

      // 处理 401 未授权
      if (response.status === 401) {
        const errorData = data as ApiErrorResponse;

        // refresh_token 相关错误 或 token 无效/未提供，需要重新登录
        if (
          errorData.code === ERROR_CODE.REFRESH_TOKEN_EXPIRED ||
          errorData.code === ERROR_CODE.REFRESH_TOKEN_INVALID ||
          errorData.code === ERROR_CODE.REFRESH_TOKEN_REVOKED ||
          errorData.code === ERROR_CODE.REFRESH_TOKEN_NOT_FOUND ||
          errorData.code === ERROR_CODE.TOKEN_NOT_FOUND ||
          errorData.code === ERROR_CODE.TOKEN_INVALID
        ) {
          removeToken();
          removeUser();
          window.location.replace('/login');
          throw new HttpError(
            errorData.message || '请重新登录',
            response.status,
            errorData.code,
            errorData.errors
          );
        }

        // access_token 过期，尝试刷新（且不是重试请求）
        if (errorData.code === ERROR_CODE.TOKEN_EXPIRED && !_retry) {
          try {
            const newToken = await this.handleTokenRefresh();
            setToken(newToken);
            // 使用新 token 重新发送请求
            return this.request<T>(endpoint, {
              ...config,
              _retry: true,
              headers: {
                ...config.headers,
                Authorization: `Bearer ${newToken}`,
              },
            });
          } catch (refreshError) {
            removeToken();
            removeUser();
            window.location.replace('/login');
            throw refreshError;
          }
        }

        // 其他 401 错误
        throw new HttpError(
          errorData.message || '请求失败',
          response.status,
          errorData.code,
          errorData.errors
        );
      }

      // 执行响应拦截器（针对成功响应）
      for (const interceptor of this.responseInterceptors) {
        await interceptor(responseClone);
      }

      if (!response.ok) {
        const errorResponse = data as ApiErrorResponse;
        throw new HttpError(
          errorResponse.message || '请求失败',
          response.status,
          errorResponse.code,
          errorResponse.errors
        );
      }

      return data as ApiResponse<T>;
    } catch (error) {
      clearTimeout(timeoutId);
      console.log('error:', error);

      if (error instanceof HttpError) {
        message.error(error.message || '请求失败');
      } else if (error instanceof DOMException && error.name === 'AbortError') {
        message.error('请求超时');
      } else {
        message.error('网络错误');
      }
      throw error;
    }
  }

  // 处理 token 刷新（确保多个请求只刷新一次）
  private async handleTokenRefresh(): Promise<string> {
    if (isRefreshing) {
      // 已有刷新请求在进行中，加入等待队列
      return new Promise<string>((resolve, reject) => {
        pendingRequests.push({ resolve, reject });
      });
    }

    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();
      onRefreshed(newToken);
      return newToken;
    } catch (error) {
      onRefreshFailed(error instanceof Error ? error : new Error('刷新令牌失败'));
      throw error;
    } finally {
      isRefreshing = false;
    }
  }

  // 便捷方法
  get<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: unknown, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(endpoint: string, data?: unknown, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// 导出默认实例（使用环境变量配置的 API 地址）
export const httpClient = new HttpClient(env.apiBaseUrl);

// 请求拦截器：自动添加 Token
httpClient.addRequestInterceptor((config) => {
  const token = getToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

export default httpClient;
