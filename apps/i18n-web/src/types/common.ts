export interface UserInfo {
  id: string;
  email: string;
  name: string;
  feishuId?: string;
  avatar?: string;
  bio?: string;
  isActive?: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}
