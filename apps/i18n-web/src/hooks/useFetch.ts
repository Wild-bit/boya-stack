/**
 * 基于 SWR 的数据请求 Hook
 */

import useSWR, { SWRConfiguration } from 'swr';
import { httpClient, HttpError } from '@/services/request';
import { PaginationParams } from '@packages/shared';

// SWR 默认配置
const defaultSwrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  shouldRetryOnError: false,
};

// fetcher 函数
async function fetcher<T>(url: string): Promise<T> {
  const response = await httpClient.get<T>(url);
  return response.data;
}

/**
 * 通用数据请求 Hook
 * @param url - 请求 URL（相对于 baseUrl）
 * @param config - SWR 配置
 */
export function useFetch<T>(url: string | null, config?: SWRConfiguration<T, HttpError>) {
  return useSWR<T, HttpError>(url, fetcher, {
    ...defaultSwrConfig,
    ...config,
  });
}

/**
 * 带分页的数据请求 Hook
 */
export function usePaginatedFetch<T, Q extends PaginationParams>(
  url: string | null,
  params?: Q,
  config?: SWRConfiguration<T, HttpError>
) {
  const queryString = `?${new URLSearchParams(
    Object.entries(params ?? {})
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString()}`;

  return useFetch<T>(url ? `${url}${queryString}` : null, config);
}
