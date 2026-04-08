# Club Plan

## 1. 기능 개요

**목적**: 아마추어 축구팀의 생성·운영·관리 전 사이클을 지원한다. 팀 생성부터 팀원 관리, 게시판, 강퇴·해체까지 클럽 도메인의 핵심 기능을 제공한다.

**핵심 사용자 시나리오**

| 시나리오 | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| 클럽 생성 | 인증된 유저, 소속 팀 없음 | 3단계 Funnel 완료 | 클럽 생성 + 주장 역할 자동 부여 + 초대 코드 발급 |
| 초대 코드로 가입 | 소속 팀 없는 유저, 유효한 코드 보유 | 코드 입력 후 제출 | ClubJoinRequest 생성 (PENDING) |
| 가입 신청 승인 | 주장·부주장 역할 보유 | 신청 승인 버튼 클릭 | ClubMember 생성 + 인원 초과 시 모집 자동 마감 |
| 팀원 강퇴 | 주장·부주장, 대상 팀원 존재 | 강퇴 실행 | 트랜잭션: Role 제거 → ClubMember 삭제 → BanRecord 생성 |
| 팀 해체 (다수) | 주장, 팀원 2명 이상 | 해체 요청 | 동의 요청 알림 발송 + 48h 타임아웃 설정 |
| 팀 해체 (1인) | 주장, 혼자뿐 | 해체 요청 | 즉시 해체 처리 |
| 게시글 작성 | 팀원 | 제목·내용 입력 후 제출 | 게시글 저장 + 팀원 알림 전송(선택) |

---

## 2. 클라이언트 라우트

| 경로 | 설명 | 내비게이션 타입 |
|------|------|----------------|
| `(app)/club/index` | 클럽 탭 홈 (소속 팀 있음: 대시보드 / 없음: 빈 상태 + 생성·검색 CTA) | Bottom Tab |
| `(app)/club/create` | 클럽 생성 Funnel (3단계) | Modal Stack |
| `(app)/club/search` | 클럽 검색 | Stack Push |
| `(app)/club/[clubId]/join` | 가입 신청 페이지 | Stack Push |
| `(app)/club/[clubId]/join-requests` | 가입 신청 관리 (관리자) | Stack Push |
| `(app)/club/[clubId]/members` | 팀원 목록 | Stack Push |
| `(app)/club/[clubId]/members/[memberId]` | 팀원 상세 (FIFA 카드) | Stack Push |
| `(app)/club/[clubId]/board` | 클럽 게시판 목록 | Stack Push |
| `(app)/club/[clubId]/board/[postId]` | 게시글 상세 | Stack Push |
| `(app)/club/[clubId]/board/write` | 게시글 작성·수정 | Modal Stack |
| `(app)/club/[clubId]/invite` | 초대 코드 확인·복사 | Stack Push |
| `(app)/club/invite-enter` | 초대 코드 직접 입력 | Modal Stack |
| `(app)/club/[clubId]/settings` | 클럽 설정 (권한 이전·해체·나가기) | Stack Push |
| `(app)/club/[clubId]/transfer-captain` | 권한 이전 (주장 전용) | Stack Push |

---

## 3. API 설계

### 클럽 CRUD

| Method | Endpoint | 설명 | Auth |
|--------|----------|------|------|
| `POST` | `/clubs` | 클럽 생성 | Required |
| `GET` | `/clubs/my` | 내 소속 클럽 조회 | Required |
| `GET` | `/clubs/:clubId` | 클럽 상세 조회 | Required |
| `PATCH` | `/clubs/:clubId` | 클럽 정보 수정 | Captain |
| `DELETE` | `/clubs/:clubId/dissolve` | 해체 요청 | Captain |

### 팀원 관리

