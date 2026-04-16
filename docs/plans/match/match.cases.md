# Match Test Cases

> 테스트케이스 ID 규격: `{기능}-{카테고리}-{순번}`
> 카테고리: 01(접근/권한) · 02(입력 유효성) · 03(제출/요청) · 04(성공) · 05(실패/예외)

---

## Unit Test Cases — `data/schemas`, utils

| ID          | GIVEN                                           | WHEN                           | THEN                                       | 우선순위 |
| ----------- | ----------------------------------------------- | ------------------------------ | ------------------------------------------ | -------- |
| MATCH-01-01 | 유효한 MatchSummary 응답                        | `MatchSummarySchema.parse()`   | 파싱 성공, myResponse 포함 타입 반환       | P0       |
| MATCH-01-02 | `startAt` 필드가 없는 응답                      | `MatchSummarySchema.parse()`   | ZodError throw                             | P0       |
| MATCH-01-03 | 유효한 MatchDetail 응답 (LEAGUE, 기록 있음)     | `MatchDetailSchema.parse()`    | 파싱 성공, homeScore/awayScore 포함        | P0       |
| MATCH-01-04 | homeScore가 null인 응답 (기록 전)               | `MatchDetailSchema.parse()`    | 파싱 성공, homeScore = null 허용           | P0       |
| MATCH-01-05 | 유효한 LineupSchema (쿼터 2개, LEAGUE)          | `LineupSchema.parse()`         | 파싱 성공, quarters 배열 반환              | P1       |
| MATCH-01-06 | team 필드가 있는 LineupSchema (SELF)            | `LineupSchema.parse()`         | team: "A" \| "B" 허용                      | P1       |
| MATCH-01-07 | 유효한 GoalSchema (득점자만, 도움 없음)         | `GoalSchema.parse()`           | assistUserId null 허용, 파싱 성공          | P1       |
| MATCH-01-08 | 유효한 MomResultSchema (공동 수상 2명)          | `MomResultSchema.parse()`      | winners 배열 2건 반환                      | P1       |
| MATCH-01-09 | score가 5.5인 OpponentRatingSchema              | `OpponentRatingSchema.parse()` | ZodError throw (max 5.0)                   | P0       |
| MATCH-01-10 | score가 0.5인 OpponentRatingSchema              | `OpponentRatingSchema.parse()` | ZodError throw (min 1.0)                   | P0       |
| MATCH-01-11 | 유효한 MatchCommentSchema                       | `MatchCommentSchema.parse()`   | 파싱 성공, authorName 포함                 | P1       |
| MATCH-01-12 | youtubeUrl이 일반 URL인 MatchVideoSchema        | `MatchVideoSchema.parse()`     | ZodError throw (YouTube URL 형식 아님)     | P0       |
| MATCH-01-13 | startAt > endAt인 CreateMatchSchema             | `CreateMatchSchema.parse()`    | ZodError throw (종료 시각이 시작보다 빠름) | P0       |
| MATCH-01-14 | voteDeadline이 startAt 이후인 CreateMatchSchema | `CreateMatchSchema.parse()`    | ZodError throw (마감일이 경기 시작 이후)   | P0       |
| MATCH-01-15 | 예상 외 필드 포함 응답                          | 각 Schema `.parse()`           | 추가 필드 strip 처리                       | P2       |

---

## Integration Test Cases — hooks

### 경기 목록 / 상세

| ID          | GIVEN                          | WHEN                                   | THEN                                       | 우선순위 |
| ----------- | ------------------------------ | -------------------------------------- | ------------------------------------------ | -------- |
| MATCH-03-01 | 인증된 멤버, 다가오는 경기 3개 | `useMatches(clubId)` 호출              | `GET /clubs/:clubId/matches` → 목록 반환   | P0       |
| MATCH-03-02 | 경기 0개                       | `useMatches(clubId)` 호출              | `data.pages[0].data = []`, nextCursor null | P1       |
| MATCH-03-03 | 경기 25개, 커서 페이지         | `fetchNextPage()` 호출                 | 다음 페이지 로드, nextCursor 갱신          | P0       |
| MATCH-03-04 | 인증된 멤버, 유효한 matchId    | `useMatchDetail(clubId, matchId)` 호출 | MatchDetail 반환, myResponse 포함          | P0       |
| MATCH-03-05 | 서버 500 응답                  | `useMatches()` 호출                    | `isError: true`, ErrorBoundary 활성화      | P0       |
| MATCH-03-06 | 네트워크 단절                  | `useMatchDetail()` 호출                | 네트워크 에러, 재시도 UI                   | P1       |

