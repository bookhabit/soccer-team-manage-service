# Head-to-Head (상대 전적) Test Cases

## 📌 테스트 요약
- **총 케이스 수:** 32개
- **성공(04):** 10개 / **실패 및 예외(01, 02, 05):** 22개

---

## 1. Unit Test Cases (Logic & Schema)

| ID | GIVEN (상황/데이터) | WHEN (입력/실행) | THEN (기대 결과) | 우선순위 |
|---|---|---|---|---|
| H2H-04-001 | `headToHeadSummarySchema`에 유효한 요약 객체 (wins:3, draws:1, losses:2) | `parse()` 실행 | 파싱 성공, 타입 추론 정확 | P1 |
| H2H-05-001 | `headToHeadSummarySchema`에 `wins` 필드 누락 | `parse()` 실행 | Zod 파싱 실패, `ZodError` throw | P1 |
| H2H-05-002 | `headToHeadHistoryItemSchema`에 `result: 'CANCELLED'` (enum 외) | `parse()` 실행 | Zod 파싱 실패, `ZodError` throw | P1 |
| H2H-04-002 | `headToHeadPageSchema`에 `nextCursor: null`, `hasNextPage: false` | `parse()` 실행 | 파싱 성공, nullable 처리 정상 | P2 |
| H2H-04-003 | `normalizeScore` 헬퍼: `matchPost.clubId === myClubId` (HOST) | `homeScore:2, awayScore:1` 전달 | `myScore:2, opponentScore:1` | P1 |
| H2H-04-004 | `normalizeScore` 헬퍼: `matchPost.clubId !== myClubId` (GUEST) | `homeScore:2, awayScore:1` 전달 | `myScore:1, opponentScore:2` | P1 |
| H2H-05-003 | `normalizeScore` 헬퍼: `matchPost: null` (matchPostId 없는 경기) | 스코어 정규화 실행 | 예외 없이 처리 (fallback 동작 명확) | P2 |
| H2H-04-005 | `myScore > opponentScore` | `result` 판별 | `'WIN'` | P1 |
| H2H-04-006 | `myScore === opponentScore` | `result` 판별 | `'DRAW'` | P1 |
| H2H-04-007 | `myScore < opponentScore` | `result` 판별 | `'LOSS'` | P1 |

---

## 2. Integration Test Cases (API / 데이터 흐름)

| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
| H2H-04-008 | MSW: `/clubs/club-a/head-to-head/club-b` → 정상 응답 (3경기 이력) | `useHeadToHead('club-a', 'club-b')` 호출 | `summary.wins === 3`, `history.length === 3`, `hasNextPage === false` | P1 |
| H2H-04-009 | MSW: 이력 11건 (limit=10) → 첫 페이지 10건, `hasNextPage:true` | `useHeadToHead` 첫 렌더 후 `fetchNextPage()` 호출 | 두 번째 페이지 1건 추가 로드, 총 11건 | P1 |
| H2H-04-010 | MSW: `history: []`, `summary` 전체 0 | `useHeadToHead('club-a', 'club-b')` 호출 | `summary.wins === 0`, `history.length === 0`, `hasNextPage === false` | P2 |
| H2H-01-001 | MSW: 403 `H2H_001` 반환 | `useHeadToHead` 호출 | `QueryErrorBoundary` 에러 상태 진입 | P1 |
| H2H-05-004 | MSW: 404 `H2H_002` 반환 | `useHeadToHead` 호출 | `QueryErrorBoundary` 에러 상태 진입 | P1 |
| H2H-05-005 | MSW: 500 반환 | `useHeadToHead` 호출 | `QueryErrorBoundary` 에러 상태 진입 | P2 |
| H2H-05-006 | MSW: 네트워크 오류 (`network error`) | `useHeadToHead` 호출 | `QueryErrorBoundary` 에러 상태 진입, 재시도 버튼 노출 | P2 |
| H2H-05-007 | MSW: 응답이 Zod 스키마와 불일치 (`result: 'UNKNOWN'`) | `getHeadToHead` 서비스 함수 호출 | `ZodError` throw, 에러 경계로 전파 | P1 |
| H2H-04-011 | cursor 파라미터에 `'2025-01-10T14:00:00.000Z'` | `getHeadToHead` 서비스 함수 쿼리스트링 확인 | `?cursor=2025-01-10T14%3A00%3A00.000Z&limit=10` 형태로 요청 | P2 |

---

## 3. Component Test Cases (UI/UX 인터랙션)

| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
| H2H-04-012 | 정상 summary 데이터 주입 | `H2HSummaryCard` 렌더 | 내 클럽명이 좌측, 상대 클럽명이 우측 표시 | P1 |
| H2H-04-013 | `wins:3, draws:1, losses:2` summary | `H2HSummaryCard` 렌더 | "3승 · 1무 · 2패" 텍스트 표시 | P1 |
| H2H-04-014 | `result: 'WIN'` 이력 아이템 | `H2HHistoryItem` 렌더 | WIN 뱃지 색상 표시 (파란색 계열) | P2 |
| H2H-04-015 | `result: 'DRAW'` 이력 아이템 | `H2HHistoryItem` 렌더 | DRAW 뱃지 색상 표시 (회색 계열) | P2 |
| H2H-04-016 | `result: 'LOSS'` 이력 아이템 | `H2HHistoryItem` 렌더 | LOSS 뱃지 색상 표시 (빨간색 계열) | P2 |
| H2H-04-017 | `history: []` 빈 배열 | `HeadToHeadView` 렌더 | "아직 맞붙은 적이 없습니다." 빈 상태 텍스트 노출 | P1 |
| H2H-04-018 | `hasNextPage: true` | 스크롤을 목록 끝까지 내림 | `onLoadMore` 콜백 호출됨 | P1 |
| H2H-04-019 | `hasNextPage: false` | 스크롤을 목록 끝까지 내림 | `onLoadMore` 호출되지 않음 | P2 |
| H2H-01-002 | `AsyncBoundary` 내에서 쿼리 로딩 중 | 화면 진입 | `H2HSummarySkeleton` + `H2HHistoryItemSkeleton` × 3 노출 | P2 |
| H2H-05-008 | 에러 상태 (`QueryErrorBoundary` 활성화) | 에러 화면 렌더 | 에러 메시지 + 재시도 버튼 노출 | P2 |

---

## 4. E2E Test Cases (핵심 사용자 플로우)

| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
| H2H-04-020 | 마무리FC 멤버로 로그인, LEAGUE 피드 상세 진입 (`detail.clubId === myClub.id`, `opponentClubId !== null`) | "상대 전적 보기" 버튼 탭 | H2H 화면으로 이동, 승/무/패 요약 카드 + 이력 목록 정상 렌더 | P1 |
| H2H-01-003 | 마무리FC 멤버로 로그인, **자체전(SELF)** 피드 상세 진입 | 상세 화면 렌더 | "상대 전적 보기" 버튼 노출되지 않음 | P1 |
| H2H-01-004 | 마무리FC 멤버로 로그인, **타 클럽(카동FC) 경기** 피드 상세 진입 (`detail.clubId !== myClub.id`) | 상세 화면 렌더 | "상대 전적 보기" 버튼 노출되지 않음 | P1 |
| H2H-01-005 | 비인증 사용자 | `GET /clubs/club-a/head-to-head/club-b` 직접 호출 | 401 응답 | P1 |
| H2H-01-006 | 카동FC 소속 유저가 마무리FC H2H 조회 시도 | `GET /clubs/mamurifc/head-to-head/kadongfc` 호출 | 403 `H2H_001` 응답 | P1 |
| H2H-05-009 | 두 클럽의 LEAGUE 경기 이력이 0건 | H2H 화면 진입 | 요약 0승 0무 0패, 이력 영역 "아직 맞붙은 적이 없습니다." 빈 상태 | P1 |
| H2H-04-021 | 맞대결 이력 12건 존재 | H2H 화면 진입 후 목록 하단까지 스크롤 | 첫 10건 로드 → 자동으로 나머지 2건 로드, 이후 스크롤 이벤트 미발생 | P1 |
| H2H-02-001 | `limit` 파라미터에 `0` 전달 | `GET /clubs/club-a/head-to-head/club-b?limit=0` | 400 Bad Request (class-validator `@Min(1)`) | P3 |
| H2H-02-002 | `limit` 파라미터에 `51` 전달 | `GET /clubs/club-a/head-to-head/club-b?limit=51` | 400 Bad Request (class-validator `@Max(50)`) | P3 |
| H2H-05-010 | 존재하지 않는 `clubId` | `GET /clubs/nonexistent/head-to-head/club-b` 호출 | 404 `H2H_002` 응답 | P2 |
| H2H-05-011 | 존재하지 않는 `opponentClubId` | `GET /clubs/club-a/head-to-head/nonexistent` 호출 | 404 `H2H_002` 응답 | P2 |
| H2H-05-012 | `clubId === opponentClubId` (자기 자신과 H2H) | `GET /clubs/club-a/head-to-head/club-a` 호출 | 400 Bad Request 또는 빈 이력 반환 | P3 |
