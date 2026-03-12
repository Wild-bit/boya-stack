import httpClient from '@/services/request';
import {
  CreateProjectRequest,
  CreateTeamRequest,
  EditTeamRequest,
  ProjectInfo,
  TeamInfo,
  TeamListResponse,
} from './types';
import { PaginatedResponse, PaginationParams } from '@packages/shared';

export const getTeamListApi = () => {
  return httpClient.get<TeamListResponse>('/teams', {
    params: {
      page: 1,
      pageSize: 100,
    },
  });
};

export const getTeamBySlugApi = (teamSlug: string) => {
  return httpClient.get<TeamInfo>(`/teams/${teamSlug}`);
};

export const editTeamInfoApi = (data: EditTeamRequest) => {
  return httpClient.post<TeamInfo>(`/teams/${data.id}`, data);
};

export const createTeamApi = (data: CreateTeamRequest) => {
  return httpClient.post<TeamInfo>('/teams', data);
};

export const getProjectBySlugApi = (teamSlug: string, projectSlug: string) => {
  return httpClient.get<ProjectInfo>(`/projects/project-by-slug`, {
    params: {
      teamSlug,
      slug: projectSlug,
    },
  });
};

export const getProjectListApi = (params: PaginationParams & { teamSlug: string }) => {
  return httpClient.get<PaginatedResponse<ProjectInfo>>('/projects/list', {
    params: {
      teamSlug: params.teamSlug,
      page: params.page,
      pageSize: params.pageSize,
    },
  });
};

export const createProjectApi = (data: CreateProjectRequest) => {
  return httpClient.post<ProjectInfo>('/projects/create', data);
};