### 경기 투표 등록

| ID          | GIVEN                 | WHEN                           | THEN                                               | 우선순위 |
| ----------- | --------------------- | ------------------------------ | -------------------------------------------------- | -------- |
| MATCH-03-07 | 유효한 CreateMatchDto | `useCreateMatch().mutate(dto)` | `POST /clubs/:clubId/matches` 201 → matches 무효화 | P0       |
| MATCH-03-08 | 생성 성공             | `useCreateMatch()` onSuccess   | `matchQueryKeys.list` invalidate 확인              | P1       |

### 투표 응답

| ID          | GIVEN                     | WHEN                                                   | THEN                                                          | 우선순위 |
| ----------- | ------------------------- | ------------------------------------------------------ | ------------------------------------------------------------- | -------- |
| MATCH-03-09 | 마감 전, 미투표 유저      | `useSubmitAttendance().mutate({ response: 'ATTEND' })` | `POST .../attendances` 201 → attendances + matchDetail 무효화 | P0       |
| MATCH-03-10 | 마감 전, 이미 투표한 유저 | `useSubmitAttendance().mutate({ response: 'ABSENT' })` | upsert → 기존 응답 변경 200                                   | P0       |
| MATCH-03-11 | 마감 후                   | `useSubmitAttendance().mutate(dto)`                    | 서버 `MATCH_003` → onError 콜백 실행                          | P0       |
| MATCH-03-12 | 투표 현황 조회            | `useAttendances(clubId, matchId)` 호출                 | 참석/불참/미정 목록 반환                                      | P0       |

### 포지션 배정

| ID          | GIVEN                           | WHEN                                   | THEN                                              | 우선순위 |
| ----------- | ------------------------------- | -------------------------------------- | ------------------------------------------------- | -------- |
| MATCH-03-13 | 유효한 SaveLineupDto (쿼터 2개) | `useSaveLineup().mutate(dto)`          | `PUT .../lineup` 200 → lineup 무효화              | P0       |
| MATCH-03-14 | 존재하지 않는 userId 포함       | `useSaveLineup().mutate(dto)`          | 서버 `MATCH_010` → onError 콜백                   | P0       |
| MATCH-03-15 | 참여 선수 수동 추가             | `useAddParticipant().mutate(targetId)` | `POST .../participants` 201 → participants 무효화 | P1       |

### 경기 기록

| ID          | GIVEN                                        | WHEN                                  | THEN                                                             | 우선순위 |
| ----------- | -------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------- | -------- |
| MATCH-03-16 | 관리자, 경기 종료 후, 유효한 SubmitRecordDto | `useSubmitRecord().mutate(dto)`       | `POST .../record` 201 → matchDetail 무효화, MOM 투표 활성화 알림 | P0       |
| MATCH-03-17 | 관리자, 경기 종료 전                         | `useSubmitRecord().mutate(dto)`       | 서버 `MATCH_004` → onError 콜백                                  | P0       |
| MATCH-03-18 | 기록 수정                                    | `useUpdateRecord().mutate(dto)`       | `PATCH .../record` 200 → 변경 이력 저장 확인                     | P0       |
| MATCH-03-19 | 기록 변경 이력 조회                          | `useRecordHistories(clubId, matchId)` | beforeData/afterData 포함 이력 반환                              | P1       |

### MOM 투표

