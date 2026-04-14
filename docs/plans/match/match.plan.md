# Match Plan

## 1. 기능 개요

**목적**: 클럽의 경기 일정 전 주기를 관리한다. 투표(참석 의사 수집) → 포지션 배정 → 경기 진행 → 결과 기록 → MOM 투표·댓글·영상·상대팀 평가까지 경기 하나의 라이프사이클 전체를 제공한다.

**경기 상태 (시간 기반 자동 전환, 별도 API 없음)**

| 상태 | 조건 |
|---|---|
| BEFORE | 현재 시각 < startAt |
| DURING | startAt ≤ 현재 시각 ≤ endAt |
| AFTER | 현재 시각 > endAt |

**핵심 사용자 시나리오**

| 시나리오 | GIVEN | WHEN | THEN |
|---|---|---|---|
| 경기 투표 등록 | 관리자, 소속 클럽 있음 | 투표 등록 폼 제출 | Match 생성 + 팀원 전체 알림 |
| 투표 응답 | 팀원, 마감 전 | 참석/불참/미정 선택 | MatchAttendance upsert |
| 포지션 배정 | 관리자, 경기 전 | 쿼터별 포지션 배정 저장 | MatchQuarter + MatchQuarterAssignment 저장 |
| 경기 기록 입력 | 관리자, 경기 후 | 스코어·득점·도움 입력 | Match 결과 저장 + MOM 투표 활성화 알림 |
| MOM 투표 | 팀원, 경기 당일 자정 전 | 참여 선수 중 1명 선택 | MomVote 저장 (1인 1표) |
| 상대팀 평가 | 팀원, 매칭전 기록 등록 후 | 점수·리뷰 제출 | OpponentRating 저장 |

---

## 2. 클라이언트 라우트

| 경로 | 설명 | 내비게이션 타입 |
|---|---|---|
| `(app)/vote/index` | 투표 탭 홈 — 경기 투표 목록 (다가오는·진행 중·지난 경기) | Bottom Tab |
| `(app)/vote/create` | 경기 투표 등록 (관리자 전용) | Modal Stack |
| `(app)/vote/[matchId]/index` | 다가오는·오늘 경기 상세 (BEFORE/DURING/AFTER 상태 분기) | Stack Push |
| `(app)/vote/[matchId]/lineup` | 포지션 배정 (관리자 전용) | Stack Push |
| `(app)/vote/[matchId]/record` | 경기 기록 입력 (관리자 전용, 경기 후 활성화) | Modal Stack |
| `(app)/vote/[matchId]/detail` | 경기 상세 (4탭: 기록·댓글·영상·상대팀 평가) | Stack Push |
| `(app)/match-records/[clubId]/index` | 클럽 경기 기록 목록 (지난 경기 목록) | Stack Push |

---

## 3. API 설계

### 경기 일정 (Match)

| Method | Endpoint | 설명 | Auth |
|---|---|---|---|
| `GET` | `/clubs/:clubId/matches` | 경기 목록 (status·type 필터, 커서 페이지) | Member |
| `POST` | `/clubs/:clubId/matches` | 경기 투표 등록 | Captain·Vice |
| `GET` | `/clubs/:clubId/matches/:matchId` | 경기 상세 (투표 현황·내 응답 포함) | Member |
| `PATCH` | `/clubs/:clubId/matches/:matchId` | 경기 수정 (voteDeadline 전만 허용) | Captain·Vice |
| `DELETE` | `/clubs/:clubId/matches/:matchId` | 경기 삭제 | Captain·Vice |

### 투표 응답 (Attendance)

| Method | Endpoint | 설명 | Auth |
|---|---|---|---|
| `POST` | `/clubs/:clubId/matches/:matchId/attendances` | 투표 응답 제출 (upsert) | Member |
| `GET` | `/clubs/:clubId/matches/:matchId/attendances` | 투표 현황 목록 (참석/불참/미정별) | Member |

### 포지션 배정 (Lineup)

| Method | Endpoint | 설명 | Auth |
|---|---|---|---|
| `GET` | `/clubs/:clubId/matches/:matchId/lineup` | 포지션 배정 조회 (쿼터별) | Member |
| `PUT` | `/clubs/:clubId/matches/:matchId/lineup` | 포지션 배정 저장 (전체 교체) | Captain·Vice |
| `POST` | `/clubs/:clubId/matches/:matchId/participants` | 참여 선수 수동 추가 | Captain·Vice |
| `DELETE` | `/clubs/:clubId/matches/:matchId/participants/:userId` | 참여 선수 제거 | Captain·Vice |

