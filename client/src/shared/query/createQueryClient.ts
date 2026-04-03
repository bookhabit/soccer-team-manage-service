/**
 * TanStack Query QueryClient 팩토리
 *
 * ⚠️ 싱글턴으로 공유하지 마세요 — 앱마다 독립 인스턴스를 생성해야 합니다.
 *
 * 이유:
 * 1. SSR: 모듈 초기화 시 생성된 싱글턴은 서버 요청 간 캐시를 공유 → 데이터 누수
 * 2. 앱 간 공유: 서로 다른 앱의 캐시가 섞여 예상치 못한 동작 발생
 * 3. 테스트: 각 테스트가 독립 인스턴스를 가져야 캐시 오염 없음
 */

// @tanstack/react-query는 peerDependency — 각 앱에서 설치
// eslint-disable-next-line import/no-extraneous-dependencies
import { QueryClient } from '@tanstack/react-query';

import type { QueryClientConfig } from '@tanstack/react-query';

/** 모든 앱에 적용되는 기본 정책 */
const DEFAULT_CONFIG: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // 5분간 데이터를 fresh로 간주 — 같은 데이터를 반복 요청하지 않음
      staleTime: 1000 * 60 * 5,
      // 비활성 캐시를 10분 후 GC
      gcTime: 1000 * 60 * 10,
      // 실패 시 최대 1회만 재시도 (기본 3회는 UX 저하)
      retry: 1,
      // 네트워크 오류만 재시도, 4xx는 재시도하지 않음
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      // 탭 포커스 시 자동 리패치 (기본값 유지)
      refetchOnWindowFocus: true,
    },
    mutations: {
      // 뮤테이션은 재시도하지 않음 — 중복 요청 위험
      retry: false,
    },
  },
};

/**
 * 앱별 QueryClient 인스턴스를 생성합니다.
 *
 * @param overrides - 앱 특성에 맞게 기본 설정을 덮어씌울 수 있습니다.
 *
 * @example
 * // Next.js App Router (서버/클라이언트 모두 안전)
 * // app/providers.tsx
 * 'use client';
 * import { useState } from 'react';
 * import { QueryClientProvider } from '@tanstack/react-query';
 * import { createQueryClient } from '@mono/shared/query';
 *
 * export function Providers({ children }) {
 *   // useState로 감싸야 컴포넌트마다 독립 인스턴스 보장 (RSC hydration 안전)
 *   const [queryClient] = useState(() => createQueryClient());
 *   return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
 * }
 *
 * @example
 * // 특정 앱에서 staleTime 오버라이드
 * const queryClient = createQueryClient({
 *   defaultOptions: { queries: { staleTime: 0 } }, // 항상 최신 데이터
 * });
 */
export function createQueryClient(overrides?: QueryClientConfig): QueryClient {
  return new QueryClient({
    ...DEFAULT_CONFIG,
    ...overrides,
    defaultOptions: {
      queries: {
        ...DEFAULT_CONFIG.defaultOptions?.queries,
        ...overrides?.defaultOptions?.queries,
      },
      mutations: {
        ...DEFAULT_CONFIG.defaultOptions?.mutations,
        ...overrides?.defaultOptions?.mutations,
      },
    },
  });
}
