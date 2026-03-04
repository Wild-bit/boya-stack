import { httpClient } from '@/services';
import { TeamListRequest, TeamListResponse } from './types';

export const getTeamListApi = (params: TeamListRequest) => {
  return httpClient.get<TeamListResponse>('/teams', {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      keyword: params.keyword,
      ownerId: params.ownerId,
    },
  });
};