| ID          | GIVEN                                 | WHEN                                          | THEN                                        | 우선순위 |
| ----------- | ------------------------------------- | --------------------------------------------- | ------------------------------------------- | -------- |
| MATCH-03-20 | 경기 당일, 기록 등록 후, 투표 전 유저 | `useSubmitMomVote().mutate({ targetUserId })` | `POST .../mom-votes` 201 → momResult 무효화 | P0       |
| MATCH-03-21 | 이미 투표한 유저                      | `useSubmitMomVote().mutate({ targetUserId })` | 서버 `MATCH_006` → onError 콜백             | P0       |
| MATCH-03-22 | 당일 자정 경과 후                     | `useSubmitMomVote().mutate(dto)`              | 서버 `MATCH_005` → onError 콜백             | P0       |
| MATCH-03-23 | MOM 결과 조회 (공동 수상)             | `useMomResult(clubId, matchId)`               | winners 배열 2건 이상 반환                  | P1       |

### 댓글

| ID          | GIVEN                   | WHEN                                   | THEN                                      | 우선순위 |
| ----------- | ----------------------- | -------------------------------------- | ----------------------------------------- | -------- |
| MATCH-03-24 | 댓글 25건               | `useMatchComments(clubId, matchId)`    | 첫 페이지 20건, nextCursor 존재           | P0       |
| MATCH-03-25 | 유효한 댓글 내용        | `useCreateComment().mutate(dto)`       | `POST .../comments` 201 → comments 무효화 | P0       |
| MATCH-03-26 | 작성자가 댓글 삭제      | `useDeleteComment().mutate(commentId)` | `DELETE .../comments/:id` 200             | P1       |
| MATCH-03-27 | 관리자가 타인 댓글 삭제 | `useDeleteComment().mutate(commentId)` | 200 성공                                  | P1       |

### 영상

| ID          | GIVEN              | WHEN                                        | THEN                                  | 우선순위 |
| ----------- | ------------------ | ------------------------------------------- | ------------------------------------- | -------- |
| MATCH-03-28 | 유효한 YouTube URL | `useRegisterVideo().mutate({ youtubeUrl })` | `POST .../videos` 201 → videos 무효화 | P1       |
| MATCH-03-29 | 비멤버가 영상 등록 | `useRegisterVideo().mutate(dto)`            | 서버 403 → onError 콜백               | P0       |

### 상대팀 평가

| ID          | GIVEN                          | WHEN                                    | THEN                            | 우선순위 |
| ----------- | ------------------------------ | --------------------------------------- | ------------------------------- | -------- |
| MATCH-03-30 | LEAGUE 경기, 기록 등록 후      | `useSubmitOpponentRating().mutate(dto)` | `POST .../opponent-rating` 201  | P0       |
| MATCH-03-31 | SELF 경기                      | `useSubmitOpponentRating().mutate(dto)` | 서버 `MATCH_007` → onError 콜백 | P0       |
| MATCH-03-32 | 이미 평가 제출한 유저          | `useSubmitOpponentRating().mutate(dto)` | 서버 `MATCH_008` → onError 콜백 | P0       |
| MATCH-03-33 | 기록 미등록 상태의 LEAGUE 경기 | `useSubmitOpponentRating().mutate(dto)` | 서버 `MATCH_007` → onError 콜백 | P0       |

---

## Component Test Cases — UI 인터랙션

### 투표 목록

| ID          | GIVEN              | WHEN                       | THEN                                      | 우선순위 |
| ----------- | ------------------ | -------------------------- | ----------------------------------------- | -------- |
| MATCH-04-01 | 다가오는 경기 있음 | `VoteListContainer` 렌더링 | MatchCard 목록 표시, 내 투표 상태 칩 노출 | P0       |
| MATCH-04-02 | 경기 0개           | `VoteListContainer` 렌더링 | "등록된 경기가 없습니다" 빈 상태 UI       | P0       |
| MATCH-04-03 | 데이터 로딩 중     | `VoteListContainer` 렌더링 | 스켈레톤 UI 표시                          | P0       |
| MATCH-04-04 | API 에러           | `VoteListContainer` 렌더링 | 에러 Fallback + 재시도 버튼               | P0       |

### 경기 투표 등록 폼

