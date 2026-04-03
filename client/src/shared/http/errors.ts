import type { ApiErrorResponse } from '../types/api';

/**
 * 서버가 { message, error, statusCode } 형식으로 내려준 HTTP 에러
 */
export class ApiError extends Error {
  readonly error: string;
  readonly statusCode: number;

  constructor({ message, error, statusCode }: ApiErrorResponse) {
    super(message);
    this.name = 'ApiError';
    this.error = error;
    this.statusCode = statusCode;
  }
}

/**
 * 요청은 전송됐으나 서버로부터 응답이 없는 네트워크 에러
 */
export class NetworkError extends Error {
  constructor() {
    super('서버로부터 응답이 없습니다. 네트워크 연결을 확인해주세요.');
    this.name = 'NetworkError';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * 사용자에게 보여줄 메시지를 추출합니다.
 * - ApiError   → 서버가 내려준 message
 * - NetworkError → 네트워크 안내 문구
 * - 그 외       → 기본 문구
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  if (isNetworkError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return '알 수 없는 오류가 발생했습니다.';
}