| Method | Endpoint | 설명 | Auth |
|--------|----------|------|------|
| `GET` | `/clubs/:clubId/members` | 팀원 목록 (커서 페이지) | Member |
| `GET` | `/clubs/:clubId/members/:userId` | 팀원 상세 | Member |
| `PATCH` | `/clubs/:clubId/members/:userId/stats` | 능력치 수정 | Captain·Vice |
| `DELETE` | `/clubs/:clubId/members/:userId/kick` | 강퇴 | Captain·Vice |
| `PATCH` | `/clubs/:clubId/members/:userId/role` | 역할 변경 (부주장 임명·해제) | Captain |
| `POST` | `/clubs/:clubId/transfer-captain` | 주장 권한 이전 | Captain |
| `DELETE` | `/clubs/:clubId/leave` | 클럽 탈퇴 | Member |

### 가입 신청

| Method | Endpoint | 설명 | Auth |
|--------|----------|------|------|
| `POST` | `/clubs/:clubId/join-requests` | 가입 신청 | Required |
| `DELETE` | `/clubs/:clubId/join-requests/mine` | 신청 취소 | Required |
| `GET` | `/clubs/:clubId/join-requests` | 신청 목록 (커서 페이지) | Captain·Vice |
| `PATCH` | `/clubs/:clubId/join-requests/:requestId/approve` | 승인 | Captain·Vice |
| `PATCH` | `/clubs/:clubId/join-requests/:requestId/reject` | 거절 | Captain·Vice |

### 초대 코드

| Method | Endpoint | 설명 | Auth |
|--------|----------|------|------|
| `GET` | `/clubs/:clubId/invite-code` | 현재 초대 코드 조회 | Captain·Vice |
| `POST` | `/clubs/:clubId/invite-code/renew` | 코드 재발급 | Captain·Vice |
| `POST` | `/clubs/join-by-code` | 코드 입력 → 가입 신청 생성 | Required · Rate Limit |

### 해체 투표

| Method | Endpoint | 설명 | Auth |
|--------|----------|------|------|
| `POST` | `/clubs/:clubId/dissolve-vote` | 해체 투표 시작 | Captain |
| `PATCH` | `/clubs/:clubId/dissolve-vote/respond` | 동의·거절 응답 | Member |

### 게시판

| Method | Endpoint | 설명 | Auth |
|--------|----------|------|------|
| `GET` | `/clubs/:clubId/posts` | 게시글 목록 (커서 페이지, type 필터) | Member |
| `POST` | `/clubs/:clubId/posts` | 게시글 작성 | Member |
| `GET` | `/clubs/:clubId/posts/:postId` | 게시글 상세 | Member |
| `PATCH` | `/clubs/:clubId/posts/:postId` | 게시글 수정 | Author |
| `DELETE` | `/clubs/:clubId/posts/:postId` | 게시글 삭제 | Author·Captain |
| `GET` | `/clubs/:clubId/posts/:postId/comments` | 댓글 목록 | Member |
| `POST` | `/clubs/:clubId/posts/:postId/comments` | 댓글 작성 | Member |
| `DELETE` | `/clubs/:clubId/posts/:postId/comments/:commentId` | 댓글 삭제 | Author·Captain |

### 클럽 검색

| Method | Endpoint | 설명 | Auth |
|--------|----------|------|------|
| `GET` | `/clubs/search` | 클럽 검색 (name·regionId·nearby) | Required |
| `GET` | `/clubs/recommended` | 추천 클럽 (preferredRegion 기준) | Required |

---

## 4. 데이터 레이어 설계 (`client/src/features/club/data/`)

### Schemas (Zod)

```
schemas/
├── club.schema.ts          # ClubSchema, ClubPreviewSchema, ClubDetailSchema
├── clubMember.schema.ts    # ClubMemberSchema, MemberStatsSchema
├── joinRequest.schema.ts   # JoinRequestSchema, JoinRequestListSchema
├── inviteCode.schema.ts    # InviteCodeSchema
├── dissolveVote.schema.ts  # DissolveVoteSchema, DissolveResponseSchema
├── post.schema.ts          # PostSchema, PostListSchema, PostDetailSchema
└── comment.schema.ts       # CommentSchema, CommentListSchema
```

