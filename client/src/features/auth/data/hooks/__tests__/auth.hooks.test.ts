/**
 * Integration Tests — Auth Hooks (useAuth.ts)
 *
 * 대상: useLogin, useSignup, useOnboarding, useMyProfile, useUpdateProfile, useWithdraw, useRegions
 * 도구: Vitest + MSW + TanStack Query renderHook
 *
 * 실행 전 필요한 패키지:
 *   npm install -D vitest @testing-library/react-hooks msw@latest
 */

import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// ─── 모의 객체 설정 ────────────────────────────────────────────────────────────

// expo-router 모의
vi.mock('expo-router', () => ({
  router: {
    replace: vi.fn(),
    push: vi.fn(),
  },
}));

// expo-secure-store 모의
vi.mock('expo-secure-store', () => ({
  setItemAsync: vi.fn(),
  getItemAsync: vi.fn().mockResolvedValue(null),
  deleteItemAsync: vi.fn(),
}));

// ─── 모의 데이터 ──────────────────────────────────────────────────────────────

const MOCK_ACCESS_TOKEN = 'mock-access-token-xyz';
const MOCK_REFRESH_TOKEN = 'mock-refresh-token-xyz';

const MOCK_USER_PROFILE = {
  id: 'user-123',
  provider: 'LOCAL',
  email: 'user@example.com',
  name: '홍길동',
  birthYear: 1990,
  gender: 'MALE',
  position: 'FW',
  foot: 'RIGHT',
  years: 5,
  level: 'AMATEUR',
  preferredRegionId: null,
  avatarUrl: null,
  mannerScore: 36.5,
  isOnboarded: true,
  status: 'ACTIVE',
  createdAt: '2024-01-01T00:00:00.000Z',
};

const MOCK_REGIONS = [
  { id: 'region-1', name: '서울특별시', sigungu: '강남구' },
  { id: 'region-2', name: '서울특별시', sigungu: '강북구' },
];

const BASE_URL = 'http://localhost:3000/api/v1';

// ─── MSW 서버 설정 ────────────────────────────────────────────────────────────

