# auth-user Plan

## 1. 기능 개요

- **목적**: 이메일/패스워드 기반 인증 + 사용자 프로필 관리 + 온보딩 + 회원 탈퇴 구현. 소셜 로그인 전환을 위한 확장 가능한 User 스키마 설계.
- **현재 구현 범위**: 로그인·회원가입 기본 골격 완성 (email+password, AT+RT SecureStore). 스키마 확장·온보딩·프로필 페이지 미구현.

### 핵심 사용자 시나리오

```
GIVEN 새 유저가 앱을 설치했을 때
WHEN 회원가입(이메일·비밀번호·닉네임) → 온보딩(포지션 등 7개 항목) 완료
THEN 홈 화면으로 진입, isOnboarded = true

GIVEN 앱을 종료했다가 재실행할 때
WHEN SecureStore에 RT가 존재
THEN 자동으로 silent refresh → 홈 진입 (자동 로그인)

GIVEN 로그인된 유저가 프로필 탭 진입
WHEN 본인 정보 조회
THEN FIFA 카드 스타일 프로필 + 경기 통계 + 매너 온도 표시

GIVEN 유저가 회원 탈퇴를 신청
WHEN 탈퇴 사유 선택 + 동의 → 확인
THEN PII 즉시 null 처리, deletedAt 기록, 경기 기록은 "탈퇴 사용자"로 익명화 유지
```

---

## 2. 클라이언트 라우트

| 경로 | 설명 | 내비게이션 타입 |
|---|---|---|
| `(auth)/login` | 로그인 | 이미 존재 |
| `(auth)/signup` | 회원가입 (이메일·비밀번호·닉네임) | 이미 존재 |
| `(auth)/onboarding` | 온보딩 Funnel (7개 항목 수집) | replace (뒤로 못 감) |
| `(app)/(tabs)/profile` | 내 프로필 탭 메인 | 탭 |
| `(app)/profile/edit` | 프로필 수정 | push |
| `(app)/profile/manner` | 매너 온도 상세 | push |
| `(app)/profile/withdraw` | 회원 탈퇴 | push |
| `(app)/profile/settings` | 설정 (로그아웃 포함) | push |

---

## 3. API 설계

| Method | Endpoint | 설명 | Auth |
|---|---|---|---|
| `POST` | `/api/v1/users` | 회원가입 | Public |
| `POST` | `/api/v1/sessions/login` | 로그인 | Public |
| `POST` | `/api/v1/sessions/refresh` | AT 갱신 | Public (RT) |
| `DELETE` | `/api/v1/sessions/logout` | 로그아웃 | Bearer AT |
| `PATCH` | `/api/v1/users/me/onboarding` | 온보딩 정보 저장 | Bearer AT |
| `GET` | `/api/v1/users/me` | 내 프로필 조회 | Bearer AT |
| `PATCH` | `/api/v1/users/me` | 프로필 수정 | Bearer AT |
| `DELETE` | `/api/v1/users/me` | 회원 탈퇴 (Soft Delete + PII 파기) | Bearer AT |
| `GET` | `/api/v1/regions` | 지역 목록 조회 | Public |

---

## 4. 데이터 레이어 설계 (client/src/features/auth/data/)

### Schemas (Zod)

**`auth.schema.ts`** — 기존 파일 확장

```ts
// 추가할 스키마
export const onboardingSchema = z.object({
  name: z.string().min(2).max(20),
  birthYear: z.number().int().min(1950).max(2010),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  position: z.enum(['FW', 'MF', 'DF', 'GK']),
  foot: z.enum(['LEFT', 'RIGHT', 'BOTH']),
  years: z.number().int().min(0).max(50),
  level: z.enum(['BEGINNER', 'AMATEUR', 'SEMI_PRO', 'PRO']),
  preferredRegionId: z.string().optional(),
});

// 업데이트할 스키마 (현재 userProfileSchema 교체)
export const userProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  birthYear: z.number().int(),
  gender: z.enum(['MALE', 'FEMALE']).nullable(),
  position: z.enum(['FW', 'MF', 'DF', 'GK']).nullable(),
  foot: z.enum(['LEFT', 'RIGHT', 'BOTH']).nullable(),
  years: z.number().int().nullable(),
  level: z.enum(['BEGINNER', 'AMATEUR', 'SEMI_PRO', 'PRO']).nullable(),
  preferredRegionId: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  mannerScore: z.number(),
  status: z.enum(['ACTIVE', 'RESTRICTED', 'DELETED']),
  isOnboarded: z.boolean(),
  provider: z.enum(['LOCAL', 'KAKAO', 'GOOGLE', 'APPLE']),
});

export const regionSchema = z.object({
  id: z.string(),
  name: z.string(),       // 시도
  sigungu: z.string(),    // 시군구
});
```