**주요 스키마 필드**

| 스키마 | 주요 필드 |
|--------|-----------|
| `ClubDetailSchema` | `id`, `name`, `regionId`, `level`, `maxMemberCount`, `currentMemberCount`, `mannerScoreAvg`, `recruitmentStatus`, `logoUrl`, `description`, `myRole` |
| `ClubMemberSchema` | `userId`, `name`, `jerseyNumber`, `role`, `position`, `mannerScore`, `stats{goals,assists,momCount,matchCount}` |
| `PostSchema` | `id`, `type`, `title`, `content`, `isPinned`, `viewCount`, `commentCount`, `author`, `createdAt` |
| `InviteCodeSchema` | `code`, `expiresAt`, `isExpired` |

### Services

```
services/
├── club.service.ts          # createClub, getMyClub, getClubDetail, updateClub
├── clubMember.service.ts    # getMembers, getMember, kickMember, leaveClub, updateStats, changeRole, transferCaptain
├── joinRequest.service.ts   # createRequest, cancelRequest, getRequests, approveRequest, rejectRequest
├── inviteCode.service.ts    # getInviteCode, renewInviteCode, joinByCode
├── dissolveVote.service.ts  # startDissolveVote, respondDissolveVote
├── post.service.ts          # getPosts, createPost, getPostDetail, updatePost, deletePost
├── comment.service.ts       # getComments, createComment, deleteComment
└── clubSearch.service.ts    # searchClubs, getRecommendedClubs
```

### Hooks

```
hooks/
├── useClub.ts               # useMyClub(), useClubDetail(clubId)
├── useClubMutation.ts       # useCreateClub(), useUpdateClub(), useLeaveClub()
├── useClubMembers.ts        # useClubMembers(clubId) — InfiniteQuery
├── useMemberDetail.ts       # useMemberDetail(clubId, userId)
├── useMemberMutation.ts     # useKickMember(), useUpdateMemberStats(), useChangeRole(), useTransferCaptain()
├── useJoinRequest.ts        # useJoinRequests(clubId) — InfiniteQuery
├── useJoinRequestMutation.ts # useCreateJoinRequest(), useCancelJoinRequest(), useApproveRequest(), useRejectRequest()
├── useInviteCode.ts         # useInviteCode(clubId)
├── useInviteCodeMutation.ts # useRenewInviteCode(), useJoinByCode()
├── useDissolveVote.ts       # useDissolveVote(clubId)
├── useDissolveVoteMutation.ts # useStartDissolveVote(), useRespondDissolveVote()
├── usePosts.ts              # usePosts(clubId, type) — InfiniteQuery
├── usePostDetail.ts         # usePostDetail(clubId, postId) — viewCount Redis INCR 트리거
├── usePostMutation.ts       # useCreatePost(), useUpdatePost(), useDeletePost()
├── useComments.ts           # useComments(postId) — InfiniteQuery
├── useCommentMutation.ts    # useCreateComment(), useDeleteComment()
└── useClubSearch.ts         # useClubSearch(params) — InfiniteQuery, useRecommendedClubs()
```

**Query Key 상수**

```ts
// data/hooks/clubQueryKeys.ts
export const clubQueryKeys = {
  myClub: ['club', 'my'],
  detail: (id: string) => ['club', id],
  members: (id: string) => ['club', id, 'members'],
  member: (clubId: string, userId: string) => ['club', clubId, 'members', userId],
  joinRequests: (id: string) => ['club', id, 'join-requests'],
  inviteCode: (id: string) => ['club', id, 'invite-code'],
  dissolveVote: (id: string) => ['club', id, 'dissolve-vote'],
  posts: (id: string, type?: string) => ['club', id, 'posts', type],
  post: (clubId: string, postId: string) => ['club', clubId, 'posts', postId],
  comments: (postId: string) => ['club', 'posts', postId, 'comments'],
  search: (params: object) => ['club', 'search', params],
  recommended: ['club', 'recommended'],
} as const;
```

