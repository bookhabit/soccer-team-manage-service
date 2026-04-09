# 04. API 컨벤션 및 에러 핸들링 규칙

데이터 통신 및 예외 처리 표준을 정의합니다. 모든 API 연동 및 비동기 UI 구현 시 이 규칙을 준수해야 합니다.

---

## 1️⃣ 아키텍처 개요

서비스의 데이터 흐름은 다음과 같은 레이어 분리 원칙을 따릅니다.

- **HTTP Layer**: Axios 인스턴스 관리 및 토큰 자동 갱신(Refresh)
- **Service Layer**: 순수 함수 기반의 API 호출 및 **Zod를 이용한 런타임 검증**
- **Data Hook Layer**: TanStack Query(`useQuery`, `useMutation`)를 이용한 서버 상태 관리
- **Boundary Layer**: `Suspense`와 `ErrorBoundary`를 이용한 선언적 로딩/에러 처리

---

## 2️⃣ HTTP Layer (Axios 설정)

`privateApi` 인스턴스를 통해 인증이 필요한 요청을 처리하며, 401 에러 발생 시 토큰 갱신 로직을 자동으로 수행합니다.

- **publicApi**: 토큰 없이 호출 (로그인, 회원가입, Refresh 전용)
- **privateApi**: `Authorization: Bearer` 헤더 자동 주입 및 401 발생 시 재시도 로직 포함

---

## 3️⃣ Service & Schema (Zod 필수)

모든 API 응답은 TypeScript 타입만 정의하는 것이 아니라, **Zod 스키마로 런타임 검증**을 수행하여 서버와의 계약을 보장합니다.

```tsx
// 예시: features/matches/services/match.service.ts
export const matchService = {
  getList: async (filters: MatchFilters): Promise<Match[]> => {
    const data = await http.get("/matches", filters);
    return matchListSchema.parse(data); // 런타임 검증 및 타입 추론
  },
  create: async (input: CreateMatchInput): Promise<Match> => {
    const data = await http.post("/matches", input);
    return matchSchema.parse(data);
  },
};
```

---

## 4️⃣ 비동기 상태 핸들링 (4-State 규칙)

모든 비동기 UI는 **에러 → 로딩 → 빈 데이터 → 정상 데이터**의 4가지 상태를 반드시 처리해야 합니다.

### 4.1 선언적 처리 (Suspense + ErrorBoundary)

페이지 단위나 주요 기능 단위에서는 `throwOnError: true` 설정을 통해 선언적으로 처리합니다.

- **Global Boundary**: 앱 전체 크래시 방지 최후 보루 (`GlobalErrorFallback`)
- **Page Boundary**: `PageAsyncBoundary`를 통한 페이지 레벨 로딩/에러 안전망
- **Component Boundary**: 헤더/탭바를 유지한 채 데이터 영역만 교체하는 상세 처리

### 4.2 Empty 상태 처리

데이터 로딩은 성공했으나 배열이 비어있는 경우 `EmptyBoundary`를 사용하여 처리합니다.

```tsx
<QueryErrorBoundary fallback={<JobListErrorView />}>
  <Suspense fallback={<JobListLoadingView />}>
    <JobListContainer>
      <EmptyBoundary data={items} fallback={<JobListEmptyView />}>
        <JobListView items={items} />
      </EmptyBoundary>
    </JobListContainer>
  </Suspense>
</QueryErrorBoundary>
```

### 4.3 비동기 상태 핸들링 — 금지 패턴 vs 권장 패턴

#### ❌ 금지: View 내부에서 상태 분기

View 컴포넌트는 렌더링만 담당한다. 로딩·에러·빈 상태 분기를 View 내부에 작성하면 안 된다.

```tsx
// ❌ 금지 — 인라인 삼항 중첩
function BoardView({ posts, isLoading }) {
  return isLoading ? (
    <Skeleton />
  ) : posts.length === 0 ? (
    <Empty />
  ) : (
    <FlatList />
  );
}

// ❌ 금지 — early return으로 직접 분기
function ClubTabView({ club, isLoading, isError }) {
  if (isError)
    return (
      <View>
        <Text>연결 실패</Text>
      </View>
    );
  if (isLoading)
    return (
      <View>
        <Skeleton />
      </View>
    );
  if (!club)
    return (
      <View>
        <Text>팀 없음</Text>
      </View>
    );
  // ...
}
```

