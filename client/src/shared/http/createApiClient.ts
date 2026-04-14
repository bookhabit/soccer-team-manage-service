import axios from 'axios';
import { z } from 'zod';
import { ApiError, NetworkError } from './errors';

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiErrorResponse } from '../types/api';

interface CustomConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

interface QueueEntry {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

export interface CreateApiClientOptions {
  baseURL: string;
  getAccessToken: () => string | null;
  getRefreshToken?: () => string | null;
  onTokenRefreshed: (accessToken: string, refreshToken: string) => void;
  onAuthFailure: () => void;
  refreshEndpoint?: string;
  withCredentials?: boolean;
  timeout?: number;
}

export interface ApiClient {
  publicApi: AxiosInstance;
  privateApi: AxiosInstance;
  http: {
    auth: {
      post: <T>(url: string, data?: object, schema?: z.ZodSchema) => Promise<T>;
    };
    get: <T>(url: string, params?: object, schema?: z.ZodSchema) => Promise<T>;
    post: <T>(url: string, data?: object, schema?: z.ZodSchema) => Promise<T>;
    put: <T>(url: string, data?: object, schema?: z.ZodSchema) => Promise<T>;
    patch: <T>(url: string, data?: object, schema?: z.ZodSchema) => Promise<T>;
    delete: <T>(url: string, data?: object, schema?: z.ZodSchema) => Promise<T>;
  };
}

/**
 * 응답 데이터를 Zod 스키마로 검증합니다.
 * - 검증 실패 시 콘솔에 상세 에러를 출력하고 ZodError를 throw합니다.
 */
function handleResponse<T>(res: AxiosResponse, schema?: z.ZodSchema): T {
  // NestJS가 null을 반환할 때 빈 body("")로 오는 경우를 null로 정규화
  const data = res.data === '' ? null : res.data;

  if (schema) {
    const result = schema.safeParse(data);
    if (!result.success) {
      console.error('❌ 스키마 검증 실패:', result.error.format());
      throw result.error;
    }
    return result.data as T;
  }

  return data as T;
}

/**
 * HTTP/네트워크/알 수 없는 에러를 분류해서 로깅하고 표준 에러로 변환합니다.
 * 에러를 분석하고 표준 에러 객체로 변환하는 헬퍼 함수
 */
const formatError = (error: unknown, label: string) => {
  if (!axios.isAxiosError(error)) return error;

  if (error.response) {
    // 🔥 모든 API의 상세 로그를 여기서 한 번에 처리
    console.log('실패한 엔드포인트 : ', error.request.responseURL);
    console.log(`🔍 [${label}] 서버 응답 데이터:`, JSON.stringify(error.response.data, null, 2));
    return new ApiError(error.response.data as ApiErrorResponse);
  }

  if (error.request) {
    console.error(`❌ [${label}] 네트워크 오류`);
    return new NetworkError();
  }

  return error;
};

export function createApiClient(options: CreateApiClientOptions): ApiClient {
  const {
    baseURL,
    getAccessToken,
    getRefreshToken,
    onTokenRefreshed,
    onAuthFailure,
    refreshEndpoint = '/sessions/refresh',
    withCredentials = false,
    timeout = 10000,
  } = options;

  const BASE_CONFIG: AxiosRequestConfig = {
    baseURL,
    timeout,
    withCredentials,
    headers: { 'Content-Type': 'application/json' },
  };

  const publicApi = axios.create({ ...BASE_CONFIG });
  const privateApi = axios.create(BASE_CONFIG);

  // ─── publicApi 에러 인터셉터 ───────────────────────────────────────────────
  publicApi.interceptors.response.use(
    (res) => res,
    (err) => Promise.reject(formatError(err, 'publicApi')),
  );

  // ─── privateApi 요청 인터셉터 (AT 주입) ───────────────────────────────────
  privateApi.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // ─── privateApi 에러 인터셉터 (401 → 토큰 갱신 → 일반 에러 처리) ──────────
  let isRefreshing = false;
  let failedQueue: QueueEntry[] = [];

  const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((entry) => {
      if (error) entry.reject(error);
      else entry.resolve(token!);
    });
    failedQueue = [];
  };

  privateApi.interceptors.response.use(
    (res) => res,
    async (error: unknown) => {
      if (!axios.isAxiosError(error)) {
        console.error('❌ [privateApi] 알 수 없는 오류:', error);
        return Promise.reject(error);
      }

      const originalRequest = error.config as CustomConfig;

      // ── 401: 토큰 갱신 시도 ──
      if (error.response?.status === 401 && !originalRequest?._retry) {
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return privateApi(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = getRefreshToken?.() ?? null;
          const body = refreshToken ? { refreshToken } : undefined;

          const res = await publicApi.post<{
            accessToken: string;
            refreshToken?: string;
          }>(refreshEndpoint, body);

          const { accessToken, refreshToken: newRefreshToken } = res.data;
          onTokenRefreshed(accessToken, newRefreshToken ?? '');
          processQueue(null, accessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return privateApi(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          console.error('❌ [privateApi] 토큰 갱신 실패 — 로그아웃 처리');
          onAuthFailure();
          return Promise.reject(formatError(refreshError, 'privateApi:refresh'));
        } finally {
          isRefreshing = false;
        }
      }

      // ── 그 외 HTTP 에러 ──
      // 401이 아니거나, 토큰 갱신마저 실패했을 때 마지막에 formatError 호출
      return Promise.reject(formatError(error, 'privateApi'));
    },
  );

  // ─── http 래퍼 ───────────────────────────────────────────────────────────
  const http: ApiClient['http'] = {
    auth: {
      post: <T>(url: string, data?: object, schema?: z.ZodSchema) =>
        publicApi.post(url, data).then((res) => handleResponse<T>(res, schema)),
    },
    get: <T>(url: string, params?: object, schema?: z.ZodSchema) =>
      privateApi.get(url, { params }).then((res) => handleResponse<T>(res, schema)),
    post: <T>(url: string, data?: object, schema?: z.ZodSchema) =>
      privateApi.post(url, data).then((res) => handleResponse<T>(res, schema)),
    put: <T>(url: string, data?: object, schema?: z.ZodSchema) =>
      privateApi.put(url, data).then((res) => handleResponse<T>(res, schema)),
    patch: <T>(url: string, data?: object, schema?: z.ZodSchema) =>
      privateApi.patch(url, data).then((res) => handleResponse<T>(res, schema)),
    delete: <T>(url: string, data?: object, schema?: z.ZodSchema) =>
      privateApi.delete(url, { data }).then((res) => handleResponse<T>(res, schema)),
  };

  return { publicApi, privateApi, http };
}
