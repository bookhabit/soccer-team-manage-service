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

### 앱 시작 (자동 로그인 유지)

```
앱 시작
  └─ RootLayout: hydrate() 호출
       ├─ SecureStore에서 AT, RT 병렬 복원 (Promise.all)
       ├─ isHydrated: false → RootLayoutNav: null 반환 (스플래시 유지)
       └─ isHydrated: true → useEffect 발동 (useSegments 기반 라우팅)
            ├─ AT 있고 (auth) 그룹에 위치 → router.replace('/(app)')
            ├─ AT 없고 (app) 그룹에 위치 → router.replace('/(auth)/login')
            └─ 그 외 → 이동 없음 (이미 올바른 위치)

(app)/_layout.tsx 진입 후
  ├─ AT 유효 → 앱 진입
  ├─ AT 만료 → 첫 API 401 → Silent Refresh → 앱 유지
  └─ AT 없음 or RT 만료 → /(auth)/login 리다이렉트
```

> **라우팅 방식**: `<Redirect>` 컴포넌트 대신 `useSegments` + `useEffect`를 사용한다.  
> `<Redirect>`는 렌더 시점에 즉시 발동하므로 hydration 완료 전에 `(app)/_layout`이 null을 반환하면  
> Expo Router가 `(auth)`로 fallback하는 레이스 컨디션이 발생한다.  
> `useEffect`는 `isHydrated: true` 확인 후에만 실행되므로 이 문제를 방지한다.

### 회원가입 + 온보딩

```
useSignup() → signup(body)
  └─ POST /api/v1/sessions/signup        ← 유저 생성 + 세션 발급을 하나의 엔드포인트에서 처리
       └─ 응답: { accessToken, refreshToken }
            └─ setTokens(at, rt)
                 ├─ Zustand: { accessToken, refreshToken }
                 ├─ SecureStore: ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY
                 └─ router.replace('/(app)')
                      └─ (app)/_layout.tsx: isOnboarded: false 감지
                           └─ <Redirect href="/(auth)/onboarding" />

useOnboarding() → saveOnboarding(body)
  └─ PATCH /api/v1/users/me/onboarding   ← privateApi (AT 필요, 위에서 발급됨)
       └─ 응답: UserProfile (isOnboarded: true)
            └─ queryClient.setQueryData(AUTH_QUERY_KEYS.me, updatedProfile)
                 └─ (app)/_layout.tsx: isOnboarded: true → redirect 없음
                 └─ router.replace('/(app)')
```

> **setQueryData 사용 이유**: `invalidateQueries`를 쓰면 캐시에 stale된 `isOnboarded: false` 데이터가  
> 잠시 남아있어 `(app)/_layout`이 온보딩으로 다시 redirect한다.  
> `setQueryData`로 즉시 업데이트하면 이 문제가 발생하지 않는다.

### 로그인

```
useLogin() → login(body)
  └─ POST /api/v1/sessions
       └─ 응답: { accessToken, refreshToken }
            └─ setTokens(at, rt)
                 ├─ Zustand: { accessToken, refreshToken }
                 ├─ SecureStore: ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY
                 ├─ queryClient.invalidateQueries(me)
                 └─ router.replace('/(app)')
                      └─ (app)/_layout.tsx: isOnboarded: true → 앱 진입
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
            └─ 실패: onAuthFailure() → clearAuth()
                 └─ RootLayoutNav useEffect 발동
                      └─ AT 없음 + (app) 그룹 → router.replace('/(auth)/login')
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
                 ├─ queryClient.clear()
                 └─ RootLayoutNav useEffect 발동 (router.replace 직접 호출 안 함)
                      └─ AT 없음 + (app) 그룹 → router.replace('/(auth)/login')
```

> `useLogout`, `useWithdraw`는 `router.replace`를 직접 호출하지 않는다.  
> `clearAuth()` → AT null → `RootLayoutNav` useEffect가 자동으로 login으로 이동시킨다.  
> `onAuthFailure`(토큰 갱신 실패)도 동일하게 처리된다.

---

## RT Rotation + 재사용 감지

매 갱신마다 새 RT를 발급하고 이전 RT를 폐기한다.

```
갱신 요청 (RT_old)
  └─ 서버: hashToken(RT_old) ↔ DB.refreshTokenHash 비교
       ├─ 일치 → 새 토큰 쌍 발급, DB에 hashToken(RT_new) 저장
       └─ 불일치 → 재사용 감지
            └─ DB 세션 강제 삭제 + 401 TOKEN_REUSE_DETECTED
                 └─ 클라이언트: clearAuth() → RootLayoutNav useEffect → login 화면
```

DB에는 RT 원문이 아닌 **SHA-256 해시만** 저장한다.

---

## 서버 API

### `POST /api/v1/sessions/signup` — 회원가입

```
@Public()  // 인증 불필요
Request  body: { email, password, name }
Response body: { accessToken, refreshToken }   ← 유저 생성 + 세션 발급 동시 처리
```

> 기존 `POST /api/v1/users`는 유저 데이터만 반환했으나, 온보딩 엔드포인트가 AT를 요구하므로  
> 회원가입 시점에 바로 세션을 발급한다. `SessionsService`가 이미 `UsersService`를 주입받으므로  
> 순환 의존성 없이 구현 가능하다.

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
| 진입점 라우트 가드 | `client/app/_layout.tsx` (useSegments + useEffect) |
| 앱 영역 보호 레이아웃 | `client/app/(app)/_layout.tsx` |
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
  ├─ accessToken 있음 + (auth) 그룹  →  router.replace('/(app)')
  ├─ accessToken 없음 + (app) 그룹   →  router.replace('/(auth)/login')
  └─ 그 외                           →  현재 위치 유지

(app) 진입 후
  ├─ isOnboarded: true   →  앱 정상 진입
  └─ isOnboarded: false  →  <Redirect href="/(auth)/onboarding" />
```

> 라우팅 책임 분리:
> - `_layout.tsx` (RootLayoutNav): AT 유무에 따른 auth ↔ app 전환 담당
> - `(app)/_layout.tsx`: 온보딩 완료 여부 체크 담당

---

## 소셜 로그인 전환 시 고려사항

- `provider` + `providerId` 조합으로 계정 식별 (User 스키마 이미 설계됨)
- 토큰 저장/갱신 로직은 동일하게 유지 (`setTokens`, `clearAuth`)
- 소셜 인증 후 서버가 동일한 `{ accessToken, refreshToken }` 형식으로 응답하면 클라이언트 변경 최소화
- 기존 LOCAL 계정과 소셜 계정 연결 기능은 별도 기획 필요
