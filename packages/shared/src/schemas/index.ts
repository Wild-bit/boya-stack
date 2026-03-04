/**
 * 共享 Zod Schema
 * 用于前后端统一的数据校验
 */

import { z } from 'zod';

// 分页参数 Schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// ID Schema
export const idSchema = z.string().uuid();

// 通用错误码
export const errorCodeSchema = z.enum([
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'INTERNAL_ERROR',
  'INVALID_CREDENTIALS',
]);

export type ErrorCode = z.infer<typeof errorCodeSchema>;

// 示例：用户相关 Schema（可根据业务扩展）
export const userSchema = z.object({
  id: idSchema,
  email: z.string().email('邮箱格式不正确'),
  name: z.string().min(2, '名称至少2个字符').max(50, '名称最多50个字符'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type User = z.infer<typeof userSchema>;

export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.partial();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
