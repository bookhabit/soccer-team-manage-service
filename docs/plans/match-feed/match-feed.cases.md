# match-feed Test Cases

## 📌 테스트 요약
- **총 케이스 수:** 42개
- **성공(04):** 14개 / **실패 및 예외(01, 02, 05):** 18개 / **접근/권한(01):** 3개 / **입력 유효성(02):** 5개 / **제출/요청(03):** 2개

---

## 1. Unit Test Cases (Logic & Schema)

| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
| MFEED-02-001 | 서버 응답에 `opponentName: null`인 LEAGUE 아이템 | `matchFeedItemSchema.parse()` 실행 | opponentName이 `null`로 파싱됨 (optional 처리) | P1 |
| MFEED-02-002 | 서버 응답에 `momUserName: null`인 아이템 | `matchFeedItemSchema.parse()` 실행 | momUserName이 `null`로 파싱됨 | P2 |
| MFEED-02-003 | `nextCursor: null`인 마지막 페이지 응답 | `matchFeedPageSchema.parse()` 실행 | nextCursor가 `null`로 파싱됨 | P1 |
| MFEED-02-004 | 상세 응답에 `goals: []`이고 `momList: []`인 경기 | `matchFeedDetailSchema.parse()` 실행 | 빈 배열로 파싱 성공, 오류 없음 | P1 |
| MFEED-02-005 | 상세 응답에 동점 MOM 3명(`momList.length === 3`) | `matchFeedDetailSchema.parse()` 실행 | momList가 3개 항목으로 파싱됨 | P2 |
| MFEED-02-006 | `assistUserId: null`, `assistUserName: null`인 득점 기록 | `matchGoalItemSchema.parse()` 실행 | null 허용, 파싱 성공 | P2 |
| MFEED-02-007 | SELF 경기 득점 기록에 `team: "A"` | `matchGoalItemSchema.parse()` 실행 | team 필드 포함 파싱 성공 | P2 |
| MFEED-02-008 | `from`이 `to`보다 늦은 날짜 필터 | `matchFeedFilterSchema.parse()` 실행 | 파싱은 성공하되 API 호출 시 서버에서 검증 (클라이언트 스키마는 순서 검증 안 함) | P2 |

---

## 2. Integration Test Cases (hooks + MSW)

| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
| MFEED-04-001 | MSW가 `/match-feed` 200 응답 20건 반환 설정 | `useMatchFeed({})` 훅 마운트 | `data.pages[0].items.length === 20`, `nextCursor` 존재 | P1 |
| MFEED-04-002 | MSW가 `/match-feed` 2페이지 응답 설정, `nextCursor` 포함 | `fetchNextPage()` 호출 | `data.pages.length === 2`, 아이템 총합 40건 | P1 |
| MFEED-04-003 | MSW가 마지막 페이지 `nextCursor: null` 반환 | `hasNextPage` 확인 | `hasNextPage === false` | P1 |
| MFEED-04-004 | MSW가 `/match-feed?province=서울특별시` 필터 요청에 4건 반환 | `useMatchFeed({ province: '서울특별시' })` 마운트 | items 4건, 모두 province === '서울특별시' | P1 |
| MFEED-04-005 | MSW가 `/match-feed?myMatches=true` 요청에 내 경기 3건 반환 | `useMatchFeed({ myMatches: true })` 마운트 | items 3건 반환 | P1 |
| MFEED-04-006 | MSW가 `/match-feed` 500 반환 | `useMatchFeed({})` 마운트 | `useSuspenseInfiniteQuery`가 throw → `AsyncBoundary`가 에러 UI 렌더 | P1 |
| MFEED-04-007 | MSW가 `/match-feed/:matchId` 200 상세 응답 반환 | `useMatchFeedDetail(matchId)` 마운트 | detail 데이터 정상 반환, `matchFeedDetailSchema` 파싱 성공 | P1 |
| MFEED-04-008 | MSW가 `/match-feed/:matchId` 404 반환 | `useMatchFeedDetail(matchId)` 마운트 | throw → `AsyncBoundary` 에러 UI | P1 |
| MFEED-04-009 | 네트워크 오프라인 상태 | `useMatchFeed({})` 마운트 | 네트워크 에러 throw → `AsyncBoundary` 에러 UI + 재시도 버튼 노출 | P2 |
| MFEED-05-001 | MSW가 `district` only 요청에 400 + `MATCH_FEED_001` 반환 | `useMatchFeed({ district: '은평구' })` 마운트 | throw → 에러 처리 | P1 |
| MFEED-05-002 | MSW가 날짜 범위 초과 요청에 400 + `MATCH_FEED_002` 반환 | `useMatchFeed({ from: '2024-01-01', to: '2024-08-01' })` 마운트 | throw → 에러 처리 | P2 |

---

## 3. Component Test Cases (UI 인터랙션)

| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
| MFEED-01-001 | 클럽 미소속 유저 | "내 클럽만" 토글 탭 | 토글 비활성 유지, "클럽에 가입하면 사용할 수 있어요" 안내 문구 노출 | P1 |
| MFEED-01-002 | 클럽 소속 유저 | "내 클럽만" 토글 탭 | 토글 활성화, `onFilterChange({ myClub: true })` 호출 | P1 |
| MFEED-04-003 | LEAGUE 피드 아이템 렌더 | 아이템 렌더링 | 홈팀명, 스코어, 상대팀명, MOM, 지역, 날짜 모두 표시 | P1 |
| MFEED-04-004 | SELF 피드 아이템 렌더 | 아이템 렌더링 | "자체전" 레이블, 클럽명, 스코어 표시, 상대팀명 없음 | P1 |
| MFEED-04-005 | MOM 없는 경기 아이템 | 아이템 렌더링 | MOM 영역 미표시 (null 처리) | P2 |
| MFEED-04-006 | 빈 피드 (items.length === 0), 필터 없음 | MatchFeedView 렌더 | "아직 등록된 경기 결과가 없습니다." 표시 | P1 |
| MFEED-04-007 | 빈 피드, 지역 필터 활성 | MatchFeedView 렌더 | "해당 지역에 등록된 경기 결과가 없습니다." 표시 | P2 |
| MFEED-04-008 | 빈 피드, 내가 뛴 경기 필터 활성 | MatchFeedView 렌더 | "참가한 경기 기록이 없습니다." 표시 | P2 |
| MFEED-04-009 | 빈 피드, 자체전 유형 필터 활성 | MatchFeedView 렌더 | "등록된 자체전 기록이 없습니다." 표시 | P2 |
| MFEED-04-010 | LEAGUE 경기 상세 화면 | MatchFeedDetailView 렌더 | "상대 전적 보기" 버튼 표시 | P2 |
| MFEED-04-011 | SELF 경기 상세 화면 | MatchFeedDetailView 렌더 | "상대 전적 보기" 버튼 미표시 | P2 |
| MFEED-03-001 | province 선택 후 district Drawer 열림 | district 항목 선택 | `onFilterChange({ province, district })` 호출, Drawer 닫힘 | P1 |
| MFEED-03-002 | province 미선택 상태 | district Drawer 진입 시도 | district 선택 UI 비활성 또는 진입 불가 | P1 |
| MFEED-05-003 | 피드 스크롤 끝 도달, `hasNextPage === true` | `onEndReached` 트리거 | `fetchNextPage()` 호출 | P1 |
| MFEED-05-004 | 피드 스크롤 끝 도달, `hasNextPage === false` | `onEndReached` 트리거 | `fetchNextPage()` 미호출 | P2 |
| MFEED-05-005 | 로딩 스켈레톤 표시 중 | MatchFeedLoadingView 렌더 | 스켈레톤 아이템 N개 표시, 실제 콘텐츠 미표시 | P2 |

---

## 4. E2E Test Cases (핵심 플로우)

| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
| MFEED-04-012 | 로그인된 유저가 홈 탭에 진입 | 피드 섹션 렌더링 | 기록 완료된 최신 경기 결과 목록이 무한 스크롤로 노출됨 | P1 |
| MFEED-04-013 | 유저가 지역 필터에서 "서울특별시 > 은평구" 선택 | 필터 적용 후 피드 갱신 | 은평구 소재 클럽 경기만 노출, 다른 지역 경기 사라짐 | P1 |
| MFEED-04-014 | 클럽 소속 유저가 "내 클럽만" 토글 활성화 | 필터 적용 후 피드 갱신 | 본인 클럽 경기 결과만 노출 | P1 |
| MFEED-04-015 | 유저가 피드 아이템 탭 | `/(app)/match-feed/[matchId]`로 push | 스코어, 득점 타임라인, MOM, 참여 선수 수 읽기 전용 표시 | P1 |
| MFEED-04-016 | LEAGUE 경기 상세에서 "상대 전적 보기" 탭 | 상대 전적 화면으로 이동 | 두 클럽 간 전적 집계 화면 정상 표시 | P2 |
| MFEED-05-006 | 유저가 "내가 뛴 경기" 필터 활성화 후 피드에 결과 없음 | 빈 상태 렌더링 | "참가한 경기 기록이 없습니다." 메시지 표시, 앱 크래시 없음 | P1 |
| MFEED-05-007 | 피드 로딩 중 네트워크 단절 | 에러 상태 렌더링 | 인라인 에러 뷰 + 재시도 버튼 표시, 재시도 탭 시 재요청 발생 | P2 |
| MFEED-05-008 | 상세 화면 접근 시 삭제된 경기 matchId | 서버 404 반환 | 에러 뷰 표시, 뒤로가기 버튼 노출 | P2 |
