import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import sanitizeHtml from 'sanitize-html';

/**
 * 요청 body의 모든 string 필드를 재귀적으로 순회하여 HTML 태그를 제거한다.
 * XSS(Cross-Site Scripting) 방어 — 사용자 입력이 저장되는 모든 엔드포인트에 전역 적용.
 */
@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<{ body: unknown }>();
    if (request.body && typeof request.body === 'object') {
      request.body = this.sanitizeObject(request.body);
    }
    return next.handle();
  }

  private sanitizeObject<T>(obj: T): T {
    if (typeof obj === 'string') {
      return sanitizeHtml(obj, { allowedTags: [], allowedAttributes: {} }) as unknown as T;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item)) as unknown as T;
    }
    if (obj !== null && typeof obj === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized as T;
    }
    return obj;
  }
}
