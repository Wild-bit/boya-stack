import httpClient from '@/services/request';
import {
  CreateProjectRequest,
  CreateTeamRequest,
  EditTeamRequest,
  ProjectInfo,
  TeamInfo,
  TeamListResponse,
  TeamMemberInfo,
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

export const getTeamMembersApi = (teamId: string) => {
  return httpClient.get<TeamMemberInfo[]>(`/team-members/list`, {
    params: {
      teamId,
    },
  });
};

export const updateMemberRoleApi = (id: string, role: string) => {
  return httpClient.patch('/team-members/role', { id, role });
};

export const removeMemberApi = (id: string) => {
  return httpClient.delete('/team-members/remove', {
    body: JSON.stringify({ id }),
  });
};
