import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import type { ApiErrorResponse } from '../types/api.types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let code = 'INTERNAL_ERROR';
    let errors: Record<string, string[]> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as Record<string, unknown>;
        message = (res['message'] as string) || exception.message;
        code = (res['code'] as string) || this.getCodeFromStatus(status);

        // 处理 class-validator 的错误格式
        if (Array.isArray(res['message'])) {
          message = '参数校验失败';
          errors = this.formatValidationErrors(res['message'] as string[]);
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      message,
      code,
      ...(errors && { errors }),
    };

    response.status(status).send(errorResponse);
  }

  private getCodeFromStatus(status: number): string {
    const statusCodeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      500: 'INTERNAL_ERROR',
    };
    return statusCodeMap[status] || 'UNKNOWN_ERROR';
  }

  private formatValidationErrors(messages: string[]): Record<string, string[]> {
    const errors: Record<string, string[]> = {};
    messages.forEach((msg) => {
      // 简单处理，将所有错误归类到 validation
      if (!errors['validation']) {
        errors['validation'] = [];
      }
      errors['validation'].push(msg);
    });
    return errors;
  }
}
