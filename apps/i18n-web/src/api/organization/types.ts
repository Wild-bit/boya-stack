export interface TeamInfo {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamListResponse {
  items: TeamInfo[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateTeamRequest {
  name: string;
  slug?: string;
  description?: string;
  ownerId: string;
}

export interface ProjectInfo {
  id: string;
  name: string;
  slug: string;
  description: string;
  sourceLocale: string;
  targetLanguages: string[];
  keyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  teamId: string;
  sourceLocale: string;
  targetLanguages: string[];
  description?: string;
}

export interface EditTeamRequest {
  id: string;
  name?: string;
  slug?: string;
}

export interface TeamMemberInfo {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    lastLoginAt?: string;
  };
}