### 경기 기록 (Record)

| Method | Endpoint | 설명 | Auth |
|---|---|---|---|
| `POST` | `/clubs/:clubId/matches/:matchId/record` | 경기 기록 입력 (경기 후) | Captain·Vice |
| `PATCH` | `/clubs/:clubId/matches/:matchId/record` | 경기 기록 수정 (변경 이력 저장) | Captain·Vice |
| `GET` | `/clubs/:clubId/matches/:matchId/record/histories` | 기록 변경 이력 조회 | Captain·Vice |

### MOM 투표

| Method | Endpoint | 설명 | Auth |
|---|---|---|---|
| `POST` | `/clubs/:clubId/matches/:matchId/mom-votes` | MOM 투표 (경기 당일 자정 마감) | Member |
| `GET` | `/clubs/:clubId/matches/:matchId/mom-votes/result` | MOM 결과 (득표수·공동 수상 포함) | Member |

### 댓글

| Method | Endpoint | 설명 | Auth |
|---|---|---|---|
| `GET` | `/clubs/:clubId/matches/:matchId/comments` | 댓글 목록 | Member |
| `POST` | `/clubs/:clubId/matches/:matchId/comments` | 댓글 작성 (500자 제한) | Member |
| `DELETE` | `/clubs/:clubId/matches/:matchId/comments/:commentId` | 댓글 삭제 (작성자·관리자) | Member |

### 영상

| Method | Endpoint | 설명 | Auth |
|---|---|---|---|
| `POST` | `/clubs/:clubId/matches/:matchId/videos` | 유튜브 URL 등록 | Member |
| `DELETE` | `/clubs/:clubId/matches/:matchId/videos/:videoId` | 영상 삭제 (등록자·관리자) | Member |

### 상대팀 평가 (매칭전 한정)

| Method | Endpoint | 설명 | Auth |
|---|---|---|---|
| `POST` | `/clubs/:clubId/matches/:matchId/opponent-rating` | 상대팀 평가 제출 | Member |

---

## 4. 데이터 레이어 설계 (`client/src/features/match/data/`)

### Schemas (Zod)

```
match.schema.ts
  MatchTypeSchema         — z.enum(['LEAGUE', 'SELF'])
  MatchStatusSchema       — z.enum(['BEFORE', 'DURING', 'AFTER']) — 클라이언트 computed
  AttendanceResponseSchema — z.enum(['ATTEND', 'ABSENT', 'UNDECIDED'])

  MatchSummarySchema      — 투표 목록 카드용 (id, type, title, location, startAt, endAt, voteDeadline, myResponse, attendCount, absentCount)
  MatchDetailSchema       — 상세 (+ opponentName, opponentLevel, homeScore, awayScore, isRecordSubmitted, recordedAt)
  AttendanceSchema        — { userId, userName, avatarUrl, response }
  LineupSchema            — { quarters: QuarterSchema[] }
  QuarterSchema           — { quarterNumber, formation, team?, assignments: AssignmentSchema[] }
  AssignmentSchema        — { userId, position: FormationSlotSchema } // 실제 구현: userName 없음, position은 FormationSlot enum (LB, ST 등 세분화)
  GoalSchema              — { scorerUserId, assistUserId?, quarterNumber? } // 실제 구현: name 필드 없음
  MomResultSchema         — { winners: { userId, name, votes }[], totalVoters }
  MatchCommentSchema      — { id, authorId, authorName, avatarUrl, content, createdAt }
  MatchVideoSchema        — { id, youtubeUrl, registeredBy, createdAt }
  OpponentRatingSchema    — { score, review?, mvpName? }
  RecordHistorySchema     — { editedBy, editedAt, beforeData, afterData }

  CreateMatchSchema (Form) — title, type, location, address?, startAt, endAt, voteDeadline
  UpdateMatchSchema (Form) — Partial<CreateMatchSchema>
  RecordInputSchema (Form) — homeScore, awayScore, goals: GoalInputSchema[]
  GoalInputSchema          — scorerUserId, assistUserId(필수, 기획 변경 2026-04-14), quarterNumber(필수, 기획 변경 2026-04-14)
```

### Services (`data/services/match.service.ts`)

