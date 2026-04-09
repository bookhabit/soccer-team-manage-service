# @seed — Test Seed Agent

기능명: **$ARGUMENTS**

아래 문서들을 읽고 `$ARGUMENTS` 기능의 테스트 데이터를 생성한다.

## 참조 문서 (반드시 읽을 것)
- `docs/plans/$ARGUMENTS/$ARGUMENTS.plan.md` — 구현 명세 (API, 데이터 모델, 시나리오)
- `docs/plans/$ARGUMENTS/$ARGUMENTS.cases.md` — 테스트케이스 (어떤 상태를 검증해야 하는지)
- `server/prisma/schema.prisma` — 현재 데이터 모델
- `server/prisma/seed.ts` — 기존 seed 구조 참조

---

## 역할

기능 구현 후 개발자가 **직접 앱을 실행하며 검증**할 수 있도록:
1. **서버 Seed 데이터**를 생성한다 (`server/prisma/seeds/$ARGUMENTS.seed.ts`)
2. **클라이언트 테스트 로그인 페이지**를 생성/업데이트한다 (`client/app/(dev)/test-login.tsx`)

---

## Step 1. 기본 공통 데이터 확인

`server/prisma/seed.ts` 를 읽어 기존에 시딩된 데이터를 파악한다.
이미 존재하는 유저/클럽이 있으면 중복 생성하지 않는다 (`upsert` 사용).

---

## Step 2. Seed 데이터 설계

`$ARGUMENTS.plan.md` 와 `$ARGUMENTS.cases.md` 를 읽고 **아래 기준**으로 시드 데이터를 설계한다.

### 필수 포함 항목

**유저 (최소 5명, 기능에 따라 추가)**
- 클럽 미소속 유저 (신규 가입 시나리오 검증용)
- 클럽 주장 (CAPTAIN) 유저 — 관리자 권한 동작 검증용
- 클럽 부주장 (VICE_CAPTAIN) 유저
- 클럽 일반 멤버 (MEMBER) 유저 최소 2명

**클럽 (최소 2개)**
- 클럽 A ("마무리FC"): 멤버 충분히 구성된 정상 클럽
- 클럽 B ("카동FC"): 비교 검증용 클럽
- 기능에 따라 추가 (예: 모집 마감 클럽, 해산 직전 클럽 등)

**기능 전용 데이터**
- `$ARGUMENTS.cases.md` 의 각 테스트케이스 시나리오를 커버하는 데이터 생성
- 경계값 데이터 포함 (최대/최소/빈 상태 등)

---

## Step 3. Seed 파일 작성

`server/prisma/seeds/$ARGUMENTS.seed.ts` 파일을 아래 구조로 생성한다.

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─── 테스트 계정 정의 (테스트 로그인 페이지에서 사용) ─────────────────────
export const TEST_ACCOUNTS = [
  {
    label: '마무리FC 주장',
    email: 'captain@mamurifc.test',
    password: 'test1234',
    role: 'CAPTAIN',
    clubName: '마무리FC',
  },
  {
    label: '마무리FC 일반 멤버',
    email: 'member@mamurifc.test',
    password: 'test1234',
    role: 'MEMBER',
    clubName: '마무리FC',
  },
  {
    label: '카동FC 주장',
    email: 'captain@kadongfc.test',
    password: 'test1234',
    role: 'CAPTAIN',
    clubName: '카동FC',
  },
  {
    label: '클럽 미소속 유저',
    email: 'newbie@test.com',
    password: 'test1234',
    role: null,
    clubName: null,
  },
  // 기능에 따라 추가
] as const;

async function seed$ARGUMENTS() {
  // upsert 기반으로 작성 — 중복 실행 안전
}

async function main() {
  await seed$ARGUMENTS();
  console.log('✅ $ARGUMENTS seed 완료');
}

main()
  .catch((e) => { console.error('❌ seed 실패:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
```

**규칙:**
- 모든 삽입은 `upsert` 사용 (중복 실행 시 안전)
- 비밀번호는 `bcrypt.hash('test1234', 10)` 고정
- 각 데이터 블록 상단에 `// [역할 설명]` 주석 작성
- `TEST_ACCOUNTS` 배열을 export 해야 함 (Step 4에서 import)

---

## Step 4. 테스트 로그인 페이지 생성/업데이트

`client/app/(dev)/test-login.tsx` 파일을 생성하거나 기존 파일에 **새 계정 버튼을 추가**한다.

```
화면 구성:
┌──────────────────────────────┐
│  🧪 테스트 로그인              │
│  (개발 환경 전용)              │
├──────────────────────────────┤
│  ── $ARGUMENTS 기능 테스트 ── │
│                               │
│  [마무리FC 주장으로 로그인]     │
│  [마무리FC 일반 멤버로 로그인]  │
│  [카동FC 주장으로 로그인]      │
│  [클럽 미소속 유저로 로그인]    │
│  ...기능별 추가 계정...        │
├──────────────────────────────┤
│  ── 기존 기능 계정 ──          │
│  (이전 seed에서 추가된 버튼들) │
└──────────────────────────────┘
```

**구현 기준:**
- `@ui` 컴포넌트 사용 (Button, TextBox, Flex, SafeAreaWrapper 등)
- 버튼 클릭 시 해당 계정으로 자동 로그인 후 홈으로 이동
- 로그인 API: `POST /auth/login` (email + password)
- 로그인 성공 시 `useAuthStore.setAccessToken()` 호출
- 섹션별로 기능명 헤더로 그룹핑
- 기존 버튼은 유지하고 새 섹션만 추가

---

## Step 5. package.json 스크립트 확인

`server/package.json` 을 읽어 seed 실행 스크립트가 있는지 확인한다.
없으면 아래를 추가한다:

```json
"seed:$ARGUMENTS": "ts-node prisma/seeds/$ARGUMENTS.seed.ts"
```

---

## 완료 출력 형식

```
## ✅ Seed 완료: $ARGUMENTS

### 생성된 파일
- server/prisma/seeds/$ARGUMENTS.seed.ts
- client/app/(dev)/test-login.tsx (업데이트)

### 생성된 테스트 데이터
| 계정 라벨 | 이메일 | 역할 | 클럽 |
|---|---|---|---|
| 마무리FC 주장 | captain@mamurifc.test | CAPTAIN | 마무리FC |
| ... | ... | ... | ... |

### 실행 방법
cd server && npm run seed:$ARGUMENTS

### 테스트 로그인
앱 실행 → 홈 → 개발 메뉴 → 테스트 로그인
```
