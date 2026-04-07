# 인증/인가 스펙

## 개요

현재는 이메일/패스워드 방식으로 구현하며, 추후 소셜 로그인(카카오·구글·애플)으로 전환 예정.  
React Native 환경에 맞게 토큰을 OS 보안 저장소(SecureStore)에 저장하고, 짧은 AT 수명 + RT Rotation으로 보안을 유지한다.

---

## 토큰 전략

| 항목 | Access Token (AT) | Refresh Token (RT) |
|---|---|---|
| **수명** | 15분 | 7일 |
| **저장 위치** | Zustand 메모리 + SecureStore | SecureStore |
| **전송 방식** | `Authorization: Bearer {AT}` 헤더 | request body `{ refreshToken }` |
| **서버 저장** | 저장 안 함 (Stateless) | SHA-256 해시만 DB 저장 |
| **무효화** | 수명 만료 또는 재발급 시 | `/sessions/refresh` 호출 시 Rotation |

### SecureStore를 사용하는 이유

httpOnly 쿠키는 **브라우저 전용 보안 수단**이다. React Native 환경에서는 해당 공격 벡터가 존재하지 않는다.

| 공격 | 브라우저 위협 | React Native |
|---|---|---|
| **XSS** | DOM에서 `document.cookie` 탈취 | DOM 없음 → 위협 없음 |
| **CSRF** | 브라우저의 쿠키 자동 전송 악용 | 앱이 헤더를 명시적 설정 → 위협 없음 |

SecureStore는 iOS Keychain / Android Keystore로 구현되며, OS 레벨 암호화 + 생체인증 보호를 제공한다.

---

## 인증 플로우

### 앱 시작 (자동 로그인)

```
앱 시작
  └─ hydrate()
       ├─ SecureStore에서 AT, RT 병렬 복원 (Promise.all)
       ├─ isHydrated: true → RootLayoutNav 렌더
       │
       ├─ AT 존재 & 유효 → 앱 진입
       ├─ AT 존재 & 만료 → 첫 API 401 → Silent Refresh → 앱 유지
       └─ AT 없음 or RT 만료 → /(auth)/login 리다이렉트
```

### 로그인

```
useLogin() → login(body)
  └─ POST /api/v1/sessions
       └─ 응답: { accessToken, refreshToken }
            └─ setTokens(at, rt)
                 ├─ Zustand: { accessToken, refreshToken }
                 ├─ SecureStore: ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY
                 └─ router.replace('/(app)')
```

### Silent Refresh (AT 만료 시 자동 갱신)

```
privateApi 요청 → 401 응답
  └─ interceptor 감지
       ├─ isRefreshing: true → 대기 큐에 적재
       └─ POST /api/v1/sessions/refresh
            body: { refreshToken }
            └─ 성공: 새 { accessToken, refreshToken }
                 ├─ setTokens(newAt, newRt)
                 └─ 실패한 원래 요청 재시도
            └─ 실패: onAuthFailure() → clearAuth() → 로그인 화면
```

> 동시에 여러 요청이 401이 나는 경우, `failedQueue`에 적재 후 갱신 완료 시 일괄 재시도.

### 로그아웃

```
useLogout() → logout()
  └─ DELETE /api/v1/sessions  (AT로 인증)
       └─ 서버: DB 세션 삭제
            └─ clearAuth()
                 ├─ Zustand: { accessToken: null, refreshToken: null }
                 ├─ SecureStore: ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY 삭제
                 └─ queryClient.clear() → router.replace('/(auth)/login')
```

---

## RT Rotation + 재사용 감지

매 갱신마다 새 RT를 발급하고 이전 RT를 폐기한다.

```
갱신 요청 (RT_old)
  └─ 서버: hashToken(RT_old) ↔ DB.refreshTokenHash 비교
       ├─ 일치 → 새 토큰 쌍 발급, DB에 hashToken(RT_new) 저장
       └─ 불일치 → 재사용 감지
            └─ DB 세션 강제 삭제 + 401 TOKEN_REUSE_DETECTED
                 └─ 클라이언트: clearAuth() → 로그인 화면
```

DB에는 RT 원문이 아닌 **SHA-256 해시만** 저장한다.

---

## 서버 API

### `POST /api/v1/sessions` — 로그인

```
@Public()  // 인증 불필요
Request  body: { email, password }
Response body: { accessToken, refreshToken }
```

### `POST /api/v1/sessions/refresh` — 토큰 갱신

```
@Public()  // 인증 불필요
Request  body: { refreshToken }
Response body: { accessToken, refreshToken }  // RT Rotation
```

### `DELETE /api/v1/sessions` — 로그아웃

```
Authorization: Bearer {AT}  // 필수
Response: 204 No Content
```

---

## 서버 인가 구조

모든 라우트는 기본적으로 인증이 필요하다. `@Public()` 데코레이터가 있는 라우트만 AT 없이 접근 가능하다.

```
JwtAuthGuard (APP_GUARD, 전역 적용)
  ├─ @Public() → 통과
  └─ 나머지 → passport-jwt 검증
       ├─ AT 유효 → validate(): DB에서 user 존재 확인
       └─ AT 무효/없음 → 401
```

JwtStrategy는 AT 검증 후 DB에서 user 존재 여부만 확인한다 (세션 조회 없음).  
강제 로그아웃은 `/refresh` 시점에 세션 삭제로 처리. AT 수명(15분)이 짧아 즉각 무효화가 필요한 케이스 대부분을 커버한다.

---

## 클라이언트 파일 위치

| 역할 | 경로 |
|---|---|
| Zustand 스토어 | `client/src/shared/store/useAuthStore.ts` |
| Axios 인스턴스 | `client/src/shared/http/apiClient.ts` |
| Axios 팩토리 (인터셉터) | `client/src/shared/http/createApiClient.ts` |
| 인증 hooks | `client/src/features/auth/data/hooks/useAuth.ts` |
| 인증 API 서비스 | `client/src/features/auth/data/services/auth.service.ts` |
| Zod 스키마 | `client/src/features/auth/data/schemas/auth.schema.ts` |
| 진입점 라우트 가드 | `client/app/(app)/_layout.tsx` |
| hydrate 호출 위치 | `client/app/_layout.tsx` |

---

## 상태 타입

```ts
// useAuthStore
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  hydrate: () => Promise<void>;
}
```

---

## 인증 판단 흐름 (화면 라우팅)

```
isHydrated: false  →  null (스플래시 유지)
isHydrated: true
  ├─ accessToken 있음  →  (app) 진입
  └─ accessToken 없음  →  (auth)/login 리다이렉트
```

> `hydrate()`는 `_layout.tsx`에서 앱 최초 마운트 시 1회만 호출한다.

---

## 소셜 로그인 전환 시 고려사항

- `provider` + `providerId` 조합으로 계정 식별 (User 스키마 이미 설계됨)
- 토큰 저장/갱신 로직은 동일하게 유지 (`setTokens`, `clearAuth`)
- 소셜 인증 후 서버가 동일한 `{ accessToken, refreshToken }` 형식으로 응답하면 클라이언트 변경 최소화
- 기존 LOCAL 계정과 소셜 계정 연결 기능은 별도 기획 필요
