# FC Flow — Claude 세션 가이드

## 프로젝트 개요

아마추어 축구팀 올인원 관리 앱. 팀 생성/가입, 경기 일정, 투표, 경기 기록 등을 제공한다.
모노레포 구조: `client/` (React Native) + `server/` (NestJS)

---

## 기술 스택

### Client (`client/`)

| 항목            | 기술                                         |
| --------------- | -------------------------------------------- |
| 프레임워크      | React Native 0.83 + Expo SDK 55              |
| 라우터          | expo-router (파일 기반)                      |
| 서버 상태       | TanStack Query v5                            |
| 클라이언트 상태 | Zustand v5                                   |
| 폼              | react-hook-form + Zod v4                     |
| HTTP            | Axios                                        |
| 스타일          | 디자인 시스템 (`@ui`) — 인라인 스타일링 금지 |

### Server (`server/`)

| 항목       | 기술                                               |
| ---------- | -------------------------------------------------- |
| 프레임워크 | NestJS v10                                         |
| ORM        | Prisma v6 + PostgreSQL                             |
| 인증       | JWT (passport-jwt) — 액세스(메모리) + 리프레시(DB) |
| 검증       | class-validator + class-transformer                |
| 문서       | Swagger (`@nestjs/swagger`)                        |

---

## 디렉토리 구조

```
soccer-team-app/
├── client/
│   ├── app/
│   │   ├── (app)/          # 인증 필요 화면
│   │   ├── (auth)/         # 로그인·회원가입
│   │   └── (dev)/          # 개발용 (디자인 시스템 뷰어)
│   └── src/
│       ├── features/
│       │   └── {domain}/
│       │       ├── ui/
│       │       │   ├── container/   # 데이터 주입, 핸들러 조립
│       │       │   ├── view/        # 레이아웃, 4-state 분기
│       │       │   └── components/  # 도메인 전용 소형 UI
│       │       └── data/
│       │           ├── hooks/       # useQuery / useMutation
│       │           ├── schemas/     # Zod 스키마 + 타입
│       │           └── services/    # 순수 API 호출 함수
│       └── shared/
│           ├── ui/                  # 디자인 시스템 (@ui 앨리어스)
│           ├── store/               # Zustand 전역 상태
│           ├── http/                # Axios 인스턴스
│           ├── query/               # QueryClient 설정
│           └── constants/           # 공통 상수
├── server/
│   └── src/
│       ├── features/
│       │   └── {domain}/
│       │       ├── dto/
│       │       ├── {domain}.module.ts
│       │       ├── {domain}.service.ts
│       │       └── {domain}.controller.ts
│       └── common/
│           ├── filters/       # GlobalExceptionFilter
│           ├── guards/        # AuthGuard, RolesGuard
│           ├── interceptors/  # LoggingInterceptor
│           └── decorators/    # 커스텀 데코레이터
├── docs/
│   ├── erd.md                 # Prisma 스키마 기반 ERD (항상 최신 유지)
│   ├── 04_screen_design.md    # 디자인 시스템 가이드
│   ├── plans/                 # /plan, /case 에이전트 출력물
│   └── client-docs/ server-docs/  # 컨벤션·가이드 문서
└── .claude/commands/          # 커스텀 슬래시 커맨드
```

---

## 핵심 규칙 (위반 금지)

### 클라이언트

```
❌ <Text>          →  ✅ <TextBox variant="body2" color={colors.grey700}>
❌ import from '../../ui'  →  ✅ import { Button, TextBox } from '@ui'
❌ padding: 16     →  ✅ padding: spacing[4]
❌ color: '#3182f6'  →  ✅ color: colors.primary
❌ ...typography.body2  →  ✅ <TextBox variant="body2">
❌ <Image>         →  ✅ <DfImage> / <ThumbnailImage> / <AvatarImage>
❌ fetch() in component  →  ✅ data/services/ → hooks → container
❌ Hook in service  →  ✅ service는 순수 TypeScript 함수
```

### 서버

```
❌ 날 쿼리에 사용자 입력 삽입  →  ✅ Prisma 파라미터 바인딩
❌ DTO 없는 엔드포인트     →  ✅ class-validator 데코레이터 필수
❌ ValidationPipe 미적용    →  ✅ whitelist: true, forbidNonWhitelisted: true
❌ 인증 Guard 누락           →  ✅ @UseGuards(AuthGuard)
```

