# Matching Plan

## 1. 기능 개요

- **목적**: 아마추어 축구팀이 상대팀을 모집·탐색하고 매칭을 성사시키는 독립 탭 기능
- **핵심 사용자 시나리오**:

```
[게시글 등록]
GIVEN  클럽 관리자(주장/부주장)로 로그인한 상태
WHEN   매칭 탭 → 매칭 등록 버튼을 누르고 정보를 입력 후 등록
THEN   게시글이 OPEN 상태로 전체 목록에 노출됨

[매칭 신청]
GIVEN  다른 팀의 관리자가 OPEN 게시글 상세 페이지를 봄
WHEN   "매칭 신청" 버튼을 누르고 메시지(최대 100자) 입력 후 제출
THEN   MatchApplication PENDING 생성, 등록팀에 알림(TODO)

[수락 — 트랜잭션]
GIVEN  게시글 등록자가 "내 게시글" 탭 → 신청 목록 화면 진입
WHEN   특정 신청 팀의 "수락" 버튼 클릭
THEN   해당 신청 ACCEPTED, 나머지 PENDING → REJECTED 일괄 처리
       게시글 status → MATCHED
       양측 관리자에게 연락처 인앱 표시
       양 팀 각자의 Match(경기 관리) 자동 생성(type: SELF)

[목록 조회 / 만료]
GIVEN  사용자가 전체 매칭 목록 진입
WHEN   조회 쿼리 실행
THEN   matchDate >= now() AND isDeleted = false AND status = OPEN 인 게시글만 반환
       (만료는 DB 상태 변경 없이 동적 필터링)
```

---

## 2. 클라이언트 라우트

| 경로 | 설명 | 내비게이션 타입 |
|---|---|---|
| `/(app)/matching` | 매칭 탭 진입 — 전체 목록 (3-탭 레이아웃) | Tab |
| `/(app)/matching/[id]` | 매칭 상세 페이지 | Push |
| `/(app)/matching/create` | 매칭 게시글 등록 | Push |
| `/(app)/matching/[id]/edit` | 매칭 게시글 수정 (OPEN 상태만) | Push |
| `/(app)/matching/[id]/applications` | 신청 목록 (등록자 전용) | Push |

> 탭 내부는 `전체 매칭 / 내 게시글 / 내 신청` 3개 세그먼트로 구성.  
> 별도 라우트 없이 매칭 탭 내 상태(selectedTab)로 렌더링 분기.

---

## 3. API 설계

| Method | Endpoint | 설명 | Auth |
|---|---|---|---|
| `GET` | `/match-posts` | 전체 목록 (필터 + 커서 페이지네이션) | 필요 |
| `POST` | `/match-posts` | 게시글 등록 | 관리자 |
| `GET` | `/match-posts/my` | 내 팀 게시글 목록 | 관리자 |
| `GET` | `/match-posts/my-applications` | 내 팀 신청 목록 | 관리자 |
| `GET` | `/match-posts/:id` | 게시글 상세 | 필요 |
| `PATCH` | `/match-posts/:id` | 게시글 수정 (OPEN만) | 등록자 |
| `DELETE` | `/match-posts/:id` | 게시글 soft delete | 등록자 |
| `POST` | `/match-posts/:id/applications` | 매칭 신청 | 관리자 |
| `GET` | `/match-posts/:id/applications` | 신청 목록 조회 | 등록자 |
| `PATCH` | `/match-posts/:id/applications/:appId/accept` | 신청 수락 (트랜잭션) | 등록자 |
| `PATCH` | `/match-posts/:id/applications/:appId/reject` | 신청 거절 | 등록자 |
| `GET` | `/match-posts/:id/contact` | 연락처 조회 (수락 후 공개) | 관리자 + Rate Limit |

### 필터 쿼리 파라미터 (`GET /match-posts`)

```
cursor?: string          -- 커서 기반 페이지네이션
limit?: number           -- 기본 20
dateFrom?: string        -- ISO 날짜 (matchDate >=)
dateTo?: string          -- ISO 날짜 (matchDate <=)
regionId?: string        -- Region.id
level?: ClubLevel        -- BEGINNER|AMATEUR|SEMI_PRO|PRO
gender?: MatchGender     -- MALE|FEMALE|MIXED
hasFee?: boolean         -- true=유료, false=무료
includeExpired?: boolean -- 만료 포함 여부 (기본 false)
includeMatched?: boolean -- 매칭완료 포함 여부 (기본 false)
```

---

## 4. 데이터 레이어 설계 (`client/src/features/matching/data/`)