| ID          | GIVEN                               | WHEN                | THEN                                                          | 우선순위 |
| ----------- | ----------------------------------- | ------------------- | ------------------------------------------------------------- | -------- |
| MATCH-04-05 | 제목 빈 값                          | "등록" 버튼 클릭    | 버튼 비활성화 또는 필수 입력 에러                             | P0       |
| MATCH-04-06 | 종료 시각이 시작 시각보다 빠른 입력 | "등록" 버튼 클릭    | "종료 시각은 시작 시각 이후여야 합니다" 에러                  | P0       |
| MATCH-04-07 | 투표 마감일이 경기 시작 이후        | "등록" 버튼 클릭    | "마감일은 경기 시작 전이어야 합니다" 에러                     | P0       |
| MATCH-04-08 | 유효한 폼 입력 완료                 | "등록" 버튼 클릭    | `useCreateMatch().mutate()` 호출 → 성공 시 투표 목록으로 이동 | P0       |
| MATCH-04-09 | MEMBER 권한 유저                    | 투표 등록 버튼 접근 | 버튼 미노출 또는 라우트 접근 차단                             | P0       |

### 다가오는 경기 (BEFORE 상태)

| ID          | GIVEN                | WHEN                       | THEN                                                     | 우선순위 |
| ----------- | -------------------- | -------------------------- | -------------------------------------------------------- | -------- |
| MATCH-04-10 | 경기 3일 전          | `MatchProgressView` 렌더링 | D-3 뱃지, 투표 현황 프로그레스바, 포메이션 미리보기 표시 | P0       |
| MATCH-04-11 | 당일 경기 (D-Day)    | `MatchProgressView` 렌더링 | D-Day 강조 표시                                          | P1       |
| MATCH-04-12 | 마감 전, 미투표 상태 | 참석 버튼 클릭             | `useSubmitAttendance()` 호출 → 버튼 상태 즉시 갱신       | P0       |
| MATCH-04-13 | 마감 후              | `MatchProgressView` 렌더링 | 투표 버튼 비활성화 + "투표가 마감되었습니다" 안내        | P0       |
| MATCH-04-14 | 관리자 진입          | `MatchProgressView` 렌더링 | 수정 버튼 노출                                           | P1       |
| MATCH-04-15 | MEMBER 진입          | `MatchProgressView` 렌더링 | 수정 버튼 미노출                                         | P0       |

### 다가오는 경기 (AFTER 상태)

| ID          | GIVEN                           | WHEN                       | THEN                                           | 우선순위 |
| ----------- | ------------------------------- | -------------------------- | ---------------------------------------------- | -------- |
| MATCH-04-16 | 경기 종료, 기록 미입력 (관리자) | `MatchProgressView` 렌더링 | "기록 입력" CTA 버튼 노출                      | P0       |
| MATCH-04-17 | 경기 종료, 기록 미입력 (MEMBER) | `MatchProgressView` 렌더링 | "기록 입력 버튼" 미노출, 경기 상세 버튼만 노출 | P0       |
| MATCH-04-18 | 기록 등록 후, 당일 자정 전      | `MatchProgressView` 렌더링 | MOM 투표 CTA 버튼 활성화                       | P0       |
| MATCH-04-19 | 기록 등록 후, 당일 자정 경과    | `MatchProgressView` 렌더링 | MOM 투표 버튼 비활성화 + "투표 마감" 안내      | P0       |

### 포지션 배정

| ID          | GIVEN                | WHEN                            | THEN                               | 우선순위 |
| ----------- | -------------------- | ------------------------------- | ---------------------------------- | -------- |
| MATCH-04-20 | 참석 선수 0명        | `LineupView` 렌더링             | "참석 선수가 없습니다" 빈 상태     | P1       |
| MATCH-04-21 | 포메이션 선택 변경   | 포메이션 드롭다운 변경          | 필드 슬롯이 새 포메이션으로 재배치 | P0       |
| MATCH-04-22 | SELF 경기, 팀 나누기 | A팀/B팀 탭 전환                 | 각 팀 포메이션 독립 표시           | P0       |
| MATCH-04-23 | 랜덤 배치 버튼 클릭  | 선수 목록 → 포지션 랜덤 배정    | 모든 슬롯에 선수 자동 배치         | P1       |
| MATCH-04-24 | 저장 버튼 클릭       | `useSaveLineup().mutate()` 성공 | "저장되었습니다" 토스트            | P0       |
| MATCH-04-25 | MEMBER 권한          | `LineupView` 렌더링             | 수정 불가 (읽기 전용 모드)         | P0       |

### 경기 기록 입력