```
getMatches(clubId, params)            — GET /clubs/:clubId/matches
getMatchDetail(clubId, matchId)       — GET /clubs/:clubId/matches/:matchId
createMatch(clubId, dto)              — POST /clubs/:clubId/matches
updateMatch(clubId, matchId, dto)     — PATCH /clubs/:clubId/matches/:matchId
deleteMatch(clubId, matchId)          — DELETE /clubs/:clubId/matches/:matchId

submitAttendance(clubId, matchId, response) — POST .../attendances
getAttendances(clubId, matchId)             — GET .../attendances

getLineup(clubId, matchId)            — GET .../lineup
saveLineup(clubId, matchId, dto)      — PUT .../lineup
addParticipant(clubId, matchId, userId) — POST .../participants
removeParticipant(clubId, matchId, userId) — DELETE .../participants/:userId

submitRecord(clubId, matchId, dto)    — POST .../record
updateRecord(clubId, matchId, dto)    — PATCH .../record
getRecordHistories(clubId, matchId)   — GET .../record/histories

submitMomVote(clubId, matchId, targetUserId) — POST .../mom-votes
getMomResult(clubId, matchId)         — GET .../mom-votes/result

getComments(clubId, matchId)          — GET .../comments
createComment(clubId, matchId, dto)   — POST .../comments
deleteComment(clubId, matchId, commentId) — DELETE .../comments/:id

registerVideo(clubId, matchId, youtubeUrl)  — POST .../videos
deleteVideo(clubId, matchId, videoId)       — DELETE .../videos/:id

submitOpponentRating(clubId, matchId, dto)  — POST .../opponent-rating
```

### Hooks (`data/hooks/`)

```
useMatches(clubId, params)            — useSuspenseInfiniteQuery
useMatchDetail(clubId, matchId)       — useSuspenseQuery
useCreateMatch()                      — useMutation → invalidate matches
useUpdateMatch()                      — useMutation → invalidate matchDetail
useDeleteMatch()                      — useMutation → invalidate matches

useAttendances(clubId, matchId)       — useSuspenseQuery
useSubmitAttendance()                 — useMutation → invalidate attendances + matchDetail

useLineup(clubId, matchId)            — useSuspenseQuery
useSaveLineup()                       — useMutation → invalidate lineup

useSubmitRecord()                     — useMutation → invalidate matchDetail
useUpdateRecord()                     — useMutation → invalidate matchDetail
useRecordHistories(clubId, matchId)   — useSuspenseQuery

useMomResult(clubId, matchId)         — useSuspenseQuery (경기 기록 등록 후 활성화)
useSubmitMomVote()                    — useMutation → invalidate momResult

useMatchComments(clubId, matchId)     — useSuspenseInfiniteQuery
useCreateComment()                    — useMutation → invalidate comments
useDeleteComment()                    — useMutation → invalidate comments

useSubmitOpponentRating()             — useMutation → invalidate matchDetail
```

---

## 5. UI 레이어 설계 (`client/src/features/match/ui/`)

### Container

```
VoteListContainer        — useMatches, 상태 필터 탭(다가오는/지난 경기)
MatchDetailContainer     — useMatchDetail, 상태(BEFORE/DURING/AFTER) 분기 → 각 View에 전달
LineupContainer          — useLineup + useAttendances(참석 선수 자동 로드), useSaveLineup
RecordContainer          — useSubmitRecord, useUpdateRecord
MatchDetailTabContainer  — MOM/댓글/영상/평가 각 탭 컨테이너 분리
```

### View / Components

**투표 목록 (`view/VoteListView.tsx`)**
- 상태 필터 탭: 다가오는 경기 / 지난 경기
- `MatchCard`: 날짜·시간·상대팀·투표 현황 프로그레스바·내 투표 상태 칩
- 빈 상태: "등록된 경기가 없습니다"

**투표 등록/수정 폼 (`view/MatchFormView.tsx`)**
- 경기 유형 선택 (매칭전/자체전)
- 제목·날짜·시작시간·종료시간·장소·마감일 입력
- react-hook-form + Zod 유효성

**다가오는/오늘 경기 (`view/MatchProgressView.tsx`)**
- 경기 전 (BEFORE): D-Day, 투표 현황(참석/미정/불참 목록), 포메이션 미리보기, 상대팀 정보
  - 투표 버튼: 참석 / 불참 / 미정 (마감 전)
- 경기 중 (DURING): 상태 배너 + 현재 포메이션
- 경기 후 (AFTER): 기록 입력 CTA (관리자), MOM 투표 CTA (마감 전)

