# 코드 스타일 및 개발 원칙

이 문서는 **FC Flow** 프로젝트의 모든 구성원이 동일한 철학으로 고품질의 코드를 작성하기 위해 반드시 준수해야 할 표준 가이드입니다.

---

## 1️⃣ 핵심 원칙: 관심사 분리 (Separation of Concerns)

모든 레이어는 **자신의 역할 외의 일을 절대 수행하지 않습니다.**

### ✅ 레이어별 책임 정의

| **분류** | **레이어** | **책임** | **도구** |
| --- | --- | --- | --- |
| **Data** | **Schema** | 데이터 구조 정의 및 **런타임 검증** | Zod |
|  | **Service** | 순수 네트워크 통신 (React/Hook 사용 금지) | Axios (`http`) |
|  | **Hooks** | 서버 상태 관리(Query) 및 비즈니스 로직(Logic) | TanStack Query |
| **UI** | **Container** | 비즈니스 로직 조립 및 View에 데이터 주입 | React Component |
|  | **View** | 전체 페이지 레이아웃 및 스크린 단위 UI | React Component |
|  | **Components** | 해당 기능에서만 사용되는 작은 단위 UI | React Component |

---

## 2️⃣ 디렉토리 구조 (Feature-based)

기능별로 폴더를 구성하며, **UI(화면)**와 **Data(로직)**를 명확히 분리하여 관리합니다.

```tsx
src/features/{domain}/
├── ui/                 # 화면에 그려지는 요소 (View 중심)
│   ├── container/      # 데이터 주입 및 비즈니스 로직 조립
│   ├── view/           # 스크린 단위 레이아웃
│   └── components/     # 도메인 전용 하위 컴포넌트
└── data/               # 데이터 및 상태 관리 (Logic 중심)
    ├── hooks/          # useQuery, useMutation 및 커스텀 로직
    ├── schemas/        # Zod 스키마 및 추출 타입
    └── services/       # 순수 API 호출 함수 (Pure TS)
```

---

## 3️⃣ 클린 코드 및 주석 규칙

### 🏷️ 네이밍 (Meaningful Name)

- **의미 있는 이름**: 단순히 데이터를 담는 그릇이 아니라, **"이 변수가 왜 존재하는지"**를 이름으로 나타냅니다.
- **변수/함수**: `camelCase`를 사용합니다.
- **Boolean**: `is`, `has`, `should` 등의 접두사를 사용합니다. (예: `isLoading`, `hasPermission`)

### 💡 한 눈에 읽기 쉬운 코드 (설명용 변수 및 추상화)

복잡한 조건문이나 계산식은 **설명용 변수(Explaining Variable)**를 도입하여 로직을 추상화합니다.

- **How(어떻게)** 보다는 **What(무엇)**에 집중하여 의도가 한 번에 읽히도록 합니다.

```tsx
// ✅ 변경 전 (동작은 하지만 세부 구현을 읽어야 함)
if (!teams || teams.length === 0) return <NoTeamView />;

// ✅ 변경 후 (설명용 변수를 통한 의도 명확화)
const isEmptyTeams = !teams || teams.length === 0;
if (isEmptyTeams) return <NoTeamView />;
```

### 🚫 하드코딩 금지

매직 넘버나 문자열은 반드시 **의미 있는 상수**로 추출합니다.

- **상수 파일 관리**: 반복되는 UI나 비즈니스 규칙은 상수 파일 또는 훅/유틸로 추출합니다.

```tsx
const TOAST_DURATION_MS = 3_000;
const ROLES = { TEAM_LEAD: 'TEAM_LEAD', REVIEWER: 'REVIEWER' } as const;

if (user.role === ROLES.TEAM_LEAD) { ... }
setTimeout(() => { ... }, TOAST_DURATION_MS);
```

### 🛡️ 예측 가능한 코드

- **단일 책임**: 함수는 반드시 하나의 일만 수행합니다.
- **부작용 제어**: Side Effect는 반드시 훅(`useEffect` 등) 내부에서 관리합니다.
- **Early Return 패턴**: 조건부 렌더링이나 복잡한 로직은 Early Return을 우선하여 가독성을 높입니다.

```tsx
function LoanRow({ application }: Props) {
  if (application.status === 'cancelled') return null;
  if (!application.reviewerId) return <PendingRow />;
  return <ReviewedRow application={application} />;
}
```

---

## 4️⃣ 주석 및 절대 금지 규칙

### 💬 JSDoc 주석 표준

모든 공통 컴포넌트와 주요 비즈니스 로직 함수에는 JSDoc 주석을 필수적으로 작성합니다.

```tsx
/**
 * 사용자 프로필을 보여주는 공통 UI 컴포넌트입니다.
 * @param {string} name - 사용자의 이름
 * @returns {JSX.Element} 재사용 가능한 프로필 컴포넌트
 */
```

### ❌ 절대 금지 규칙 (MUST FOLLOW)

1. **컴포넌트 내 직접 fetch 금지**: API 호출은 반드시 `data/services/` 레이어를 경유합니다.
2. **Service 내 Hook 사용 금지**: Service는 React와 무관한 **순수 TypeScript 함수**여야 합니다.
3. **Zod 검증 필수**: 모든 서버 응답은 Schema 검증을 통해 런타임 안정성을 확보합니다.
4. **View 내 상태 로직 금지**: View는 전달받은 props를 렌더링하는 역할에만 집중합니다.

---

## 5️⃣ 구현 체크리스트

- [ ]  `data/schemas/`에 Zod 검증 로직이 포함되었는가?
- [ ]  `data/services/`가 순수 함수로 작성되었는가?
- [ ]  `ui/container/`에서 로딩, 에러, 빈 데이터(Empty) 분기를 처리했는가?
- [ ]  컴포넌트와 주요 함수에 **JSDoc 주석**을 달았는가?
- [ ]  설명용 변수를 사용하여 조건문의 가독성을 높였는가?