| ID          | GIVEN                          | WHEN                              | THEN                                | 우선순위 |
| ----------- | ------------------------------ | --------------------------------- | ----------------------------------- | -------- |
| MATCH-04-26 | 스코어 음수 입력               | 제출 버튼 클릭                    | "0 이상의 숫자를 입력하세요" 에러   | P0       |
| MATCH-04-27 | 득점자 미선택 상태로 득점 추가 | 추가 버튼 클릭                    | 버튼 비활성화 (득점자 필수)         | P0       |
| MATCH-04-28 | 유효한 기록 입력 후 제출       | `useSubmitRecord().mutate()` 성공 | 경기 상세 탭으로 이동 + 성공 토스트 | P0       |
| MATCH-04-29 | 기록 수정 진입                 | 수정 폼 렌더링                    | 기존 스코어·득점 기록 자동 채움     | P1       |

### 경기 상세 — 4탭

| ID          | GIVEN                         | WHEN                         | THEN                                       | 우선순위 |
| ----------- | ----------------------------- | ---------------------------- | ------------------------------------------ | -------- |
| MATCH-04-30 | 기록 탭, 득점 있음            | `ClubMatchDetailView` 렌더링 | 득점·도움 타임라인 + 쿼터별 선수 목록 표시 | P0       |
| MATCH-04-31 | 기록 탭, MOM 투표 마감 전     | `ClubMatchDetailView` 렌더링 | MOM 투표 버튼 활성화                       | P0       |
| MATCH-04-32 | 기록 탭, 이미 MOM 투표 완료   | `ClubMatchDetailView` 렌더링 | "이미 투표하셨습니다" + 버튼 비활성화      | P0       |
| MATCH-04-33 | 댓글 탭, 댓글 0개             | 탭 전환                      | "첫 댓글을 남겨보세요" 빈 상태             | P1       |
| MATCH-04-34 | 댓글 탭, 501자 입력           | 제출 버튼 클릭               | "500자 이하" 에러                          | P0       |
| MATCH-04-35 | 댓글 작성자                   | 본인 댓글 렌더링             | 삭제 버튼 노출                             | P0       |
| MATCH-04-36 | 타인 댓글                     | 댓글 렌더링                  | 삭제 버튼 미노출                           | P0       |
| MATCH-04-37 | 관리자                        | 타인 댓글 렌더링             | 삭제 버튼 노출                             | P0       |
| MATCH-04-38 | 영상 탭, YouTube URL 등록     | "등록" 버튼 클릭             | WebView로 영상 재생                        | P1       |
| MATCH-04-39 | 영상 탭, 일반 URL 입력        | "등록" 버튼 클릭             | "올바른 YouTube URL을 입력하세요" 에러     | P0       |
| MATCH-04-40 | 상대팀 평가 탭, LEAGUE 경기   | 탭 표시                      | 별점 + 리뷰 폼 노출                        | P0       |
| MATCH-04-41 | 상대팀 평가 탭, SELF 경기     | 탭 표시                      | 탭 자체 숨김 처리                          | P0       |
| MATCH-04-42 | 상대팀 평가, 이미 제출한 상태 | 탭 진입                      | 폼 비활성화 + 기존 평가 내용 표시          | P0       |

### 경기 기록 목록

| ID          | GIVEN            | WHEN                         | THEN                                   | 우선순위 |
| ----------- | ---------------- | ---------------------------- | -------------------------------------- | -------- |
| MATCH-04-43 | 지난 경기 0개    | `MatchRecordListView` 렌더링 | "경기 기록이 없습니다" 빈 상태         | P1       |
| MATCH-04-44 | 날짜 필터 적용   | 날짜 범위 선택 → 조회        | 해당 기간 경기만 필터링                | P1       |
| MATCH-04-45 | 승/무/패 요약    | `MatchRecordListView` 렌더링 | 상단 요약 배너에 승/무/패 집계 표시    | P1       |
| MATCH-04-46 | 스크롤 하단 도달 | `FlatList` onEndReached      | `fetchNextPage()` 호출, 다음 경기 로드 | P1       |

---

## E2E Test Cases — 핵심 플로우

