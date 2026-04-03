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
    const data = await http.get('/matches', filters);
    return matchListSchema.parse(data); // 런타임 검증 및 타입 추론
  },
  create: async (input: CreateMatchInput): Promise<Match> => {
    const data = await http.post('/matches', input);
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

---

## 5️⃣ 에러 타입별 처리 가이드

| **에러 종류** | **처리 위치** | **방법** |
| --- | --- | --- |
| **JS 런타임 에러** | `Global ErrorBoundary` | 전체화면 Fallback UI 표시 |
| **Query 에러 (GET)** | `QueryErrorBoundary` | 인라인 에러 뷰 + 재시도 버튼 |
| **Mutation 에러 (POST)** | 호출부 (onSuccess/onError) | 토스트 메시지 알림 또는 폼 필드 에러 표시 |
| **401 인증 에러** | Axios Interceptor | 토큰 갱신 시도 또는 로그인 페이지 리다이렉트 |
| **빈 데이터 (200 OK)** | `EmptyBoundary` | "데이터가 없습니다" 안내 문구 UI |

---

## 6️⃣ Query Key & Hook 규칙

- **Query Key**: 상수 객체(`matchQueryKeys`)로 중앙 관리하여 오타 방지 및 캐시 무효화(`invalidateQueries`) 효율화
- **Data Hook**: `useQuery`, `useMutation`을 각 도메인별 `hooks/queries` 폴더에 분리
- **Logic Hook**: 폼 상태(`react-hook-form`)와 뮤테이션을 연결하여 UI와 비즈니스 로직 분리

---

## 7️⃣ 개발 체크리스트

- [ ]  API 응답에 대한 **Zod Schema**를 정의했는가?
- [ ]  **Service** 레이어에서 스키마 파싱(`parse`)을 수행했는가?
- [ ]  로딩 시 **Skeleton UI**(`LoadingView`)를 준비했는가?
- [ ]  데이터가 없을 때의 **Empty UI**(`EmptyView`)를 준비했는가?
- [ ]  에러 발생 시 사용자가 **재시도**할 수 있는 UI를 제공하는가?
