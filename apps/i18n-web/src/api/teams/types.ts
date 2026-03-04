import { PaginatedResponse, PaginationParams } from '@packages/shared';

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

export interface TeamListRequest extends PaginationParams {
  keyword?: string;
  ownerId?: string;
}

export type TeamListResponse = PaginatedResponse<TeamInfo>;
