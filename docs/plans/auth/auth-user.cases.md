# auth-user Test Cases

## Unit Test Cases (data/schemas, utils)

| ID          | GIVEN               | WHEN                                   | THEN                         | 우선순위 |
| ----------- | ------------------- | -------------------------------------- | ---------------------------- | -------- |
| AUTH-02-001 | loginSchema         | 유효한 이메일 + 8자 이상 비밀번호 입력 | parse 성공                   | High     |
| AUTH-02-002 | loginSchema         | 이메일 형식 아님 (`notanemail`)        | ZodError: invalid_string     | High     |
| AUTH-02-003 | loginSchema         | 비밀번호 7자 (`short1`)                | ZodError: too_small          | High     |
| AUTH-02-004 | signupSchema        | 닉네임 1자                             | ZodError: too_small          | High     |
| AUTH-02-005 | signupSchema        | 닉네임 21자                            | ZodError: too_big            | Medium   |
| AUTH-02-006 | onboardingSchema    | 필수 필드 전부 유효 (gender 생략)      | parse 성공                   | High     |
| AUTH-02-007 | onboardingSchema    | birthYear = 1949 (하한 미만)           | ZodError: too_small          | High     |
| AUTH-02-008 | onboardingSchema    | birthYear = 2011 (상한 초과)           | ZodError: too_big            | High     |
| AUTH-02-009 | onboardingSchema    | years = -1                             | ZodError: too_small          | Medium   |
| AUTH-02-010 | onboardingSchema    | years = 51                             | ZodError: too_big            | Medium   |
| AUTH-02-011 | onboardingSchema    | position = `"ST"` (유효하지 않은 enum) | ZodError: invalid_enum_value | High     |
| AUTH-02-012 | onboardingSchema    | foot = `"BOTH"`                        | parse 성공                   | Medium   |
| AUTH-02-013 | updateProfileSchema | 모든 필드 생략 (전부 optional)         | parse 성공 — 빈 객체         | Medium   |
| AUTH-02-014 | updateProfileSchema | name = `"홍"` (1자)                    | ZodError: too_small          | Medium   |
| AUTH-02-015 | withdrawSchema      | reason = `"TIME_CONFLICT"`             | parse 성공                   | High     |
| AUTH-02-016 | withdrawSchema      | reason = `"UNKNOWN_REASON"`            | ZodError: invalid_enum_value | High     |
| AUTH-02-017 | userProfileSchema   | status = `"DELETED"`                   | parse 성공                   | Medium   |
| AUTH-02-018 | userProfileSchema   | mannerScore = `"100"` (string)         | ZodError: expected number    | Medium   |
| USER-02-001 | regionSchema        | id, name, sigungu 모두 string          | parse 성공                   | Low      |

---

## Integration Test Cases (hooks + MSW)

### useLogin

| ID          | GIVEN                                                    | WHEN                                   | THEN                                              | 우선순위 |
| ----------- | -------------------------------------------------------- | -------------------------------------- | ------------------------------------------------- | -------- |
| AUTH-03-001 | POST /sessions/login → 200 `{accessToken, refreshToken}` | `useLogin().mutate({email, password})` | AuthStore에 AT·RT 저장됨, onSuccess 콜백 실행     | High     |
| AUTH-03-002 | POST /sessions/login → 401 `AUTH_001`                    | `useLogin().mutate(...)`               | `error.response.data.error.code === "AUTH_001"`   | High     |
| AUTH-03-003 | 버튼을 빠르게 2회 클릭                                   | `mutate` 호출 중 재호출                | `isPending = true` 동안 추가 요청 차단 (disabled) | High     |
| AUTH-05-001 | 네트워크 단절 (network error)                            | `useLogin().mutate(...)`               | `isError = true`, `error.message` 노출            | High     |

### useSignup

| ID          | GIVEN                        | WHEN                                              | THEN                                            | 우선순위 |
| ----------- | ---------------------------- | ------------------------------------------------- | ----------------------------------------------- | -------- |
| AUTH-03-004 | POST /users → 201            | `useSignup().mutate({email, password, nickname})` | onSuccess 콜백 호출, router.push(`/onboarding`) | High     |
| AUTH-05-002 | POST /users → 409 `USER_002` | `useSignup().mutate(...)`                         | `error.response.data.error.code === "USER_002"` | High     |

### useOnboarding

| ID          | GIVEN                                       | WHEN                                     | THEN                                             | 우선순위 |
| ----------- | ------------------------------------------- | ---------------------------------------- | ------------------------------------------------ | -------- |
| AUTH-03-005 | PATCH /users/me/onboarding → 200            | `useOnboarding().mutate(onboardingData)` | onSuccess 콜백 실행, invalidateQueries(`['me']`) | High     |
| AUTH-05-003 | PATCH /users/me/onboarding → 409 `USER_003` | 이미 온보딩 완료된 유저 재요청           | `error.code === "USER_003"`                      | Medium   |
| AUTH-01-001 | 토큰 없는 상태                              | PATCH /users/me/onboarding 요청          | 401 반환, login으로 redirect                     | High     |