---

## 5. UI 레이어 설계 (`client/src/features/club/ui/`)

### Container

| Container | 역할 |
|-----------|------|
| `ClubTabContainer` | useMyClub() → 소속 여부 분기 (대시보드 or 빈 상태 CTA) |
| `ClubCreateContainer` | useCreateClub() + react-hook-form + Zod 3단계 Funnel 조립 |
| `ClubSearchContainer` | useClubSearch() + useRecommendedClubs() 검색 필터 상태 관리 |
| `JoinRequestContainer` | useCreateJoinRequest() + 신청 상태 확인 → 버튼 텍스트 분기 |
| `JoinRequestsManageContainer` | useJoinRequests() + useApproveRequest() + useRejectRequest() |
| `MemberListContainer` | useClubMembers() InfiniteQuery 로드 + 검색·필터 상태 |
| `MemberDetailContainer` | useMemberDetail() + useUpdateMemberStats() 권한 분기 |
| `BoardContainer` | usePosts() InfiniteQuery + 탭 필터 상태 |
| `PostDetailContainer` | usePostDetail() (조회 시 viewCount INCR) + useComments() |
| `PostWriteContainer` | useCreatePost() / useUpdatePost() + react-hook-form |
| `InviteCodeContainer` | useInviteCode() + useRenewInviteCode() + Clipboard |
| `InviteEnterContainer` | useJoinByCode() + 에러 팝업 분기 |
| `DissolveVoteContainer` | useDissolveVote() + useRespondDissolveVote() + 만료 여부 표시 |
| `ClubSettingsContainer` | 권한 이전·해체·나가기 액션 조립 |

### View / Components

**View 목록**

| View | 4-State 처리 |
|------|-------------|
| `ClubTabView` | Loading: Skeleton / Empty: `NoClubView` (생성·검색 CTA) / Data: 대시보드 |
| `ClubCreateView` | Funnel Step 1~3 레이아웃 |
| `ClubSearchView` | Loading: Skeleton / Empty: "검색 결과 없음" / Data: 클럽 카드 목록 |
| `JoinRequestView` | 신청자 정보 + 자유 텍스트 입력 |
| `JoinRequestsManageView` | Loading: Skeleton / Empty: "신청이 없습니다" / Data: 신청자 카드 목록 |
| `MemberListView` | Loading: Skeleton / Empty: 빈 팀원 안내 / Data: 팀원 카드 목록 |
| `MemberDetailView` | FIFA 카드 스타일 (회전 진입 애니메이션 · 터치 확대) |
| `BoardView` | 탑탭(전체·공지·문의) + 게시글 목록 |
| `PostDetailView` | 게시글 본문 + 댓글 목록 |
| `PostWriteView` | 제목·본문 입력 폼 + 스위치 (고정·알림) |
| `InviteCodeView` | 코드 표시 + 복사 버튼 + 남은 유효기간 |
| `DissolveVoteView` | 동의·거절 버튼 + 타임아웃 만료 안내 |

**주요 Components**

```
components/
├── ClubPreviewCard.tsx      # 검색 결과 클럽 카드 (이미지·이름·레벨·평점·인원·모집상태)
├── MemberCard.tsx           # 팀원 목록 아이템
├── FifaCard.tsx             # 팀원 상세 FIFA 스타일 카드 (애니메이션 포함)
├── JoinRequestCard.tsx      # 신청자 카드 (승인·거절 버튼)
├── PostListItem.tsx         # 게시글 목록 아이템 (NEW 뱃지·조회수·댓글수)
├── CommentItem.tsx          # 댓글 아이템
├── ClubStatsBar.tsx         # 전적 요약 (경기수·승·무·패·승률)
├── MatchPreviewCard.tsx     # 이번 주 경기 프리뷰
├── InviteCodeBox.tsx        # 코드 표시 + 복사 UI
└── RecruitmentBadge.tsx     # 모집중·마감 뱃지
```