| ID          | GIVEN                                               | WHEN                                          | THEN                                                        | 우선순위 |
| ----------- | --------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------- | -------- |
| MATCH-05-01 | 관리자, 유효한 경기 정보                            | 투표 등록 폼 3단계 완료 후 제출               | 투표 목록에 새 MatchCard 노출 + 팀원 알림 전송              | P0       |
| MATCH-05-02 | 팀원 3명, 마감 전                                   | 각각 참석/불참/미정 투표                      | 투표 현황 프로그레스바 실시간 갱신 + 각 상태 목록 분류      | P0       |
| MATCH-05-03 | 관리자, 경기 종료 후                                | 스코어 2-1, 득점자 2명, 도움 1명 입력 후 제출 | 경기 상세 기록 탭에 타임라인 표시 + 팀원 MOM 투표 알림 발송 | P0       |
| MATCH-05-04 | 팀원 5명, MOM 투표 활성화 상태                      | 각자 다른 선수에게 투표                       | 최다 득표 선수 MOM 확정 + 동점 시 공동 수상 표시            | P0       |
| MATCH-05-05 | 팀원 4명 투표 시 3:1 동점 아닌 단독 수상            | 결과 조회                                     | 단일 MOM 확정                                               | P1       |
| MATCH-05-06 | LEAGUE 경기, 기록 등록 후                           | 상대팀 평가 탭 → 별점 4 + 리뷰 입력 후 제출   | 평가 저장, 탭 비활성화(재제출 불가)                         | P0       |
| MATCH-05-07 | SELF 경기 등록                                      | 경기 상세 진입                                | 상대팀 평가 탭 미노출 확인                                  | P0       |
| MATCH-05-08 | 관리자, 쿼터 3개 LEAGUE 포메이션 배정               | 선수 배정 완료 후 저장                        | 저장 성공 + MEMBER가 조회 시 읽기 전용으로 표시             | P0       |
| MATCH-05-09 | SELF 경기, A팀/B팀 포메이션 배정                    | 각 팀 독립 저장                               | A팀/B팀 쿼터별 배정 데이터 정상 저장                        | P1       |
| MATCH-05-10 | 관리자, 이미 등록된 기록 수정                       | 스코어 2-1 → 3-1로 수정                       | 기록 반영 + 변경 이력(before: 2-1, after: 3-1) 저장         | P0       |
| MATCH-05-11 | 마감 전 투표 수정                                   | 참석 → 불참으로 재투표                        | 투표 현황 프로그레스바 즉시 반영                            | P0       |
| MATCH-05-12 | 마감 후 투표 시도                                   | 투표 버튼 클릭                                | 버튼 비활성화 (UI 레벨 차단), 서버 MATCH_003 에러           | P0       |
| MATCH-05-13 | Rate Limit — 댓글 과다 제출                         | 단시간 10회 이상 제출                         | 429 → "잠시 후 다시 시도하세요" 토스트                      | P0       |
| MATCH-05-14 | MEMBER 권한, 관리자 전용 경기 등록 라우트 직접 접근 | URL 직접 입력                                 | 접근 차단 또는 권한 없음 에러 표시                          | P0       |
| MATCH-05-15 | MEMBER 권한, 기록 입력 라우트 직접 접근             | URL 직접 입력                                 | 접근 차단                                                   | P0       |
| MATCH-05-16 | 네트워크 단절 중 투표 탭 진입                       | 오프라인 상태                                 | 캐시된 목록 표시 또는 네트워크 에러 UI                      | P1       |
| MATCH-05-17 | 경기 삭제 (마감 전)                                 | 관리자 삭제 확인 → 완료                       | 투표 목록에서 해당 카드 제거                                | P0       |
| MATCH-05-18 | 경기 수정 (마감 전)                                 | 관리자 장소 수정 → 저장                       | 경기 상세에서 수정된 장소 반영                              | P1       |
| MATCH-05-19 | 투표 현황 조회, 참석자 자동 참여 선수 로드          | 포지션 배정 화면 진입                         | 참석 응답한 선수 목록 자동 표시                             | P0       |
| MATCH-05-20 | 수동 선수 추가 (미투표 선수)                        | 관리자가 참여 선수 수동 추가                  | 해당 선수 포지션 배정 대상에 포함                           | P1       |