### Schemas (Zod)

**`schemas/matchPost.schema.ts`**
```ts
matchPostSchema           // 게시글 단건 (목록·상세 공통)
matchPostListSchema        // { data: matchPostSchema[], nextCursor: string | null }
matchPostDetailSchema      // 상세 (연락처 포함 여부 분기)
createMatchPostSchema      // 등록 폼 입력값
updateMatchPostSchema      // 수정 폼 입력값

// 주요 필드
id, clubId, clubName, clubLogoUrl, clubLevel,
matchDate, startTime, endTime, location, address, regionId,
playerCount, gender, level, fee,
status,               // 'OPEN' | 'MATCHED' (EXPIRED는 isExpired 파생)
isExpired,            // matchDate < now() 클라이언트 파생
contactName?, contactPhone?,   // 수락 후에만 포함
createdAt
```

**`schemas/matchApplication.schema.ts`**
```ts
matchApplicationSchema        // 신청 단건 (신청 목록 아이템)
matchApplicationListSchema    // 신청 목록
myApplicationSchema           // 내 신청 (상태 포함)
createMatchApplicationSchema  // 신청 폼 { message?: string }

// 주요 필드
id, postId, applicantClubId, applicantClubName, applicantClubLevel,
applicantClubLogoUrl, message, contactName, contactPhone, status, createdAt
```

### Services

**`services/matchPost.service.ts`**
```ts
getMatchPosts(filters)             // GET /match-posts
getMyMatchPosts()                  // GET /match-posts/my
getMatchPostDetail(id)             // GET /match-posts/:id
createMatchPost(body)              // POST /match-posts
updateMatchPost(id, body)          // PATCH /match-posts/:id
deleteMatchPost(id)                // DELETE /match-posts/:id
getMatchContact(id)                // GET /match-posts/:id/contact
```

**`services/matchApplication.service.ts`**
```ts
applyMatchPost(postId, body)                          // POST /match-posts/:id/applications
getMatchApplications(postId)                           // GET /match-posts/:id/applications
acceptMatchApplication(postId, appId)                  // PATCH .../accept
rejectMatchApplication(postId, appId)                  // PATCH .../reject
getMyApplications()                                    // GET /match-posts/my-applications
```

### Hooks

**`hooks/useMatchPosts.ts`**
```ts
useMatchPosts(filters)             // useSuspenseInfiniteQuery — 전체 목록
useMyMatchPosts()                  // useSuspenseQuery — 내 게시글
useMatchPostDetail(id)             // useSuspenseQuery — 상세
useMatchContact(id, enabled)       // useQuery — 연락처 (수락 후 활성)
```

**`hooks/useMatchPostMutations.ts`**
```ts
useCreateMatchPost()               // useMutation
useUpdateMatchPost()               // useMutation
useDeleteMatchPost()               // useMutation
```

**`hooks/useMatchApplications.ts`**
```ts
useMatchApplications(postId)       // useSuspenseQuery — 신청 목록
useMyApplications()                // useSuspenseQuery — 내 신청
useApplyMatchPost()                // useMutation
useAcceptApplication()             // useMutation
useRejectApplication()             // useMutation
```

**`hooks/matchQueryKeys.ts`** — 쿼리키 상수 중앙 관리
```ts
matchQueryKeys = {
  lists: (filters) => ['match-posts', 'list', filters],
  my: () => ['match-posts', 'my'],
  detail: (id) => ['match-posts', id],
  applications: (postId) => ['match-posts', postId, 'applications'],
  myApplications: () => ['match-posts', 'my-applications'],
  contact: (id) => ['match-posts', id, 'contact'],
}
```

---

## 5. UI 레이어 설계 (`client/src/features/matching/ui/`)

### Container

**`container/MatchingTabContainer.tsx`**
- `selectedTab` 상태 (전체/내게시글/내신청)
- 탭 전환 핸들러
- 필터 상태 관리 (dateFrom, dateTo, regionId, level, gender, hasFee)
- `router.push` 핸들러 주입

**`container/MatchListContainer.tsx`**
- `useMatchPosts(filters)` 조합
- `fetchNextPage` 무한 스크롤 핸들러

**`container/MatchDetailContainer.tsx`**
- `useMatchPostDetail(id)` 조합
- 신청 버튼 활성 조건 계산 (isAdmin, isOwnPost, isExpired, isMatched)
- `useApplyMatchPost()` 연결