const server = setupServer(
  // 로그인 성공
  http.post(`${BASE_URL}/sessions`, () =>
    HttpResponse.json({ accessToken: MOCK_ACCESS_TOKEN, refreshToken: MOCK_REFRESH_TOKEN })
  ),
  // 회원가입 성공
  http.post(`${BASE_URL}/sessions/signup`, () =>
    HttpResponse.json(
      { accessToken: MOCK_ACCESS_TOKEN, refreshToken: MOCK_REFRESH_TOKEN },
      { status: 201 }
    )
  ),
  // 온보딩 성공
  http.patch(`${BASE_URL}/users/me/onboarding`, () =>
    HttpResponse.json(MOCK_USER_PROFILE)
  ),
  // 내 프로필 성공
  http.get(`${BASE_URL}/users/me`, () =>
    HttpResponse.json(MOCK_USER_PROFILE)
  ),
  // 프로필 업데이트 성공
  http.patch(`${BASE_URL}/users/me`, () =>
    HttpResponse.json({ ...MOCK_USER_PROFILE, name: '새이름' })
  ),
  // 회원 탈퇴 성공
  http.delete(`${BASE_URL}/users/me`, () =>
    new HttpResponse(null, { status: 200 })
  ),
  // 지역 목록 성공
  http.get(`${BASE_URL}/regions`, () =>
    HttpResponse.json(MOCK_REGIONS)
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ─── 테스트 유틸리티 ──────────────────────────────────────────────────────────

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

// ─── useAuthStore 접근을 위한 상태 초기화 헬퍼 ───────────────────────────────

async function setStoreAccessToken(token: string | null = MOCK_ACCESS_TOKEN) {
  const { useAuthStore } = await import('@/src/shared/store/useAuthStore');
  useAuthStore.setState({ accessToken: token, refreshToken: null, isHydrated: true });
}

// ─── useLogin ────────────────────────────────────────────────────────────────

describe('useLogin', () => {
  it('AUTH-03-001: 로그인 성공 시 AuthStore에 AT·RT가 저장되고 /(app)으로 이동한다', async () => {
    const { router } = await import('expo-router');
    const { useAuthStore } = await import('@/src/shared/store/useAuthStore');
    const { useLogin } = await import('../useAuth');

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper(queryClient) });

    act(() => {
      result.current.mutate({ email: 'user@example.com', password: 'password1' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(useAuthStore.getState().accessToken).toBe(MOCK_ACCESS_TOKEN);
    expect(useAuthStore.getState().refreshToken).toBe(MOCK_REFRESH_TOKEN);
    expect(router.replace).toHaveBeenCalledWith('/(app)');
  });

  it('AUTH-03-002: 서버가 401 AUTH_001을 반환하면 error.error 코드가 "AUTH_001"이다', async () => {
    server.use(
      http.post(`${BASE_URL}/sessions`, () =>
        HttpResponse.json(
          { statusCode: 401, error: 'AUTH_001', message: '이메일 또는 비밀번호를 확인해주세요.' },
          { status: 401 }
        )
      )
    );

    const { useLogin } = await import('../useAuth');
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper(queryClient) });

    act(() => {
      result.current.mutate({ email: 'user@example.com', password: 'wrongpassword' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const err = result.current.error as any;
    expect(err?.error).toBe('AUTH_001');
  });

  it('AUTH-03-003: isPending = true 동안 버튼은 disabled 상태여야 한다 (isPending 검증)', async () => {
    // 응답을 지연시켜 isPending 상태를 포착
    server.use(
      http.post(`${BASE_URL}/sessions`, async () => {
        await new Promise((r) => setTimeout(r, 200));
        return HttpResponse.json({ accessToken: MOCK_ACCESS_TOKEN, refreshToken: MOCK_REFRESH_TOKEN });
      })
    );

    const { useLogin } = await import('../useAuth');
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper(queryClient) });

    act(() => {
      result.current.mutate({ email: 'user@example.com', password: 'password1' });
    });

    // mutate 직후 isPending = true
    expect(result.current.isPending).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('AUTH-05-001: 네트워크 오류 시 isError = true가 되고 NetworkError가 throw된다', async () => {
    server.use(
      http.post(`${BASE_URL}/sessions`, () => HttpResponse.error())
    );

    const { useLogin } = await import('../useAuth');
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper(queryClient) });

    act(() => {
      result.current.mutate({ email: 'user@example.com', password: 'password1' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeTruthy();
  });
});

// ─── useSignup ───────────────────────────────────────────────────────────────

describe('useSignup', () => {
  it('AUTH-03-004: 회원가입 성공 시 onSuccess가 호출되고 토큰이 저장된다', async () => {
    const { useAuthStore } = await import('@/src/shared/store/useAuthStore');
    const { useSignup } = await import('../useAuth');

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useSignup(), { wrapper: createWrapper(queryClient) });

    act(() => {
      result.current.mutate({ email: 'new@example.com', password: 'password1', name: '홍길동' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(useAuthStore.getState().accessToken).toBe(MOCK_ACCESS_TOKEN);
    expect(useAuthStore.getState().refreshToken).toBe(MOCK_REFRESH_TOKEN);
  });

  it('AUTH-05-002: 서버가 409 USER_002를 반환하면 error.error 코드가 "USER_002"이다', async () => {
    server.use(
      http.post(`${BASE_URL}/sessions/signup`, () =>
        HttpResponse.json(
          { statusCode: 409, error: 'USER_002', message: '이미 사용 중인 이메일입니다.' },
          { status: 409 }
        )
      )
    );

    const { useSignup } = await import('../useAuth');
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useSignup(), { wrapper: createWrapper(queryClient) });

    act(() => {
      result.current.mutate({ email: 'existing@example.com', password: 'password1', name: '홍길동' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const err = result.current.error as any;
    expect(err?.error).toBe('USER_002');
  });
});

// ─── useOnboarding ────────────────────────────────────────────────────────────

describe('useOnboarding', () => {
  const ONBOARDING_DATA = {
    name: '홍길동',
    birthYear: 1990,
    position: 'FW' as const,
    foot: 'RIGHT' as const,
    years: 5,
    level: 'AMATEUR' as const,
  };

  it('AUTH-03-005: 온보딩 성공 시 onSuccess가 실행되고 me 쿼리 캐시가 업데이트된다', async () => {
    const { router } = await import('expo-router');
    const { useOnboarding, AUTH_QUERY_KEYS } = await import('../useAuth');

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useOnboarding(), { wrapper: createWrapper(queryClient) });

    act(() => {
      result.current.mutate(ONBOARDING_DATA);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // setQueryData 확인
    const cachedProfile = queryClient.getQueryData(AUTH_QUERY_KEYS.me);
    expect(cachedProfile).toMatchObject({ id: 'user-123' });

    // router.replace 확인
    expect(router.replace).toHaveBeenCalledWith('/(app)');
  });

  it('AUTH-05-003: 서버가 409 USER_003을 반환하면 error.error 코드가 "USER_003"이다', async () => {
    server.use(
      http.patch(`${BASE_URL}/users/me/onboarding`, () =>
        HttpResponse.json(
          { statusCode: 409, error: 'USER_003', message: '이미 온보딩이 완료된 사용자입니다.' },
          { status: 409 }
        )
      )
    );

    const { useOnboarding } = await import('../useAuth');
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useOnboarding(), { wrapper: createWrapper(queryClient) });

    act(() => {
      result.current.mutate(ONBOARDING_DATA);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const err = result.current.error as any;
    expect(err?.error).toBe('USER_003');
  });

  it('AUTH-01-001: 토큰 없는 상태에서 요청하면 401을 받고 에러 상태가 된다', async () => {
    server.use(
      http.patch(`${BASE_URL}/users/me/onboarding`, () =>
        HttpResponse.json(
          { statusCode: 401, error: 'UNAUTHORIZED', message: '인증이 필요합니다.' },
          { status: 401 }
        )
      )
    );

    const { useOnboarding } = await import('../useAuth');
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useOnboarding(), { wrapper: createWrapper(queryClient) });

    act(() => {
      result.current.mutate(ONBOARDING_DATA);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeTruthy();
  });
});

// ─── useMyProfile ─────────────────────────────────────────────────────────────

describe('useMyProfile', () => {
  beforeEach(async () => {
    await setStoreAccessToken(MOCK_ACCESS_TOKEN);
  });

  it('USER-04-001: GET /users/me 성공 시 data가 userProfileSchema로 parse 가능하다', async () => {
    const { useMyProfile } = await import('../useAuth');
    const { userProfileSchema } = await import('../../schemas/auth.schema');

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useMyProfile(), { wrapper: createWrapper(queryClient) });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const parsed = userProfileSchema.safeParse(result.current.data);
    expect(parsed.success).toBe(true);
    expect(result.current.data?.id).toBe('user-123');
  });

  it('USER-05-001: GET /users/me가 500을 반환하면 isError = true이다', async () => {
    server.use(
      http.get(`${BASE_URL}/users/me`, () =>
        HttpResponse.json(
          { statusCode: 500, error: 'Internal Server Error', message: '서버 오류' },
          { status: 500 }
        )
      )
    );

    const { useMyProfile } = await import('../useAuth');
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useMyProfile(), { wrapper: createWrapper(queryClient) });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('USER-05-002: 네트워크 단절 시 isError = true이다', async () => {
    server.use(
      http.get(`${BASE_URL}/users/me`, () => HttpResponse.error())
    );

    const { useMyProfile } = await import('../useAuth');
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useMyProfile(), { wrapper: createWrapper(queryClient) });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('accessToken이 없으면 쿼리가 실행되지 않는다 (enabled = false)', async () => {
    const { useAuthStore } = await import('@/src/shared/store/useAuthStore');
    useAuthStore.setState({ accessToken: null });

    const { useMyProfile } = await import('../useAuth');
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useMyProfile(), { wrapper: createWrapper(queryClient) });

    // 쿼리가 실행되지 않으므로 status = 'pending', fetchStatus = 'idle'
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });
});

// ─── useUpdateProfile ────────────────────────────────────────────────────────

describe('useUpdateProfile', () => {
  it('USER-03-001: 프로필 업데이트 성공 시 onSuccess가 호출되고 me 쿼리가 invalidate된다', async () => {
    const { useUpdateProfile, AUTH_QUERY_KEYS } = await import('../useAuth');

    const queryClient = createTestQueryClient();
    // 미리 캐시에 데이터 채워두기
    queryClient.setQueryData(AUTH_QUERY_KEYS.me, MOCK_USER_PROFILE);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateProfile(), { wrapper: createWrapper(queryClient) });

    act(() => {
      result.current.mutate({ name: '새이름' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: AUTH_QUERY_KEYS.me })
    );
  });
});

// ─── useWithdraw ──────────────────────────────────────────────────────────────

describe('useWithdraw', () => {
  it('USER-03-002: 탈퇴 성공 시 clearAuth()가 호출되고 쿼리 캐시가 초기화된다', async () => {
    const { useAuthStore } = await import('@/src/shared/store/useAuthStore');
    await setStoreAccessToken(MOCK_ACCESS_TOKEN);

    const { useWithdraw } = await import('../useAuth');
    const queryClient = createTestQueryClient();
    const clearSpy = vi.spyOn(queryClient, 'clear');

    const { result } = renderHook(() => useWithdraw(), { wrapper: createWrapper(queryClient) });

    act(() => {
      result.current.mutate({ reason: 'OTHER' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(clearSpy).toHaveBeenCalled();
  });

  it('USER-05-004: 서버가 403 USER_004를 반환하면 error.error 코드가 "USER_004"이다', async () => {
    server.use(
      http.delete(`${BASE_URL}/users/me`, () =>
        HttpResponse.json(
          { statusCode: 403, error: 'USER_004', message: '이미 탈퇴한 계정입니다.' },
          { status: 403 }
        )
      )
    );

    const { useWithdraw } = await import('../useAuth');
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useWithdraw(), { wrapper: createWrapper(queryClient) });

    act(() => {
      result.current.mutate({ reason: 'OTHER' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const err = result.current.error as any;
    expect(err?.error).toBe('USER_004');
  });
});

// ─── useRegions ───────────────────────────────────────────────────────────────

describe('useRegions', () => {
  it('USER-04-002: GET /regions 성공 시 각 항목이 regionSchema로 parse 가능하다', async () => {
    const { useRegions } = await import('../useAuth');
    const { regionSchema } = await import('../../schemas/auth.schema');
    const { z } = await import('zod');

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useRegions(), { wrapper: createWrapper(queryClient) });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(Array.isArray(result.current.data)).toBe(true);
    const parsed = z.array(regionSchema).safeParse(result.current.data);
    expect(parsed.success).toBe(true);
  });

  it('USER-04-003: staleTime: Infinity 설정으로 캐시 재사용 시 추가 네트워크 요청이 발생하지 않는다', async () => {
    const { useRegions } = await import('../useAuth');

    let requestCount = 0;
    server.use(
      http.get(`${BASE_URL}/regions`, () => {
        requestCount++;
        return HttpResponse.json(MOCK_REGIONS);
      })
    );

    const queryClient = createTestQueryClient();
    const wrapper = createWrapper(queryClient);

    // 첫 번째 마운트
    const { result: result1, unmount: unmount1 } = renderHook(() => useRegions(), { wrapper });
    await waitFor(() => expect(result1.current.isSuccess).toBe(true));
    unmount1();

    // 두 번째 마운트 — staleTime: Infinity 이므로 요청 없이 캐시 반환
    const { result: result2 } = renderHook(() => useRegions(), { wrapper });
    await waitFor(() => expect(result2.current.isSuccess).toBe(true));

    // staleTime이 Infinity이므로 첫 번째 요청 1회만 발생
    expect(requestCount).toBe(1);
  });
});
