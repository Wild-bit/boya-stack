// CURSOR_RULE_ACTIVE
/**
 * 分页相关类型定义
 */

// 分页响应结构
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationQuery {
  page: number;
  pageSize: number;
}

// 分页查询参数（用于 service 层）
export interface PaginationOptions {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}