**`container/MatchCreateContainer.tsx`** / **`MatchEditContainer.tsx`**
- 진입 시 `user.phone` 확인 → 미설정이면 AlertDialog 표시 후 프로필 설정 이동
- `react-hook-form` + `createMatchPostSchema` Zod 연결
- `contactName` 기본값 = `user.name`, `contactPhone` 기본값 = `user.phone`
- `useCreateMatchPost()` / `useUpdateMatchPost()` 연결

**`container/ApplicationListContainer.tsx`**
- `useMatchApplications(postId)` 조합
- `useAcceptApplication()` / `useRejectApplication()` 연결

**`container/MyApplicationsContainer.tsx`**
- `useMyApplications()` 조합

### View / Components

| 파일 | 설명 |
|---|---|
| `view/MatchingTabView.tsx` | 3-탭 세그먼트 + 탭별 콘텐츠 분기 |
| `view/MatchListView.tsx` | FlatList + 무한 스크롤 + 필터 바 |
| `view/MatchDetailView.tsx` | 상세 정보 + 신청 버튼 (4-state) |
| `view/MatchCreateView.tsx` | 등록 폼 |
| `view/MatchEditView.tsx` | 수정 폼 (OPEN 상태 전제) |
| `view/ApplicationListView.tsx` | 신청 목록 + 수락/거절 버튼 |
| `view/MyPostsView.tsx` | 내 게시글 목록 |
| `view/MyApplicationsView.tsx` | 내 신청 현황 목록 |
| `components/MatchPostCard.tsx` | 목록 카드 UI |
| `components/ApplicationCard.tsx` | 신청 카드 UI (신청팀 정보 + 메시지) |
| `components/MatchFilterBar.tsx` | 필터 바 (날짜/지역/레벨/성별/참가비) |
| `components/MatchStatusBadge.tsx` | 상태 뱃지 (모집중/완료/만료) |
| `components/ContactCard.tsx` | 연락처 표시 카드 (수락 후 노출) |
| `components/ApplyBottomSheet.tsx` | 신청 BottomSheet — 메시지(선택) + 담당자 이름 + 연락처 입력 |

**빈 상태 컴포넌트** (`view/` 내 공존)
- `MatchListEmptyView` — 조건에 맞는 게시글이 없어요
- `MyPostsEmptyView` — 등록한 매칭이 없어요
- `MyApplicationsEmptyView` — 신청한 매칭이 없어요
- `ApplicationListEmptyView` — 신청한 팀이 없어요

---

## 6. 서버 레이어 설계 (`server/src/features/match-posts/`)

### Prisma 스키마 추가

```prisma
enum MatchPostStatus {
  OPEN
  MATCHED
}

enum MatchApplicationStatus {
  PENDING
  ACCEPTED
  REJECTED
}

enum MatchGender {
  MALE
  FEMALE
  MIXED
}

model MatchPost {
  id           String          @id @default(cuid())
  clubId       String
  createdBy    String
  regionId     String
  matchDate    DateTime
  startTime    String          // "HH:mm" 형식
  endTime      String          // "HH:mm" 형식 — Match.endAt 계산에 사용
  location     String
  address      String?
  playerCount  Int             // 5~11
  gender       MatchGender
  level        ClubLevel
  fee          Int             @default(0)  // 원(KRW), 0=무료
  contactName  String          // 기본값: 등록자 user.name
  contactPhone String          // 기본값: 등록자 user.phone
  status       MatchPostStatus @default(OPEN)
  isDeleted    Boolean         @default(false)
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  club         Club            @relation(fields: [clubId], references: [id])
  region       Region          @relation(fields: [regionId], references: [id])
  applications MatchApplication[]

  @@index([matchDate])
  @@index([regionId])
  @@index([level])
  @@index([gender])
  @@index([fee])
  @@index([clubId])
  @@map("match_posts")
}

model MatchApplication {
  id               String                 @id @default(cuid())
  postId           String
  applicantClubId  String
  applicantUserId  String
  message          String?                // max 100자
  contactName      String                 // 기본값: 신청자 user.name
  contactPhone     String                 // 기본값: 신청자 user.phone
  status           MatchApplicationStatus @default(PENDING)
  createdAt        DateTime               @default(now())
  updatedAt        DateTime               @updatedAt

  post             MatchPost              @relation(fields: [postId], references: [id], onDelete: Cascade)
  applicantClub    Club                   @relation(fields: [applicantClubId], references: [id])

  @@unique([postId, applicantClubId])
  @@map("match_applications")
}
```

**기존 Match 모델에 추가:**
```prisma
matchPostId  String?   // 매칭 수락으로 생성된 경우 연결
```