**`user.schema.ts`** — 신규 파일 (user 도메인 스키마 분리)

```ts
// 프로필 수정 스키마
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(20).optional(),
  position: z.enum(['FW', 'MF', 'DF', 'GK']).optional(),
  foot: z.enum(['LEFT', 'RIGHT', 'BOTH']).optional(),
  level: z.enum(['BEGINNER', 'AMATEUR', 'SEMI_PRO', 'PRO']).optional(),
  preferredRegionId: z.string().optional(),
});

export const withdrawSchema = z.object({
  reason: z.enum([
    'TIME_CONFLICT',
    'MOVING_TEAM',
    'QUITTING_SOCCER',
    'BAD_ATMOSPHERE',
    'OTHER',
  ]),
});
```

### Services

**`auth.service.ts`** — 기존 파일 (login, signup 유지)

**`user.service.ts`** — 신규 파일

```ts
// 함수 목록
getMyProfile(): Promise<UserProfile>
updateOnboarding(data: OnboardingInput): Promise<UserProfile>
updateProfile(data: UpdateProfileInput): Promise<UserProfile>
withdrawAccount(data: WithdrawInput): Promise<void>
getRegions(): Promise<Region[]>
```

### Hooks

| Hook | 종류 | 설명 |
|---|---|---|
| `useLogin` | useMutation | 기존 유지 |
| `useSignup` | useMutation | 기존 유지 |
| `useOnboarding` | useMutation | PATCH /users/me/onboarding |
| `useMyProfile` | useQuery | GET /users/me |
| `useUpdateProfile` | useMutation | PATCH /users/me |
| `useWithdraw` | useMutation | DELETE /users/me |
| `useRegions` | useQuery | GET /regions (staleTime: Infinity) |

---

## 5. UI 레이어 설계 (client/src/features/auth/ui/)

### Container

**`OnboardingContainer`** — `(auth)/onboarding` 에 마운트

- `useOnboarding` mutate 주입
- Funnel 상태 관리 (step: 1~7)
- 완료 시 `router.replace('/(app)')` 

**`ProfileContainer`** — `(app)/(tabs)/profile` 에 마운트

- `useMyProfile` 조회 → 4-state 분기 (loading / error / empty / data)
- 프로필 수정, 탈퇴, 로그아웃 핸들러 조립

**`ProfileEditContainer`** — `(app)/profile/edit` 에 마운트

- `useMyProfile` + `useUpdateProfile`
- react-hook-form + zodResolver

**`WithdrawContainer`** — `(app)/profile/withdraw` 에 마운트

- `useWithdraw` mutate
- 완료 시 `clearAuth()` → `router.replace('/(auth)/login')`

### View / Components

| 파일 | 설명 |
|---|---|
| `OnboardingView` | 7단계 Funnel UI — 각 단계별 입력 컴포넌트 |
| `ProfileView` | 프로필 탭 전체 레이아웃 (카드 + 통계 + 매너) |
| `ProfileEditView` | 수정 폼 |
| `MannerDetailView` | 매너 온도 항목별 상세 |
| `WithdrawView` | 탈퇴 사유 선택 + 동의 체크박스 |
| `components/PlayerCard` | FIFA 카드 스타일 선수 카드 |
| `components/MannerBadge` | 매너 온도 배지 (°C 표시) |
| `components/StatSummary` | 경기 수 / 골 / 어시스트 요약 |

---

## 6. 서버 레이어 설계

### Prisma Schema 변경 (`server/prisma/schema.prisma`)

**추가할 Enum**

