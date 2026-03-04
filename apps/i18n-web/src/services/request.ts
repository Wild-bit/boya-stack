/**
 * 统一请求封装
 * 基于 fetch 的轻量级 HTTP 客户端
 */

import type { ApiResponse, ApiErrorResponse } from '@packages/shared';
import { ERROR_CODE } from '@packages/shared';
import { env } from '@/config';
import { message } from 'antd';

// 请求配置
interface RequestConfig extends RequestInit {
  timeout?: number;
  params?: Record<string, string | number | boolean | undefined>;
}

// 请求拦截器
type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;

// 响应拦截器
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

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

    console.log('url:', this.baseUrl + endpoint);
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
    const { timeout = 30000, params, ...fetchConfig } = config;

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
      let response = await fetch(this.buildUrl(endpoint, params), {
        ...finalConfig,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 执行响应拦截器
      for (const interceptor of this.responseInterceptors) {
        response = await interceptor(response);
      }

      const data = await response.json();

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
const TOKEN_KEY = 'access_token';

// 获取 Token
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// 设置 Token
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

// 移除 Token
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
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

// 响应拦截器：处理 401 未授权
httpClient.addResponseInterceptor(async (response) => {
  if (response.status === 401) {
    removeToken();
    console.warn('用户未授权，请重新登录', response);
    const data = await response.json();
    if (data.code === ERROR_CODE.UNAUTHORIZED) {
      window.location.replace('/login');
    } else {
      throw new HttpError(data.message || '请求失败', response.status, data.code, data.errors);
    }
  }
  return response;
});

export default httpClient;