---

## 6. 서버 레이어 설계 (`server/src/features/club/`)

### Prisma 스키마 (신규 모델)

```prisma
enum ClubLevel { BEGINNER AMATEUR SEMI_PRO PRO }
enum RecruitmentStatus { OPEN CLOSED }
enum ClubRole { CAPTAIN VICE_CAPTAIN MEMBER }
enum JoinRequestStatus { PENDING APPROVED REJECTED }
enum PostType { NOTICE GENERAL INQUIRY }
enum DissolveVoteStatus { IN_PROGRESS APPROVED REJECTED EXPIRED }

model Club {
  id                String            @id @default(cuid())
  name              String
  regionId          String
  level             ClubLevel
  maxMemberCount    Int               // 2–50
  currentMemberCount Int             @default(1)
  mannerScoreAvg    Float             @default(100)
  recruitmentStatus RecruitmentStatus @default(OPEN)
  logoUrl           String?
  description       String?
  isDeleted         Boolean           @default(false)
  deletedAt         DateTime?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  region            Region            @relation(fields: [regionId], references: [id])
  members           ClubMember[]
  joinRequests      ClubJoinRequest[]
  inviteCodes       ClubInviteCode[]
  banRecords        ClubBanRecord[]
  dissolveVotes     ClubDissolveVote[]
  posts             Post[]

  @@map("clubs")
}

model ClubMember {
  id           String    @id @default(cuid())
  clubId       String
  userId       String
  role         ClubRole  @default(MEMBER)
  jerseyNumber Int?
  // 능력치
  speed        Int?
  shoot        Int?
  pass         Int?
  dribble      Int?
  defense      Int?
  physical     Int?
  isStatsPublic Boolean  @default(true)
  joinedAt     DateTime  @default(now())

  club         Club      @relation(fields: [clubId], references: [id])
  user         User      @relation(fields: [userId], references: [id])

  @@unique([clubId, userId])
  @@unique([clubId, jerseyNumber])
  @@map("club_members")
}

model ClubJoinRequest {
  id        String            @id @default(cuid())
  clubId    String
  userId    String
  message   String?           @db.VarChar(500)
  status    JoinRequestStatus @default(PENDING)
  createdAt DateTime          @default(now())

  club      Club              @relation(fields: [clubId], references: [id])
  user      User              @relation(fields: [userId], references: [id])

  @@unique([clubId, userId])
  @@map("club_join_requests")
}

model ClubInviteCode {
  id        String   @id @default(cuid())
  clubId    String
  code      String   @unique
  expiresAt DateTime
  createdBy String
  createdAt DateTime @default(now())

  club      Club     @relation(fields: [clubId], references: [id])

  @@map("club_invite_codes")
}

model ClubBanRecord {
  id        String   @id @default(cuid())
  clubId    String
  userId    String
  bannedBy  String
  bannedAt  DateTime @default(now())

  club      Club     @relation(fields: [clubId], references: [id])

  @@map("club_ban_records")
}

model ClubDissolveVote {
  id          String            @id @default(cuid())
  clubId      String
  initiatedBy String
  status      DissolveVoteStatus @default(IN_PROGRESS)
  expiresAt   DateTime          // 시작 시각 + 48h
  createdAt   DateTime          @default(now())

  club        Club              @relation(fields: [clubId], references: [id])
  responses   ClubDissolveVoteResponse[]

  @@map("club_dissolve_votes")
}

model ClubDissolveVoteResponse {
  id      String  @id @default(cuid())
  voteId  String
  userId  String
  agreed  Boolean

  vote    ClubDissolveVote @relation(fields: [voteId], references: [id])

  @@unique([voteId, userId])
  @@map("club_dissolve_vote_responses")
}

model Post {
  id          String   @id @default(cuid())
  clubId      String
  authorId    String
  type        PostType @default(GENERAL)
  title       String   @db.VarChar(100)
  content     String   @db.VarChar(2000)
  isPinned    Boolean  @default(false)
  viewCount   Int      @default(0)
  commentCount Int     @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  club        Club     @relation(fields: [clubId], references: [id])
  author      User     @relation(fields: [authorId], references: [id])
  comments    Comment[]

  @@map("posts")
}

model Comment {
  id        String   @id @default(cuid())
  postId    String
  authorId  String
  content   String   @db.VarChar(500)
  createdAt DateTime @default(now())

  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  author    User     @relation(fields: [authorId], references: [id])

  @@map("comments")
}
```

