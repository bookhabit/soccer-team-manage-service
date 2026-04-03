import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import type { Response } from 'express';

/**
 * 모든 HttpException을 { statusCode, error, message, code? } 형식으로 통일합니다.
 *
 * NestJS는 UnauthorizedException({ code, message }) 처럼 객체를 넘기면
 * 그 객체를 그대로 응답 body로 쓰기 때문에 statusCode, error 필드가 빠집니다.
 * 이 필터가 항상 일관된 포맷을 보장합니다.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // exceptionResponse는 string 또는 object
    const body =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : (exceptionResponse as Record<string, unknown>);

    const message =
      typeof body['message'] === 'string'
        ? body['message']
        : JSON.stringify(body['message']);

    const code = typeof body['code'] === 'string' ? body['code'] : undefined;

    // HTTP 상태명 (e.g. "Unauthorized", "Not Found")
    const error = exception.constructor.name.replace('Exception', '');

    response.status(statusCode).json({
      statusCode,
      error,
      message,
      ...(code !== undefined && { code }),
    });
  }
}