#### ✅ 권장: 레이어별 책임 분리

각 상태를 전담 컴포넌트에 위임한다.

| 상태           | 처리 주체                           | 위치                 |
| -------------- | ----------------------------------- | -------------------- |
| 로딩           | `AsyncBoundary` (Suspense fallback) | Container 밖         |
| 에러           | `AsyncBoundary` (ErrorBoundary)     | Container 밖         |
| null / 빈 배열 | `EmptyBoundary`                     | Container 내부       |
| 정상 데이터    | View                                | View만 받아서 렌더링 |

```tsx
// ✅ 권장 — Container
function ClubTabContent() {
  const { data: club } = useMyClub(); // useSuspenseQuery 사용

  return (
    <EmptyBoundary
      data={club}
      fallback={
        <NoClubView
          onCreateClub={() => router.push("/(app)/club/create" as Href)}
          onSearchClub={() => router.push("/(app)/club/search" as Href)}
          onJoinByCode={() => router.push("/(app)/club/invite-enter" as Href)}
        />
      }
    >
      <ClubTabView
        club={club!}
        onGoMembers={() =>
          router.push(`/(app)/club/${club?.id}/members` as Href)
        }
        onGoBoard={() => router.push(`/(app)/club/${club?.id}/board` as Href)}
        onGoSettings={() =>
          router.push(`/(app)/club/${club?.id}/settings` as Href)
        }
        onGoJoinRequests={() =>
          router.push(`/(app)/club/${club?.id}/join-requests` as Href)
        }
      />
    </EmptyBoundary>
  );
}

export function ClubTabContainer() {
  return (
    <AsyncBoundary loadingFallback={<ClubTabSkeleton />}>
      <ClubTabContent />
    </AsyncBoundary>
  );
}

// ✅ 권장 — View (club은 항상 non-null로 보장됨)
function ClubTabView({ club }: { club: ClubDetail }) {
  return <ScreenLayout>...</ScreenLayout>;
}
```

#### 핵심 규칙 요약

```
❌ View props에 isLoading, isError, isEmpty 금지
❌ View 내부에서 null / undefined / length === 0 체크 금지
✅ useQuery → useSuspenseQuery / useSuspenseInfiniteQuery 사용
✅ 로딩·에러 → AsyncBoundary, null·빈배열 → EmptyBoundary
✅ View는 항상 보장된 데이터만 받는다
```

### 4.4 패턴 선택 기준 — Suspense vs 로컬 로딩

#### 핵심 판단 기준

> **데이터 없이 화면 자체가 의미 없으면 → Suspense**
> **화면 맥락은 유지하면서 일부만 업데이트하면 → 로컬 로딩**

| 구분 | Suspense (AsyncBoundary) | 로컬 로딩 (isLoading prop) |
|---|---|---|
| 적합한 상황 | 페이지 최초 진입, 필수 데이터 없으면 화면 자체가 빈 공간 | 검색·필터링, 무한 스크롤, 폼 제출 |
| UI 동작 | 전체 영역이 스켈레톤으로 대체됨 | 기존 UI(검색바 등) 유지, 일부 영역만 변경 |
| View 순수성 | View에 `isLoading` 없음 — 데이터 보장 | View에 `isLoading` 수신 필요 |
| 대표 예시 | 상세 페이지 진입, 회원 목록, 클럽 정보 | 검색 결과, 더보기, 낙관적 업데이트 |

#### 혼용 전략

```
AsyncBoundary (페이지 진입 시 굵직한 로딩)
└── Container
    └── View (사용자 액션에 의한 isLoading은 서브 컴포넌트로 처리)
```

#### Suspense 불가 예외 조건

| 조건                  | 이유                                                             | 처리 방식                                      |
| --------------------- | ---------------------------------------------------------------- | ---------------------------------------------- |
| `enabled` 옵션 사용   | Suspense는 `enabled: false` 상태를 pending으로 간주 → 무한 로딩  | `useInfiniteQuery` 유지, `isLoading` prop 수신 |
| 실시간 입력 기반 쿼리 | 입력 전/후 상태가 의미상 다름 (초기·로딩·빈결과 3가지 구분 필요) | View에서 상태 판별 변수로 분리                 |

#### ✅ 예외 케이스 작성 규칙

이 경우에도 View 내부의 분기 로직을 최소화하고 가독성을 유지하기 위해 아래 규칙을 따른다.