### DTO

```
dto/
├── create-club.dto.ts           # name, regionId, level, maxMemberCount(2–50), description?, logoUrl?
├── update-club.dto.ts           # PartialType(CreateClubDto) + recruitmentStatus?
├── create-join-request.dto.ts   # message?(VarChar 500, sanitize-html 처리)
├── respond-join-request.dto.ts  # action: 'approve' | 'reject'
├── join-by-code.dto.ts          # code: string
├── update-member-stats.dto.ts   # speed?, shoot?, pass?, dribble?, defense?, physical?, isStatsPublic?
├── change-role.dto.ts           # role: 'VICE_CAPTAIN' | 'MEMBER'
├── transfer-captain.dto.ts      # targetUserId: string
├── leave-club.dto.ts            # reason: enum
├── respond-dissolve-vote.dto.ts # agreed: boolean
├── create-post.dto.ts           # type, title(100), content(2000), isPinned?, sendNotification?
├── update-post.dto.ts           # PartialType(CreatePostDto)
└── create-comment.dto.ts        # content(500, sanitize-html 처리)
```

### Service 메서드

**ClubService**
- `createClub(userId, dto)` — 클럽 생성 + CAPTAIN 역할 자동 부여 + 초대 코드 발급 트랜잭션
- `getMyClub(userId)` — 소속 클럽 조회 (없으면 null)
- `getClubDetail(clubId, userId)` — 상세 + myRole 포함
- `updateClub(clubId, userId, dto)` — Captain 권한 체크
- `dissolveClub(clubId, userId)` — 1인 즉시 해체 / 다수 투표 시작 분기

**ClubMemberService**
- `getMembers(clubId, cursor, limit)` — 커서 페이지네이션
- `kickMember(clubId, kickerId, targetUserId)` — 트랜잭션: Role 제거 → Member 삭제 → BanRecord 생성
- `leaveClub(clubId, userId, reason)` — 부주장이면 역할 자동 해제 후 탈퇴 / 주장은 권한 이전 없이 불가
- `updateMemberStats(clubId, requesterId, targetUserId, dto)` — Captain·Vice 또는 본인(최초) 체크
- `changeRole(clubId, captainId, targetUserId, dto)`
- `transferCaptain(clubId, captainId, dto)` — 역할 이전 후 기존 주장 MEMBER로

**ClubJoinRequestService**
- `createRequest(clubId, userId, dto)` — 중복·강퇴 이력·팀 소속 여부 체크 + sanitize-html
- `cancelRequest(clubId, userId)`
- `getRequests(clubId, requesterId, cursor)` — Captain·Vice 전용
- `approveRequest(clubId, requesterId, requestId)` — 승인 + currentMemberCount 증가 + 인원 도달 시 CLOSED 자동 전환
- `rejectRequest(clubId, requesterId, requestId)`

**ClubInviteCodeService**
- `getOrCreateCode(clubId)` — 유효한 코드 있으면 반환, 없으면 신규 발급
- `renewCode(clubId, userId)` — Captain·Vice 전용
- `joinByCode(code, userId)` — 만료·중복·강퇴 체크 → JoinRequest 생성 (Rate Limit은 Guard 레벨)