**포지션 배정 (`view/LineupView.tsx`)**
- 쿼터 탭 + 포메이션 선택
- 자체전: A팀/B팀 나누기
- 선수 목록 → 포지션 드래그 앤 드롭 (DraggableFlatList)
- 랜덤 배치 버튼 / 이미지 저장 버튼

**경기 기록 입력 (`view/RecordFormView.tsx`)**
- 스코어 입력 (홈/어웨이)
- 득점자 + 도움 선수 select (참여 선수 목록 기반)
- 쿼터 선택

**경기 상세 — 4탭 (`view/MatchDetailView.tsx`)**
- 헤더: 경기 날짜·상대팀·결과·스코어
- 탭1 기록: 득점·도움 타임라인, 쿼터별 선수 목록, MOM 투표 버튼
- 탭2 댓글: FlatList + 작성 바
- 탭3 영상: YouTube URL 등록·재생 (WebView)
- 탭4 상대팀 평가: 별점·리뷰·MVP 입력 (매칭전만 노출)

**경기 기록 목록 (`view/MatchRecordListView.tsx`)**
- 승/무/패 요약 배너
- 검색(날짜·참여선수·상대팀) + 필터
- `MatchRecordCard`: 날짜·상대팀·결과·스코어·득점자·MOM

### Components

```
components/
  MatchCard.tsx          — 투표 목록 카드
  MatchRecordCard.tsx    — 경기 기록 목록 카드
  AttendanceSummary.tsx  — 프로그레스바 + 인원 수
  AttendanceChip.tsx     — 참석/불참/미정 상태 칩
  FormationField.tsx     — 포메이션 시각화 (포지션별 슬롯)
  QuarterTab.tsx         — 쿼터 탭 네비게이터
  GoalTimeline.tsx       — 득점·도움 타임라인
  MomVoteList.tsx        — MOM 투표 선수 목록 (등번호·이름·포지션)
  OpponentRatingForm.tsx — 별점 + 리뷰 폼
```

---

## 6. 서버 레이어 설계 (`server/src/features/match/`)

### Prisma 스키마 추가 (신규 모델)

