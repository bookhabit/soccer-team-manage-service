/**
 * NestJS 서버가 내려주는 에러 응답 형식
 * @example { message: '이미 사용 중인 이메일입니다.', error: 'Conflict', statusCode: 409 }
 */
export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  code?: string; // 서버 도메인 에러 코드 (e.g. "INVALID_CREDENTIALS")
}

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
};