**ClubDissolveVoteService**
- `startVote(clubId, captainId)` — expiresAt = now + 48h 저장
- `respondVote(clubId, userId, dto)` — expiresAt 만료 체크 + 응답 저장 + 전원 동의 여부 판정
- `checkAndFinalizeVote(voteId)` — 잔류 팀원 전원 동의(탈퇴·강퇴자 자동 동의 간주) 시 해체 트랜잭션

**PostService**
- `getPosts(clubId, type?, cursor)` — 커서 페이지네이션 + isPinned 우선 정렬
- `createPost(clubId, authorId, dto)` — sanitize-html + 알림 발송(선택)
- `getPostDetail(clubId, postId)` — Redis `INCR post:{id}:views`
- `updatePost(clubId, postId, userId, dto)` — 작성자 본인 체크
- `deletePost(clubId, postId, userId)` — 작성자 or Captain 체크
- `flushViewCountsToDB()` — Redis → DB 일괄 flush (별도 스케줄 또는 임계값 트리거)

**CommentService**
- `getComments(postId, cursor)` — 커서 페이지네이션
- `createComment(postId, authorId, dto)` — sanitize-html + commentCount +1
- `deleteComment(postId, commentId, userId)` — 작성자 or Captain 체크 + commentCount -1

### Controller 엔드포인트 요약

```
server/src/features/club/
├── club.controller.ts
├── club-member.controller.ts
├── club-join-request.controller.ts
├── club-invite-code.controller.ts
├── club-dissolve-vote.controller.ts
├── post.controller.ts
└── comment.controller.ts
```

모든 Controller는 `@UseGuards(AuthGuard)` 적용. 관리자 전용 엔드포인트는 추가로 `@Roles(ClubRole.CAPTAIN, ClubRole.VICE_CAPTAIN)` 가드 적용.

---

## 7. 예외 처리

### 클럽 도메인 에러 코드 (신규 정의)

| 코드 | 설명 | HTTP |
|------|------|------|
| `CLUB_001` | 존재하지 않는 클럽 | 404 |
| `CLUB_002` | 클럽 권한 없음 (Captain·Vice 전용) | 403 |
| `CLUB_003` | 이미 팀에 소속된 유저 | 409 |
| `CLUB_004` | 팀 정원 초과 | 409 |
| `CLUB_005` | 강퇴된 유저 — 재가입 불가 | 403 |
| `CLUB_006` | 이미 가입 신청 중 | 409 |
| `CLUB_007` | 초대 코드 만료 | 410 |
| `CLUB_008` | 유효하지 않은 초대 코드 | 404 |
| `CLUB_009` | 주장 권한 이전 없이 탈퇴 불가 | 403 |
| `CLUB_010` | 해체 투표 진행 중 — 중복 요청 불가 | 409 |
| `CLUB_011` | 해체 투표 만료 | 410 |
| `POST_001` | 존재하지 않는 게시글 | 404 |
| `POST_002` | 게시글 수정 권한 없음 | 403 |
| `POST_003` | 게시글 삭제 권한 없음 | 403 |
| `COMMENT_001` | 댓글 삭제 권한 없음 | 403 |

### 클라이언트 에러 처리 매핑

| 에러 코드 | 클라이언트 처리 |
|-----------|----------------|
| `CLUB_003` | 토스트: "이미 가입된 팀입니다" |
| `CLUB_004` | 토스트: "팀 정원이 초과되었습니다" |
| `CLUB_005` | 팝업: "강퇴된 팀에는 재가입할 수 없습니다" |
| `CLUB_006` | 버튼 → "신청 취소"로 변경 (이미 신청 상태 반영) |
| `CLUB_007` | 팝업: "초대 코드가 만료됐습니다. 팀 관리자에게 재발급을 요청하세요" |
| `CLUB_008` | 팝업: "유효하지 않은 초대 코드입니다" |
| `CLUB_009` | 탈퇴 버튼 비활성화 + 안내: "권한 이전 후 탈퇴 가능합니다" |
| `429` (Rate Limit) | 토스트: "잠시 후 다시 시도해주세요" |

