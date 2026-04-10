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
3. 개발자가 이 데이터를 어떻게 요리해서 기능을 검증해야 하는지 레시피 `docs/plans/$ARGUMENTS/$ARGUMENTS.test.md`까지 작성해줘야 해

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
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

// ─── 테스트 계정 정의 (테스트 로그인 페이지에서 사용) ─────────────────────
export const TEST_ACCOUNTS = [
  {
    label: "마무리FC 주장",
    email: "captain@mamurifc.test",
    password: "test1234",
    role: "CAPTAIN",
    clubName: "마무리FC",
  },
  {
    label: "마무리FC 일반 멤버",
    email: "member@mamurifc.test",
    password: "test1234",
    role: "MEMBER",
    clubName: "마무리FC",
  },
  {
    label: "카동FC 주장",
    email: "captain@kadongfc.test",
    password: "test1234",
    role: "CAPTAIN",
    clubName: "카동FC",
  },
  {
    label: "클럽 미소속 유저",
    email: "newbie@test.com",
    password: "test1234",
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
  console.log("✅ $ARGUMENTS seed 완료");
}

main()
  .catch((e) => {
    console.error("❌ seed 실패:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
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

## Step 6. 테스트 수행 가이드 파일 작성

- 모든 데이터 생성이 완료되면, `docs/plans/$ARGUMENTS/$ARGUMENTS.test.md` 파일을 생성하여 개발자가 시드 데이터를 활용해 **수동 테스트(QA)**를 수행할 수 있는 구체적인 가이드를 제공한다.

---

## 📋 작성 규칙

- **준비물**: 테스트에 필요한 계정(Email)과 해당 계정의 초기 상태(기존 클럽 소속 여부 등)를 명시합니다.
- **테스트 플로우**: 사용자가 앱에서 수행해야 할 동작을 Step-by-Step으로 기술합니다.
- **체크포인트**: 각 단계에서 확인해야 할 **기대 결과(UI 변경, 토스트 메시지, 데이터 반영 등)**를 명시합니다.
- **케이스 매핑**: `$ARGUMENTS.cases.md`에 정의된 테스트케이스 ID를 제목 옆에 기재하여 추적성을 확보합니다.

---

## 📄 작성 예시: club.test.md

# 클럽 관리 기능 테스트 가이드

---

## 🚩 시나리오 1: 클럽 생성 및 초기 설정

**[CASE ID: CLUB-04-001]**

### 준비물

- 클럽 미소속 유저(`newbie@test.com`) 계정

### 테스트 순서

1. **로그인**: `newbie@test.com` 계정으로 로그인합니다.
2. **화면 이동**: 하단 탭 바에서 `[클럽]` 메뉴를 클릭합니다.
3. **작동**: 화면 중앙의 `'내 클럽 만들기'` 버튼을 클릭합니다.
4. **입력**
   - 클럽명: `"FC 개발왕"`
   - 지역: `"서울"`
   - 최대 인원: `"20명"`
5. **제출**: 하단 `'생성하기'` 버튼을 클릭합니다.

### 체크포인트

- [ ] `"클럽이 성공적으로 생성되었습니다"` 토스트 메시지가 노출되는가?
- [ ] 생성 직후 해당 클럽의 **'관리자 대시보드'**로 자동 이동하는가?
- [ ] 내 역할이 **'CAPTAIN'**으로 표시되는가?

---

## 🚩 시나리오 2: 초대 코드를 통한 가입 신청 및 승인

**[CASE ID: CLUB-03-005]**

### 준비물

- 마무리FC 주장(`captain@mamurifc.test`)
- 클럽 미소속 유저(`newbie@test.com`)

### 테스트 순서

1. **코드 발급**:  
   `'마무리FC 주장'`으로 로그인하여 `[설정 > 초대 코드 생성]` 메뉴에서 코드(`ABC123`)를 발급받습니다.

2. **계정 전환**:  
   로그아웃 후 `'클럽 미소속 유저'`로 재로그인합니다.

3. **가입 신청**:  
   `[클럽 찾기 > 초대 코드 입력]` 창에 `ABC123`을 입력하고 `'가입 신청'`을 누릅니다.

4. **승인 절차**:  
   다시 `'마무리FC 주장'`으로 로그인하여 **[가입 신청 목록]**으로 이동합니다.

5. **최종 승인**:  
   신청자 명단에서 `'클럽 미소속 유저'`를 확인하고 `'수락'` 버튼을 누릅니다.

### 체크포인트

- [ ] 가입 신청 시 `"신청이 완료되었습니다"` 메시지가 표시되는가?
- [ ] 주장이 수락한 후, 해당 유저가 `'팀원 목록'`에 정상적으로 정렬되는가?

---

## 🚩 시나리오 3: 유효성 검사 및 권한 제한 (Edge Case)

**[CASE ID: CLUB-02-001, CLUB-01-002]**

### 테스트 항목 1: 중복 체크

- **동작**: 이미 존재하는 클럽명(`마무리FC`)으로 새 클럽 생성을 시도합니다.
- **결과**: `"이미 사용 중인 클럽명입니다"`라는 인라인 에러 메시지가 즉시 표시되어야 합니다.

---

### 테스트 항목 2: 권한 제한

#### 준비물

- 마무리FC 일반 멤버(`member@mamurifc.test`)

#### 동작

- 클럽 탭 진입 후 설정 메뉴를 확인합니다.

#### 결과

- `'가입 신청 관리'`, `'클럽 정보 수정'` 등 운영진 전용 버튼이 노출되지 않아야 합니다.

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
