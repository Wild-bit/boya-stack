import httpClient from '@/services/request';
import type { StsCredentials } from './types';

export const getStsTokenApi = (fileName: string) => {
  return httpClient.get<StsCredentials>('/upload/sts', {
    params: { fileName },
  });
};