---

## 8. 구현 체크리스트

### 서버

- [ ] Prisma 스키마 8개 모델 추가 후 마이그레이션
- [ ] `User` 모델에 `ClubMember`, `ClubJoinRequest`, `Post`, `Comment` relation 추가
- [ ] `sanitize-html` 패키지 설치 + 전역 Sanitize Interceptor 구현
- [ ] `helmet` 패키지 설치 + `main.ts`에 적용
- [ ] `@nestjs/throttler` Rate Limit — `/clubs/join-by-code` IP당 10회/분
- [ ] 클럽 도메인 에러 코드 (`CLUB_001`~`CLUB_011`, `POST_001`~`POST_003`, `COMMENT_001`) 등록
- [ ] `ClubModule`, `PostModule`, `CommentModule` 생성 (nest g module/service/controller)
- [ ] `createClub` — 트랜잭션: 클럽 생성 + CAPTAIN 멤버십 + 초대 코드 발급
- [ ] `approveRequest` — 승인 + `currentMemberCount` 증가 + `maxMemberCount` 도달 시 `CLOSED` 자동 전환
- [ ] `kickMember` — Prisma `$transaction`: Role 제거 → 멤버십 삭제 → BanRecord 생성
- [ ] `leaveClub` — 부주장 역할 자동 해제 트랜잭션
- [ ] `dissolveClub` — 1인 즉시 해체 / 다수 투표 분기, 해체 확정 시 Pending 신청 자동 거절
- [ ] `respondVote` — `expiresAt` 만료 체크(서버 시각 기준), 탈퇴·강퇴자 자동 동의 간주 로직
- [ ] `getPostDetail` — Redis `INCR post:{id}:views` (Redis 장애 시 유실 허용, catch 처리)
- [ ] `flushViewCounts` — Redis → DB flush 로직 (임계값 100 도달 시 또는 별도 트리거)
- [ ] `mannerScoreAvg` 재계산 헬퍼 — 팀원 변동 및 개인 mannerScore 변경 시 호출
- [ ] 모든 컨트롤러 `@ApiOperation`, `@ApiResponse` Swagger 문서화

### 클라이언트

- [ ] `client/src/features/club/` 스캐폴딩 (`npm run feature club`)
- [ ] 온보딩 폼에 `preferredRegionId` 필드 추가
- [ ] 모든 Zod 스키마 정의 + 서비스에서 `.parse()` 적용
- [ ] `clubQueryKeys` 상수 정의
- [ ] 클럽 탭 빈 상태(`NoClubView`) — 생성·검색 CTA 포함
- [ ] 가입 신청 관리 빈 상태 — "신청이 없습니다" 표시
- [ ] 클럽 생성 3단계 Funnel — `BottomCTASingle`/`BottomCTADouble` 사용
- [ ] FIFA 카드 진입 애니메이션 (카드 회전 + 빛 이펙트)
- [ ] 게시글 상세 진입 시 `usePostDetail` 호출 → Redis INCR 트리거
- [ ] 초대 코드 만료·무효 에러 팝업 처리 (`ConfirmDialog` 사용)
- [ ] 강퇴·블랙리스트 에러 팝업 처리
- [ ] 주장 탈퇴 시 탈퇴 버튼 비활성화 + 권한 이전 안내
- [ ] 해체 투표 만료 여부 서버 응답 기반 UI 표시
- [ ] 모든 리스트 화면 InfiniteQuery + 무한 스크롤 (`FlatList` + `onEndReached`)
- [ ] 4-state (Loading Skeleton / Error / Empty / Data) 전 화면 적용
- [ ] `@ui` 컴포넌트만 사용 — 인라인 스타일 금지