**1) 상태 판별 변수를 View 최상단에 응집한다**

인라인 삼항 중첩 대신, 상태를 나타내는 의미 있는 변수명으로 추출한다.

```tsx
// ❌ 금지 — 인라인 조건 중첩
{
  !isLoading && query.length > 0 && clubs.length === 0 && (
    <TextBox>결과 없음</TextBox>
  );
}

// ✅ 권장 — 상단에 응집
const isInitial = !isLoading && query.length === 0;
const isEmptyResult = !isLoading && query.length > 0 && clubs.length === 0;
const showList = !isLoading && clubs.length > 0;
```

**2) 상태별 렌더링은 전용 컴포넌트로 분리한다**

```tsx
// ✅ View 내부 — 각 상태를 독립 컴포넌트로 위임
export function ClubSearchView({ query, clubs, isLoading, ... }: ClubSearchViewProps) {
  const isInitial = !isLoading && query.length === 0;
  const isEmptyResult = !isLoading && query.length > 0 && clubs.length === 0;
  const showList = !isLoading && clubs.length > 0;

  return (
    <ScreenLayout>
      <SearchBar value={query} onChange={onQueryChange} />

      {isLoading && <SearchSkeletonList />}
      {isInitial && <SearchInitialView />}
      {isEmptyResult && <SearchEmptyView query={query} />}
      {showList && <FlatList data={clubs} ... />}
    </ScreenLayout>
  );
}

// 상태별 전용 컴포넌트 (파일 하단에 위치, export 불필요)
const SearchInitialView = () => ( ... );
const SearchEmptyView = ({ query }: { query: string }) => ( ... );
const SearchSkeletonList = () => ( ... );
```

**3) Container는 isLoading을 그대로 View에 전달한다 (AsyncBoundary 생략)**

```tsx
// ✅ Container — AsyncBoundary 없이 직접 전달
export function ClubSearchContainer() {
  const [query, setQuery] = useState("");
  const { data, isLoading, fetchNextPage, hasNextPage } = useClubSearch({
    name: query || undefined,
  });
  const clubs = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <ClubSearchView
      query={query}
      clubs={clubs}
      isLoading={isLoading}
      hasNextPage={hasNextPage ?? false}
      onQueryChange={setQuery}
      onLoadMore={() => fetchNextPage()}
      onSelectClub={(id) => router.push(`/(app)/club/${id}/join` as Href)}
    />
  );
}
```

---

## 5️⃣ 에러 타입별 처리 가이드

| **에러 종류**            | **처리 위치**              | **방법**                                     |
| ------------------------ | -------------------------- | -------------------------------------------- |
| **JS 런타임 에러**       | `Global ErrorBoundary`     | 전체화면 Fallback UI 표시                    |
| **Query 에러 (GET)**     | `QueryErrorBoundary`       | 인라인 에러 뷰 + 재시도 버튼                 |
| **Mutation 에러 (POST)** | 호출부 (onSuccess/onError) | 토스트 메시지 알림 또는 폼 필드 에러 표시    |
| **401 인증 에러**        | Axios Interceptor          | 토큰 갱신 시도 또는 로그인 페이지 리다이렉트 |
| **빈 데이터 (200 OK)**   | `EmptyBoundary`            | "데이터가 없습니다" 안내 문구 UI             |

---

## 6️⃣ Query Key & Hook 규칙

- **Query Key**: 상수 객체(`matchQueryKeys`)로 중앙 관리하여 오타 방지 및 캐시 무효화(`invalidateQueries`) 효율화
- **Data Hook**: `useQuery`, `useMutation`을 각 도메인별 `hooks/queries` 폴더에 분리
- **Logic Hook**: 폼 상태(`react-hook-form`)와 뮤테이션을 연결하여 UI와 비즈니스 로직 분리

---

## 7️⃣ 개발 체크리스트

- [ ] API 응답에 대한 **Zod Schema**를 정의했는가?
- [ ] **Service** 레이어에서 스키마 파싱(`parse`)을 수행했는가?
- [ ] 로딩 시 **Skeleton UI**(`LoadingView`)를 준비했는가?
- [ ] 데이터가 없을 때의 **Empty UI**(`EmptyView`)를 준비했는가?
- [ ] 에러 발생 시 사용자가 **재시도**할 수 있는 UI를 제공하는가?
- [ ] 비동기 상태 핸들링을 규칙대로 통일되게 수행했는가?