**기존 User 모델에 추가:**
```prisma
phone        String?   // 문의 연락처 — 프로필 설정에서 수정 가능
```

**Region 모델에 relation 추가:**
```prisma
matchPosts   MatchPost[]
```

### DTO

**`dto/create-match-post.dto.ts`**
```ts
@IsDateString() matchDate
@IsString() @Matches(/^\d{2}:\d{2}$/) startTime
@IsString() @Matches(/^\d{2}:\d{2}$/) endTime
@IsString() location
@IsOptional() @IsString() address
@IsInt() @Min(5) @Max(11) playerCount
@IsEnum(MatchGender) gender
@IsEnum(ClubLevel) level
@IsInt() @Min(0) fee
@IsString() contactName
@IsString() contactPhone
@IsString() regionId
```

**`dto/update-match-post.dto.ts`** — CreateDto에서 PartialType 상속

**`dto/filter-match-post.dto.ts`**
```ts
@IsOptional() cursor, limit, dateFrom, dateTo, regionId, level, gender, hasFee
@IsOptional() @IsBoolean() includeExpired, includeMatched
```

**`dto/create-match-application.dto.ts`**
```ts
@IsOptional() @IsString() @MaxLength(100) message
@IsString() contactName
@IsString() contactPhone
```

### Service 메서드

**`match-posts.service.ts`**
```ts
getList(userId, filters)         // 동적 만료 필터 포함 커서 페이지네이션
getMyPosts(userId)               // 본인 팀 게시글
getDetail(id, userId)            // 상세 (isOwnPost, canApply 파생)
create(userId, dto)              // 관리자 권한 확인
update(id, userId, dto)          // 등록자 + OPEN 상태 확인
softDelete(id, userId)           // 등록자 확인
getContact(id, userId)           // 수락 상태 + 관계자인지 확인
```

**`match-applications.service.ts`**
```ts
apply(postId, userId, dto)       // unique 체크, OPEN+미만료 확인, 본인팀 신청 금지
getApplications(postId, userId)  // 등록자 권한 확인
accept(postId, appId, userId)    // 트랜잭션: ACCEPTED + 나머지 REJECTED + status→MATCHED + Match 2건 생성
reject(postId, appId, userId)    // 등록자 권한 확인
getMyApplications(userId)        // 본인 팀 신청 목록
```

### Controller 엔드포인트

**`match-posts.controller.ts`**
```ts
@Get()            getList(@Query() dto, @User() user)
@Post()           create(@Body() dto, @User() user)
@Get('my')        getMyPosts(@User() user)
@Get('my-applications')  getMyApplications(@User() user)
@Get(':id')       getDetail(@Param('id'), @User() user)
@Patch(':id')     update(@Param('id'), @Body() dto, @User() user)
@Delete(':id')    delete(@Param('id'), @User() user)
@Get(':id/contact')    @Throttle({ default: { limit: 20, ttl: 86400 } })
                  getContact(@Param('id'), @User() user)
@Post(':id/applications')          apply(@Param('id'), @Body() dto, @User() user)
@Get(':id/applications')           getApplications(@Param('id'), @User() user)
@Patch(':id/applications/:appId/accept')  accept(@Param(), @User() user)
@Patch(':id/applications/:appId/reject')  reject(@Param(), @User() user)
```

---

## 7. 예외 처리

### 에러 코드 정의

| 코드 | 설명 | HTTP |
|---|---|---|
| `MATCH_POST_001` | 존재하지 않는 매칭 게시글 | 404 |
| `MATCH_POST_002` | 게시글 수정/삭제 권한 없음 (등록자가 아님) | 403 |
| `MATCH_POST_003` | 이미 매칭 완료된 게시글 (MATCHED) | 409 |
| `MATCH_POST_004` | 만료된 게시글 (matchDate < now) | 410 |
| `MATCH_POST_005` | 본인 팀 게시글에는 신청 불가 | 403 |
| `MATCH_POST_006` | 이미 신청한 게시글 | 409 |
| `MATCH_POST_007` | 신청 목록 조회 권한 없음 (등록자가 아님) | 403 |
| `MATCH_POST_008` | 연락처 조회 권한 없음 (관계자가 아님) | 403 |
| `MATCH_POST_009` | 연락처는 수락 후에만 조회 가능 | 403 |
| `MATCH_APPLICATION_001` | 존재하지 않는 신청 | 404 |
| `MATCH_APPLICATION_002` | 이미 처리된 신청 (ACCEPTED/REJECTED) | 409 |
| `MATCH_APPLICATION_003` | 신청자 연락처(phone) 미설정 — 클라이언트 가드로 차단하지만 서버도 검증 | 400 |