```prisma
enum MatchType {
  LEAGUE   // 매칭전
  SELF     // 자체전
}

enum AttendanceResponse {
  ATTEND
  ABSENT
  UNDECIDED
}

model Match {
  id                String      @id @default(cuid())
  clubId            String
  type              MatchType
  title             String
  location          String
  address           String?
  startAt           DateTime
  endAt             DateTime
  voteDeadline      DateTime
  // LEAGUE 전용 필드
  opponentName      String?
  opponentLevel     ClubLevel?
  // 경기 기록 (경기 후 관리자 입력)
  homeScore         Int?
  awayScore         Int?
  isRecordSubmitted Boolean     @default(false)
  recordedBy        String?
  recordedAt        DateTime?
  isDeleted         Boolean     @default(false)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  club              Club                 @relation(fields: [clubId], references: [id])
  attendances       MatchAttendance[]
  participants      MatchParticipant[]
  quarters          MatchQuarter[]
  goals             MatchGoal[]
  momVotes          MomVote[]
  comments          MatchComment[]
  videos            MatchVideo[]
  opponentRating    OpponentRating?
  recordHistories   MatchRecordHistory[]

  @@index([clubId, startAt])
  @@map("matches")
}

model MatchAttendance {
  id        String             @id @default(cuid())
  matchId   String
  userId    String
  response  AttendanceResponse @default(UNDECIDED)
  createdAt DateTime           @default(now())
  updatedAt DateTime           @updatedAt

  match     Match              @relation(fields: [matchId], references: [id], onDelete: Cascade)
  user      User               @relation(fields: [userId], references: [id])

  @@unique([matchId, userId])
  @@map("match_attendances")
}

model MatchParticipant {
  id      String @id @default(cuid())
  matchId String
  userId  String

  match   Match  @relation(fields: [matchId], references: [id], onDelete: Cascade)
  user    User   @relation(fields: [userId], references: [id])

  @@unique([matchId, userId])
  @@map("match_participants")
}

model MatchQuarter {
  id            String   @id @default(cuid())
  matchId       String
  quarterNumber Int      // 1~6
  formation     String   // "4-3-3"
  team          String?  // null=LEAGUE, "A"|"B"=SELF

  match         Match                    @relation(fields: [matchId], references: [id], onDelete: Cascade)
  assignments   MatchQuarterAssignment[]

  @@unique([matchId, quarterNumber, team])
  @@map("match_quarters")
}

model MatchQuarterAssignment {
  id        String         @id @default(cuid())
  quarterId String
  userId    String
  position  PlayerPosition

  quarter   MatchQuarter   @relation(fields: [quarterId], references: [id], onDelete: Cascade)

  @@unique([quarterId, userId])
  @@map("match_quarter_assignments")
}

model MatchGoal {
  id            String  @id @default(cuid())
  matchId       String
  scorerUserId  String
  assistUserId  String?
  quarterNumber Int?
  team          String? // SELF 경기용
  createdAt     DateTime @default(now())

  match         Match   @relation(fields: [matchId], references: [id], onDelete: Cascade)

  @@map("match_goals")
}

model MomVote {
  id           String   @id @default(cuid())
  matchId      String
  voterId      String
  targetUserId String
  createdAt    DateTime @default(now())

  match        Match    @relation(fields: [matchId], references: [id], onDelete: Cascade)

  @@unique([matchId, voterId])
  @@map("mom_votes")
}

model MatchComment {
  id        String   @id @default(cuid())
  matchId   String
  authorId  String
  content   String
  createdAt DateTime @default(now())

  match     Match    @relation(fields: [matchId], references: [id], onDelete: Cascade)
  author    User     @relation(fields: [authorId], references: [id])

  @@map("match_comments")
}

model MatchVideo {
  id           String   @id @default(cuid())
  matchId      String
  youtubeUrl   String
  registeredBy String
  createdAt    DateTime @default(now())

  match        Match    @relation(fields: [matchId], references: [id], onDelete: Cascade)

  @@map("match_videos")
}

model OpponentRating {
  id            String   @id @default(cuid())
  matchId       String   @unique
  ratedByUserId String
  score         Float    // 1.0~5.0
  review        String?
  mvpName       String?  // 상대팀 MOM (앱 미가입자이므로 이름만 저장)
  createdAt     DateTime @default(now())

  match         Match    @relation(fields: [matchId], references: [id], onDelete: Cascade)

  @@map("opponent_ratings")
}

model MatchRecordHistory {
  id         String   @id @default(cuid())
  matchId    String
  editedBy   String
  editedAt   DateTime @default(now())
  beforeData Json     // { homeScore, awayScore, goals }
  afterData  Json

  match      Match    @relation(fields: [matchId], references: [id], onDelete: Cascade)

  @@map("match_record_histories")
}
```

### DTO

```
CreateMatchDto         — title, type(MatchType), location, address?, startAt, endAt, voteDeadline
UpdateMatchDto         — Partial<CreateMatchDto>
SubmitAttendanceDto    — response: AttendanceResponse
SaveLineupDto          — quarters: SaveQuarterDto[]
SaveQuarterDto         — quarterNumber, formation, team?, assignments: AssignmentItemDto[]
AssignmentItemDto      — userId, position(PlayerPosition)
SubmitRecordDto        — homeScore, awayScore, goals: GoalItemDto[]
GoalItemDto            — scorerUserId, assistUserId?, quarterNumber?
UpdateRecordDto        — Partial<SubmitRecordDto>
SubmitMomVoteDto       — targetUserId
CreateCommentDto       — content (max 500자)
RegisterVideoDto       — youtubeUrl (URL 형식 검증)
SubmitOpponentRatingDto — score(1~5), review?(max 500자), mvpName?(max 50자)
```

### Service 메서드

```typescript
MatchService
  createMatch(clubId, userId, dto)
  getMatches(clubId, params: { status?, type?, cursor?, limit })
  getMatchDetail(clubId, matchId, userId)
  updateMatch(clubId, matchId, userId, dto)         // voteDeadline 전 검증
  deleteMatch(clubId, matchId, userId)

  submitAttendance(clubId, matchId, userId, dto)    // upsert
  getAttendances(clubId, matchId)

  getLineup(clubId, matchId)
  saveLineup(clubId, matchId, userId, dto)          // 전체 교체 (트랜잭션)
  addParticipant(clubId, matchId, userId, targetId)
  removeParticipant(clubId, matchId, userId, targetId)

  submitRecord(clubId, matchId, userId, dto)        // 경기 후만 허용
  updateRecord(clubId, matchId, userId, dto)        // 이력 저장
  getRecordHistories(clubId, matchId, userId)

  submitMomVote(clubId, matchId, userId, dto)       // 당일 자정 마감
  getMomResult(clubId, matchId)

  getComments(clubId, matchId, params)
  createComment(clubId, matchId, userId, dto)
  deleteComment(clubId, matchId, commentId, userId)

  registerVideo(clubId, matchId, userId, dto)
  deleteVideo(clubId, matchId, videoId, userId)

  submitOpponentRating(clubId, matchId, userId, dto) // LEAGUE + isRecordSubmitted 검증
```