---

## 전역 상태

```ts
// 인증 (client/src/shared/store/useAuthStore.ts)
useAuthStore → { accessToken, isHydrated, setAccessToken, clearAuth, hydrate }

// 네트워크 (client/src/shared/store/useNetworkStore.ts)
useNetworkStore → { isConnected, isInternetReachable, isOffline }
// initNetworkListener() → _layout.tsx 에서 앱 시작 시 1회 호출
// onlineManager(React Query)와 자동 연동됨
```

---

## 디자인 시스템 (`@ui`)

상세 내용: `docs/04_screen_design.md`

```ts
// 토큰
colors.primary / colors.error / colors.grey900 / colors.background ...
spacing[1]=4px / spacing[4]=16px / spacing[6]=24px ...
typography: heading1~3 / body1~body2Bold / caption~captionBold / label

// 주요 컴포넌트
TextBox, Button, TextField, TextArea, Select
Checkbox, Switch, ListRow, DfImage, AvatarImage, ThumbnailImage, CoverImage
Flex, Box, Grid, Spacing, SafeAreaWrapper
BottomCTASingle, BottomCTADouble, FixedBottomCTA
Skeleton, Modal, Drawer, AlertDialog, ConfirmDialog
ToastProvider, useToast
```

디자인 시스템 라이브 뷰: 앱 실행 → 홈 → `🎨 Design System`

---

## 개발 플로우

새 기능 추가 시 **반드시 이 순서**로 진행한다.

```
1. /plan {feature}     → 기능 설계 (docs/plans/{feature}.plan.md)
2. /case {feature}     → 테스트케이스 정의 (docs/plans/{feature}.cases.md)
3. /logic {feature}    → Data Layer + Server 구현
4. /ui {feature}       → UI Layer 구현
5. /test {feature}     → 테스트 코드 작성
6. /refactor {feature} → 코드 품질 점검 + ERD 동기화
7. /performance {feature} → 성능 최적화
8. /security {feature} → 보안 점검
```

**한 번에 전체 실행**: `/feature {feature}`

**ERD만 갱신**: `/erd` (Prisma 스키마 변경 후 즉시 실행)

---

## 스캐폴딩

```bash
# 클라이언트 feature 폴더 자동 생성
cd client && npm run feature {name}

# 서버 NestJS 모듈 생성
cd server
nest g module features/{name}
nest g service features/{name}
nest g controller features/{name}
```

---

## 주요 파일 위치

| 목적                 | 경로                                                    |
| -------------------- | ------------------------------------------------------- |
| 라우트 진입점        | `client/app/_layout.tsx`                                |
| HTTP 클라이언트      | `client/src/shared/http/createApiClient.ts`             |
| QueryClient 설정     | `client/src/shared/query/createQueryClient.ts`          |
| Prisma 스키마        | `server/prisma/schema.prisma`                           |
| ERD 문서             | `docs/erd.md`                                           |
| 디자인 시스템 가이드 | `docs/04_screen_design.md`                              |
| 에러 코드 표준       | `docs/server-docs/conventions/error_handling_filter.md` |
| Git 컨벤션           | `docs/client-docs/conventions/git_convention.md`        |

---

## 참고 문서 빠른 색인

| 궁금한 것               | 문서                                                   |
| ----------------------- | ------------------------------------------------------ |
| 컴포넌트 API / 토큰     | `docs/04_screen_design.md`                             |
| 레이어 책임 / 금지 규칙 | `docs/client-docs/conventions/code.md`                 |
| API 레이어 구조         | `docs/client-docs/conventions/api.md`                  |
| 테스트 전략·패턴        | `docs/client-docs/guides/testing_guide.md`             |
| 성능 최적화             | `docs/client-docs/guides/performance_guide.md`         |
| 보안 수칙               | `docs/client-docs/security/security.md`                |
| NestJS 아키텍처         | `docs/server-docs/architecture/server_architecture.md` |
| Prisma 쿼리 전략        | `docs/server-docs/conventions/database_prisma.md`      |
| REST API 표준           | `docs/server-docs/conventions/api_standard.md`         |
| 서버 보안               | `docs/server-docs/security/server_security.md`         |
