// CURSOR_RULE_ACTIVE
/**
 * 分页工具函数
 */

import { PaginationDto } from '../dto/pagination.dto';
import { PaginatedResult, PaginationOptions } from '../types/pagination.types';

/**
 * 将分页 DTO 转换为 Prisma 查询参数
 */
export function toPaginationOptions(dto: PaginationDto): PaginationOptions {
  const { page, pageSize } = dto;
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

/**
 * 构建分页响应结构
 */
export function toPaginatedResult<T>(
  items: T[],
  total: number,
  options: PaginationOptions
): PaginatedResult<T> {
  const { page, pageSize } = options;
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