```prisma
enum AuthProvider {
  LOCAL
  KAKAO
  GOOGLE
  APPLE
}

enum PlayerFoot {
  LEFT
  RIGHT
  BOTH
}

enum PlayerLevel {
  BEGINNER
  AMATEUR
  SEMI_PRO
  PRO
}

enum Gender {
  MALE
  FEMALE
}

enum UserStatus {
  ACTIVE
  RESTRICTED
  DELETED
}
```

**User 모델 확장** (현재 모델 교체)

```prisma
model User {
  id               String       @id @default(cuid())
  // 인증 (LOCAL 전용 — 소셜 전환 시 삭제)
  email            String?      @unique
  passwordHash     String?
  // 소셜 로그인 (현재는 null)
  provider         AuthProvider @default(LOCAL)
  providerId       String?
  // 프로필
  name             String
  birthYear        Int?
  gender           Gender?
  position         PlayerPosition?
  foot             PlayerFoot?
  years            Int?
  level            PlayerLevel?
  preferredRegionId String?
  avatarUrl        String?
  mannerScore      Float        @default(100)
  isOnboarded      Boolean      @default(false)
  // 계정 상태
  status           UserStatus   @default(ACTIVE)
  deletedAt        DateTime?
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  sessions         Session[]
  preferredRegion  Region?      @relation(fields: [preferredRegionId], references: [id])

  @@map("users")
}
```

**Region 모델 추가**

```prisma
model Region {
  id      String @id @default(cuid())
  name    String          // 시도 (서울특별시)
  sigungu String          // 시군구 (강남구)
  code    String @unique  // 행정구역 코드

  users   User[]

  @@map("regions")
}
```

### DTO

**`server/src/features/users/dto/`**

| 파일 | 용도 |
|---|---|
| `create-user.dto.ts` | 기존 유지 (email, password, nickname) |
| `onboarding.dto.ts` | 신규 — 온보딩 7개 항목 |
| `update-profile.dto.ts` | 확장 — name, position, foot, level, preferredRegionId |
| `withdraw.dto.ts` | 신규 — reason: WithdrawReason enum |
| `user-response.dto.ts` | 확장 — 전체 UserProfile 필드 반영 |

**`onboarding.dto.ts`**

```ts
export class OnboardingDto {
  @IsString() @MinLength(2) @MaxLength(20)  name: string;
  @IsInt() @Min(1950) @Max(2010)            birthYear: number;
  @IsOptional() @IsEnum(Gender)             gender?: Gender;
  @IsEnum(PlayerPosition)                   position: PlayerPosition;
  @IsEnum(PlayerFoot)                       foot: PlayerFoot;
  @IsInt() @Min(0) @Max(50)                 years: number;
  @IsEnum(PlayerLevel)                      level: PlayerLevel;
  @IsOptional() @IsString()                 preferredRegionId?: string;
}
```

### Service 메서드

**`UsersService`** 확장

```ts
// 기존 유지
create(dto: CreateUserDto): Promise<SignupResponseDto>
findById(id: string): Promise<UserProfileResponseDto | null>
findByEmailForAuth(email: string): Promise<User | null>

// 추가
saveOnboarding(id: string, dto: OnboardingDto): Promise<UserProfileResponseDto>
updateProfile(id: string, dto: UpdateProfileDto): Promise<UserProfileResponseDto>
withdraw(id: string, dto: WithdrawDto): Promise<void>
  // → deletedAt = now(), status = DELETED
  // → name = null, email = null, passwordHash = null, avatarUrl = null (PII 파기)
```

**`RegionsService`** (신규 모듈)

```ts
findAll(): Promise<Region[]>   // seed 데이터, 캐싱 권장
```

### Controller 엔드포인트

**`UsersController`** 확장

```ts
@Public()  @Post()                          signup(dto)
           @Get('me')                        getMe(user)
           @Patch('me/onboarding')           saveOnboarding(user, dto)  // ← 신규
           @Patch('me')                      updateProfile(user, dto)
           @Delete('me')                     withdraw(user, dto)        // ← 신규
```

**`RegionsController`** (신규)

```ts
@Public()  @Get()   findAll()   // GET /api/v1/regions
```

---

## 7. 예외 처리

### 서버 에러 코드 추가