### useMyProfile

| ID          | GIVEN                             | WHEN                  | THEN                                      | 우선순위 |
| ----------- | --------------------------------- | --------------------- | ----------------------------------------- | -------- |
| USER-04-001 | GET /users/me → 200 `UserProfile` | `useMyProfile()` 실행 | `data`가 `userProfileSchema`로 parse 성공 | High     |
| USER-05-001 | GET /users/me → 500               | `useMyProfile()` 실행 | `isError = true`                          | Medium   |
| USER-05-002 | 네트워크 단절                     | `useMyProfile()` 실행 | `isError = true`, 3회 retry 후 error 확정 | Medium   |

### useUpdateProfile

| ID          | GIVEN                 | WHEN                                          | THEN                                         | 우선순위 |
| ----------- | --------------------- | --------------------------------------------- | -------------------------------------------- | -------- |
| USER-03-001 | PATCH /users/me → 200 | `useUpdateProfile().mutate({name: "새이름"})` | onSuccess 콜백, `['me']` 쿼리 invalidate     | High     |
| USER-05-003 | PATCH /users/me → 401 | AT 만료 상태에서 요청                         | silent refresh 후 재시도 또는 login redirect | High     |

### useWithdraw

| ID          | GIVEN                             | WHEN                                      | THEN                                              | 우선순위 |
| ----------- | --------------------------------- | ----------------------------------------- | ------------------------------------------------- | -------- |
| USER-03-002 | DELETE /users/me → 200            | `useWithdraw().mutate({reason: "OTHER"})` | clearAuth() 호출, router.replace(`/(auth)/login`) | High     |
| USER-05-004 | DELETE /users/me → 403 `USER_004` | 이미 탈퇴한 계정 재요청                   | `error.code === "USER_004"`                       | Medium   |

### useRegions

| ID          | GIVEN                                | WHEN                | THEN                                              | 우선순위 |
| ----------- | ------------------------------------ | ------------------- | ------------------------------------------------- | -------- |
| USER-04-002 | GET /regions → 200 `Region[]`        | `useRegions()` 실행 | `data` 배열 각 항목이 `regionSchema`로 parse 성공 | Medium   |
| USER-04-003 | 두 번째 마운트 (staleTime: Infinity) | 컴포넌트 재마운트   | 네트워크 요청 발생 안 함 (캐시 사용)              | Medium   |

---

## Component Test Cases (UI 인터랙션)

### LoginView / LoginContainer

| ID          | GIVEN                              | WHEN                            | THEN                                              | 우선순위 |
| ----------- | ---------------------------------- | ------------------------------- | ------------------------------------------------- | -------- |
| AUTH-02-019 | LoginView 렌더                     | 이메일 미입력 후 제출 버튼 클릭 | "올바른 이메일 형식이 아닙니다" 텍스트 표시       | High     |
| AUTH-02-020 | LoginView 렌더                     | 비밀번호 7자 입력 후 제출       | "비밀번호는 최소 8자 이상" 텍스트 표시            | High     |
| AUTH-03-006 | isPending = true                   | 제출 중 상태                    | 로그인 버튼 `disabled`, 로딩 인디케이터 표시      | High     |
| AUTH-05-005 | serverError = `{code: "AUTH_001"}` | 에러 상태 렌더                  | "이메일 또는 비밀번호를 확인해주세요" 텍스트 표시 | High     |
| AUTH-04-001 | 로그인 성공 후                     | onSuccess                       | `/(app)` 라우트로 replace 호출 확인               | High     |

### SignupView / SignupContainer

| ID          | GIVEN                              | WHEN                    | THEN                                      | 우선순위 |
| ----------- | ---------------------------------- | ----------------------- | ----------------------------------------- | -------- |
| AUTH-02-021 | SignupView 렌더                    | 닉네임 1자 입력 후 제출 | "닉네임은 최소 2자 이상" 텍스트 표시      | High     |
| AUTH-05-006 | serverError = `{code: "USER_002"}` | 에러 상태 렌더          | "이미 사용 중인 이메일입니다" 텍스트 표시 | High     |

### OnboardingView / OnboardingContainer

| ID          | GIVEN                  | WHEN                          | THEN                                              | 우선순위 |
| ----------- | ---------------------- | ----------------------------- | ------------------------------------------------- | -------- |
| AUTH-01-002 | step = 1               | 뒤로가기 제스처 / 버튼        | 이전 화면으로 이동 불가 (replace로 진입했으므로)  | High     |
| AUTH-03-007 | 7단계 모두 입력 완료   | 완료 버튼 클릭                | `useOnboarding.mutate` 호출, 인자에 7개 필드 포함 | High     |
| AUTH-02-022 | step 진행 중           | 필수 항목 미선택 후 다음 클릭 | 다음 단계 진행 불가, 에러 표시                    | High     |
| AUTH-04-002 | onboarding mutate 성공 | onSuccess                     | `router.replace('/(app)')` 호출                   | High     |