### Controller 엔드포인트

`MatchController` — `@Controller('clubs/:clubId/matches')` + `@UseGuards(AuthGuard)`

모든 엔드포인트에 `@ApiOperation`, `@ApiResponse` 데코레이터 필수.

---

## 7. 예외 처리

### 신규 에러 코드 (MATCH 도메인)

| 코드 | 설명 | HTTP |
|---|---|---|
| `MATCH_001` | 존재하지 않는 경기 | 404 |
| `MATCH_002` | 경기 수정 권한 없음 (관리자 아님) | 403 |
| `MATCH_003` | 투표 마감 후 투표 변경 불가 | 422 |
| `MATCH_004` | 경기 종료 전 기록 입력 불가 | 422 |
| `MATCH_005` | MOM 투표 마감 (경기 당일 자정 경과) | 422 |
| `MATCH_006` | 이미 MOM 투표 완료 (1인 1표) | 409 |
| `MATCH_007` | 상대팀 평가 권한 없음 (매칭전 아님 또는 기록 미등록) | 422 |
| `MATCH_008` | 이미 제출한 상대팀 평가 | 409 |
| `MATCH_009` | 마감된 투표 수정 불가 (관리자 예외 처리 별도) | 422 |
| `MATCH_010` | 존재하지 않는 참여 선수 (포지션 배정 시) | 404 |

### 클라이언트 처리

| 상황 | 처리 방법 |
|---|---|
| 투표 마감 후 버튼 클릭 | 버튼 비활성화 (UI 레벨에서 차단) |
| MOM 투표 마감 | MOM 투표 버튼 비활성화 + "투표가 마감되었습니다" |
| 중복 투표 (MATCH_006) | "이미 투표하셨습니다" 토스트 |
| 경기 기록 입력 (경기 전) | 기록 버튼 미노출 (AFTER 상태에서만 활성화) |
| 관리자 전용 라우트 직접 접근 | 권한 없음 — 뒤로 리다이렉트 |

---

## 8. 구현 체크리스트

### Prisma 스키마

- [ ] Match, MatchAttendance, MatchParticipant 모델 추가
- [ ] MatchQuarter, MatchQuarterAssignment 모델 추가
- [ ] MatchGoal, MomVote 모델 추가
- [ ] MatchComment, MatchVideo 모델 추가
- [ ] OpponentRating, MatchRecordHistory 모델 추가
- [ ] `prisma migrate dev --name add-match-models` 실행
- [ ] `/erd` 실행해 ERD 갱신

### 서버

- [ ] `nest g module features/match` / `service` / `controller`
- [ ] DTO 정의 (CreateMatchDto 외 전체)
- [ ] MatchService 구현 (createMatch ~ submitOpponentRating)
- [ ] MatchController 구현 + Swagger 데코레이터
- [ ] 에러 코드 MATCH_001~010 추가 (`error_handling_filter.md` 반영)
- [ ] Club relation에 matches 추가 (`schema.prisma`)

### 클라이언트 Data Layer

- [ ] `cd client && npm run feature match`
- [ ] `match.schema.ts` — Zod 스키마 전체 정의
- [ ] `match.service.ts` — 서비스 함수 전체 구현
- [ ] 훅 전체 구현 (useMatches ~ useSubmitOpponentRating)
- [ ] `matchQueryKeys` 상수 정의

### 클라이언트 UI Layer

- [ ] VoteListContainer / VoteListView
- [ ] MatchDetailContainer / MatchProgressView (BEFORE/DURING/AFTER 상태 분기)
- [ ] LineupContainer / LineupView (포지션 드래그 앤 드롭)
- [ ] RecordContainer / RecordFormView
- [ ] MatchDetailTabContainer / MatchDetailView (4탭)
- [ ] MatchRecordListView
- [ ] 빈 상태 UI 전체 (EmptyBoundary 처리)
- [ ] 스켈레톤 UI 전체 (AsyncBoundary 처리)

### 테스트

- [ ] `/case match` 실행 → cases.md 생성
- [ ] `/seed match` 실행 → 경기 데이터 포함 seed