| 코드 | 설명 | HTTP |
|---|---|---|
| `USER_001` | 존재하지 않는 유저 | 404 |
| `USER_002` | 이미 사용 중인 이메일 | 409 |
| `USER_003` | 이미 온보딩 완료된 계정 | 409 |
| `USER_004` | 탈퇴한 계정 | 403 |
| `USER_005` | 이용 제한 계정 (mannerScore ≤ 20) | 403 |
| `AUTH_001` | 이메일 또는 비밀번호 불일치 | 401 |
| `AUTH_002` | 유효하지 않은 토큰 | 401 |
| `AUTH_003` | 만료된 RT — 재로그인 필요 | 401 |
| `REGION_001` | 존재하지 않는 지역 ID | 404 |

### 클라이언트 처리

| 시나리오 | 처리 |
|---|---|
| 로그인 실패 (AUTH_001) | 폼 아래 "이메일 또는 비밀번호를 확인해주세요" |
| 이메일 중복 (USER_002) | 회원가입 폼에 인라인 에러 |
| AT 만료 → silent refresh 실패 | clearAuth() → login 화면으로 replace |
| 탈퇴 계정 로그인 시도 (USER_004) | "탈퇴한 계정입니다" 알림 |
| 이용 제한 계정 (USER_005) | "매너 온도가 너무 낮아 이용이 제한됩니다" |
| 온보딩 미완료 상태에서 앱 접근 | `(auth)/onboarding` 으로 redirect |

---

## 8. 구현 체크리스트

### Schema / DB

- [ ] Prisma schema에 신규 Enum 추가 (AuthProvider, PlayerFoot, PlayerLevel, Gender, UserStatus)
- [ ] User 모델 필드 확장 (name, birthYear, gender, foot, years, level, preferredRegionId, mannerScore, isOnboarded, status, deletedAt, provider, providerId)
- [ ] Region 모델 추가
- [ ] `prisma migrate dev` 실행
- [ ] `prisma/seed.ts` — 행정구역 데이터 시딩 스크립트 작성
- [ ] `/erd` 커맨드로 ERD 갱신

### Server

- [ ] 신규 Enum을 `@prisma/client`에서 import하여 DTO에 적용
- [ ] `onboarding.dto.ts` 작성
- [ ] `withdraw.dto.ts` 작성
- [ ] `user-response.dto.ts` 확장 (전체 프로필 필드)
- [ ] `UsersService.saveOnboarding()` 구현 (중복 온보딩 방지 포함)
- [ ] `UsersService.withdraw()` 구현 (Soft Delete + PII null 처리)
- [ ] `UsersController`에 `PATCH me/onboarding`, `DELETE me` 엔드포인트 추가
- [ ] `RegionsModule` / `RegionsService` / `RegionsController` 생성
- [ ] 에러 코드 상수 (`error-codes.ts`)에 신규 코드 추가
- [ ] 로그인 Guard에서 `deletedAt`, `status` 체크 추가
- [ ] `findByEmailForAuth`에서 디버그용 `findMany` 코드 제거

### Client — Data Layer

- [ ] `auth.schema.ts`에 `onboardingSchema`, 업데이트된 `userProfileSchema`, `regionSchema` 추가
- [ ] `user.schema.ts` 신규 파일 생성 (`updateProfileSchema`, `withdrawSchema`)
- [ ] `user.service.ts` 신규 파일 생성
- [ ] `useOnboarding` hook 작성
- [ ] `useMyProfile` hook 작성
- [ ] `useUpdateProfile` hook 작성
- [ ] `useWithdraw` hook 작성
- [ ] `useRegions` hook 작성 (staleTime: Infinity)

### Client — UI Layer

- [ ] `OnboardingView` + `OnboardingContainer` 작성
- [ ] `(auth)/onboarding` 라우트 파일 생성
- [ ] `_layout.tsx`에서 `isOnboarded` 체크 → onboarding redirect 로직 추가
- [ ] `ProfileView` + `ProfileContainer` 작성
- [ ] `ProfileEditView` + `ProfileEditContainer` 작성
- [ ] `WithdrawView` + `WithdrawContainer` 작성
- [ ] `MannerDetailView` 작성
- [ ] `components/PlayerCard` 컴포넌트 작성
- [ ] `components/MannerBadge` 컴포넌트 작성
- [ ] `(app)/(tabs)/profile` 라우트 파일 생성
- [ ] `(app)/profile/edit`, `(app)/profile/withdraw`, `(app)/profile/manner` 라우트 파일 생성