### 클라이언트 처리

| 상황 | 처리 방식 |
|---|---|
| 게시글 목록 로딩 실패 | `AsyncBoundary` → 에러 뷰 + 재시도 버튼 |
| 신청 뮤테이션 실패 | `useToast`로 에러 메시지 표시 |
| 수락/거절 실패 | `useToast`로 에러 메시지 표시 |
| 연락처 Rate Limit 초과 | "오늘 조회 한도를 초과했습니다" 토스트 |
| 만료 게시글 접근 | 상세 페이지 접근 허용, 신청 버튼만 비활성 |
| 빈 목록 | `EmptyBoundary` → 각 탭별 Empty 컴포넌트 |

---

## 8. 구현 체크리스트

### Prisma / DB
- [ ] `MatchPost`, `MatchApplication` 모델 추가
- [ ] `MatchPostStatus`, `MatchApplicationStatus`, `MatchGender` Enum 추가
- [ ] `Match` 모델에 `matchPostId` 필드 추가
- [ ] `User` 모델에 `phone String?` 필드 추가
- [ ] `Region` 모델에 `matchPosts` relation 추가
- [ ] `Club` 모델에 `matchPosts`, `matchApplications` relation 추가
- [ ] 인덱스 6종 적용 (`matchDate`, `regionId`, `level`, `gender`, `fee`, `clubId`)
- [ ] `npx prisma migrate dev` 실행

### 서버
- [ ] `match-posts` 모듈 생성 (`nest g module/service/controller`)
- [ ] DTO 작성 (Create, Update, Filter, CreateApplication)
- [ ] `getList` — 동적 만료 필터(`matchDate >= now()`) + 커서 페이지네이션
- [ ] `create` — ClubRole CAPTAIN/VICE_CAPTAIN 권한 검증
- [ ] `accept` — 트랜잭션 (ACCEPTED + 일괄 REJECTED + status MATCHED + Match 2건 생성, `startAt`=`matchDate+startTime`, `endAt`=`matchDate+endTime`)
- [ ] `getContact` — `@Throttle` Rate Limiting 적용, ACCEPTED 관계자 검증
- [ ] 클럽 해체(`ClubDissolveVote` APPROVED) 시 MatchPost soft delete 훅 연동 (TODO 처리)
- [ ] 에러 코드 `MATCH_POST_*`, `MATCH_APPLICATION_*` GlobalExceptionFilter 등록
- [ ] Swagger `@ApiOperation`, `@ApiResponse` 전 엔드포인트 작성

### 클라이언트
- [ ] `matchPost.schema.ts`, `matchApplication.schema.ts` Zod 스키마 작성
- [ ] `matchPost.service.ts`, `matchApplication.service.ts` 서비스 작성
- [ ] `matchQueryKeys.ts` 쿼리키 상수 작성
- [ ] 훅 작성 (`useMatchPosts`, `useMatchPostDetail`, `useApplyMatchPost`, `useAcceptApplication` 등)
- [ ] `/(app)/matching` 라우트 파일 생성 (3-탭 레이아웃)
- [ ] `/(app)/matching/[id]` 상세 라우트
- [ ] `/(app)/matching/create` 등록 라우트
- [ ] `/(app)/matching/[id]/edit` 수정 라우트
- [ ] `/(app)/matching/[id]/applications` 신청 목록 라우트
- [ ] Container 작성 (MatchingTab, MatchList, MatchDetail, MatchCreate, MatchEdit, ApplicationList, MyApplications)
- [ ] `MatchCreateContainer` / `MatchDetailContainer`: 진입 시 `user.phone` 가드 (AlertDialog → 프로필 설정)
- [ ] `ApplyBottomSheet`: `contactName`(기본값: user.name) + `contactPhone`(기본값: user.phone) 필드 추가
- [ ] View 작성 7종 + Empty 컴포넌트 4종
- [ ] `MatchPostCard`, `ApplicationCard`, `MatchFilterBar`, `MatchStatusBadge`, `ContactCard`, `ApplyBottomSheet` 컴포넌트
- [ ] 4-state 처리: AsyncBoundary + EmptyBoundary 적용
- [ ] `isExpired` 클라이언트 파생 필드 처리 (`matchDate < new Date()`)
- [ ] 연락처 조회 Rate Limit 초과 에러 처리