### ProfileView / ProfileContainer

| ID          | GIVEN                       | WHEN                    | THEN                                          | 우선순위 |
| ----------- | --------------------------- | ----------------------- | --------------------------------------------- | -------- |
| USER-04-004 | `useMyProfile` loading 상태 | ProfileContainer 마운트 | Skeleton UI 표시                              | High     |
| USER-05-007 | `useMyProfile` error 상태   | ProfileContainer 마운트 | 에러 메시지 + 재시도 버튼 표시                | High     |
| USER-04-005 | `useMyProfile` data 있음    | ProfileContainer 마운트 | PlayerCard에 name·position·mannerScore 렌더   | High     |
| USER-04-006 | 프로필 수정 버튼 클릭       | 터치 이벤트             | `router.push('/(app)/profile/edit')` 호출     | Medium   |
| USER-03-003 | 로그아웃 버튼 클릭          | 터치 이벤트             | ConfirmDialog 표시 → 확인 시 clearAuth() 호출 | High     |

### WithdrawView / WithdrawContainer

| ID          | GIVEN                 | WHEN                              | THEN                                         | 우선순위 |
| ----------- | --------------------- | --------------------------------- | -------------------------------------------- | -------- |
| USER-02-001 | WithdrawView 렌더     | 탈퇴 사유 미선택 + 동의 없이 제출 | 버튼 disabled 상태 유지                      | High     |
| USER-02-002 | 사유 선택 + 동의 체크 | 탈퇴 버튼 클릭                    | `useWithdraw.mutate` 호출                    | High     |
| USER-04-007 | withdraw mutate 성공  | onSuccess                         | `clearAuth()` 호출 → `/(auth)/login` replace | High     |

### MannerBadge

| ID          | GIVEN             | WHEN | THEN                                    | 우선순위 |
| ----------- | ----------------- | ---- | --------------------------------------- | -------- |
| USER-04-008 | mannerScore = 100 | 렌더 | "100°C" 텍스트, 정상 색상(primary) 표시 | Medium   |
| USER-04-009 | mannerScore = 20  | 렌더 | "20°C" 텍스트, 경고 색상(error) 표시    | Medium   |
| USER-04-010 | mannerScore = 15  | 렌더 | "15°C" 텍스트, 이용 제한 배지 표시      | Medium   |

---

## E2E Test Cases (핵심 플로우)

| ID          | GIVEN                                | WHEN                         | THEN                                                         | 우선순위 |
| ----------- | ------------------------------------ | ---------------------------- | ------------------------------------------------------------ | -------- |
| AUTH-04-003 | 앱 최초 실행 (SecureStore 비어 있음) | 앱 실행                      | login 화면 표시                                              | High     |
| AUTH-04-004 | 유효한 이메일·비밀번호 입력          | 로그인 버튼 탭               | 온보딩 미완료 시 → `(auth)/onboarding` 진입                  | High     |
| AUTH-04-005 | 온보딩 7단계 순서대로 완료           | 완료 버튼 탭                 | 홈 화면 진입, 뒤로가기 시 온보딩으로 돌아가지 않음           | High     |
| AUTH-04-006 | 로그인 완료 후 앱 종료 → 재실행      | 앱 재실행                    | SecureStore RT 존재 → silent refresh → 홈 직접 진입          | High     |
| AUTH-04-007 | RT 만료 후 앱 재실행                 | 앱 재실행                    | silent refresh 실패 → login 화면 표시                        | High     |
| AUTH-04-008 | 로그인된 상태                        | 프로필 탭 탭                 | 내 프로필 카드·통계·매너 온도 표시                           | High     |
| USER-04-011 | 프로필 탭 → 프로필 수정 진입         | name 변경 후 저장            | 프로필 탭으로 돌아오면 변경된 이름 표시                      | Medium   |
| USER-04-012 | 프로필 탭 → 회원 탈퇴 진입           | 사유 선택 + 동의 → 탈퇴 확인 | login 화면으로 이동, 동일 이메일로 로그인 시 `USER_004` 에러 | High     |
| AUTH-04-009 | 탈퇴한 계정으로 로그인 시도          | 로그인 버튼 탭               | "탈퇴한 계정입니다" 에러 메시지 표시                         | High     |
| AUTH-05-008 | 로그인 성공 후 AT 강제 만료          | 프로필 API 호출              | Interceptor가 refresh 요청 → 새 AT로 재시도 성공             | High     |
| AUTH-05-009 | AT·RT 모두 만료                      | API 호출                     | clearAuth() → login 화면 replace                             | High     |
