# Mercenary Plan

## 1. 기능 개요

- **목적**: 팀이 경기에 필요한 용병을 모집하고, 개인 플레이어가 용병 활동을 등록하여 서로 매칭되는 양방향 용병 중개 기능
- **핵심 사용자 시나리오**:

```
[용병 구함 등록 — 팀 관리자]
GIVEN  클럽 관리자(주장·부주장)로 로그인한 상태
WHEN   용병 탭 → 용병 구함 등록 버튼 클릭 → 포지션·인원·날짜·참가비 입력 후 등록
THEN   게시글 OPEN 상태로 용병 구함 목록에 노출

[입단 신청 — 개인 → 팀]
GIVEN  개인 플레이어가 OPEN 상태 용병 구함 상세 페이지 진입
WHEN   user.phone 확인 → "지원하기" 클릭 → 메시지 입력 → 제출
THEN   MercenaryApplication PENDING 생성, 팀 관리자에게 알림(TODO)

[수락 — 팀 관리자]
GIVEN  팀 관리자가 지원자 관리 페이지 진입
WHEN   특정 지원자 "수락" 클릭
THEN   Application ACCEPTED, acceptedCount +1
       acceptedCount == requiredCount → 게시글 자동 CLOSED + 잔여 PENDING 일괄 REJECTED
       양측 연락처 인앱 표시

[용병 가능 등록 — 개인]
GIVEN  개인 플레이어로 로그인한 상태
WHEN   용병 탭 → 용병 가능 탭 → 등록 버튼 → 포지션·날짜·지역·자기소개 입력
THEN   게시글 OPEN 상태로 용병 가능 목록에 노출
       마지막 가능 날짜 경과 시 동적 만료 처리

[영입 신청 — 팀 → 개인]
GIVEN  팀 관리자가 OPEN 상태 용병 가능 상세 페이지 진입
WHEN   user.phone 확인 → "영입 신청" 클릭 → 메시지 입력 → 제출
THEN   MercenaryRecruitment PENDING 생성, 해당 플레이어에게 알림(TODO)

[영입 신청 수락 — 개인]
GIVEN  개인 플레이어가 내 영입 신청 목록 진입
WHEN   특정 신청 "수락" 클릭
THEN   Recruitment ACCEPTED, 양측 연락처 인앱 표시

[노쇼 신고]
GIVEN  경기 날짜 이후, 수락된 신청이 존재
WHEN   수락한 측이 "노쇼 신고" 제출
THEN   NoShowReport PENDING 생성, 운영자 검토 후 APPROVED 시 해당 유저 신고 카운트 +1
       3회 이상 APPROVED 시 블랙리스트 적용
```

---

## 2. 클라이언트 라우트

| 경로 | 설명 | 내비게이션 타입 |
|---|---|---|
| `/(app)/mercenary` | 용병 탭 진입 — 탑탭(용병 구함/용병 가능) | Tab |
| `/(app)/mercenary/post/[id]` | 용병 구함 상세 | Push |
| `/(app)/mercenary/post/create` | 용병 구함 등록 | Push |
| `/(app)/mercenary/post/[id]/edit` | 용병 구함 수정 (OPEN만) | Push |
| `/(app)/mercenary/post/[id]/applications` | 지원자 관리 (등록팀 관리자 전용) | Push |
| `/(app)/mercenary/availability/[id]` | 용병 가능 상세 | Push |
| `/(app)/mercenary/availability/create` | 용병 가능 등록 | Push |
| `/(app)/mercenary/availability/[id]/edit` | 용병 가능 수정 | Push |
| `/(app)/mercenary/my-recruitments` | 내가 받은 영입 신청 목록 | Push |

> 탭 내부 탑탭: `용병 구함` / `용병 가능`. 별도 라우트 없이 `selectedTab` 상태로 분기.

---

## 3. API 설계

### 용병 구함 (MercenaryPost)

| Method | Endpoint | 설명 | Auth |
|---|---|---|---|
| `GET` | `/mercenary-posts` | 용병 구함 목록 (필터 + 커서 페이지네이션) | 필요 |
| `POST` | `/mercenary-posts` | 게시글 등록 | 관리자 |
| `GET` | `/mercenary-posts/my` | 내 팀 게시글 목록 | 관리자 |
| `GET` | `/mercenary-posts/:id` | 게시글 상세 | 필요 |
| `PATCH` | `/mercenary-posts/:id` | 게시글 수정 (OPEN만) | 등록자 |
| `DELETE` | `/mercenary-posts/:id` | 게시글 soft delete | 등록자 |
| `POST` | `/mercenary-posts/:id/applications` | 입단 신청 (개인→팀) | 필요 |
| `GET` | `/mercenary-posts/:id/applications` | 지원자 목록 조회 | 등록팀 관리자 |
| `PATCH` | `/mercenary-posts/:id/applications/:appId/accept` | 입단 신청 수락 | 등록팀 관리자 |
| `PATCH` | `/mercenary-posts/:id/applications/:appId/reject` | 입단 신청 거절 | 등록팀 관리자 |

### 용병 가능 (MercenaryAvailability)

| Method | Endpoint | 설명 | Auth |
|---|---|---|---|
| `GET` | `/mercenary-availabilities` | 용병 가능 목록 (필터 + 커서 페이지네이션) | 필요 |
| `POST` | `/mercenary-availabilities` | 게시글 등록 | 필요 |
| `GET` | `/mercenary-availabilities/my` | 내 게시글 목록 | 필요 |
| `GET` | `/mercenary-availabilities/my-recruitments` | 내가 받은 영입 신청 목록 | 필요 |
| `GET` | `/mercenary-availabilities/:id` | 게시글 상세 | 필요 |
| `PATCH` | `/mercenary-availabilities/:id` | 게시글 수정 | 등록자 |
| `DELETE` | `/mercenary-availabilities/:id` | soft delete | 등록자 |
| `POST` | `/mercenary-availabilities/:id/recruitments` | 영입 신청 (팀→개인) | 관리자 |
| `PATCH` | `/mercenary-availabilities/:id/recruitments/:recId/accept` | 영입 신청 수락 | 게시글 등록자 |
| `PATCH` | `/mercenary-availabilities/:id/recruitments/:recId/reject` | 영입 신청 거절 | 게시글 등록자 |

### 노쇼 신고

| Method | Endpoint | 설명 | Auth |
|---|---|---|---|
| `POST` | `/no-show-reports` | 노쇼 신고 등록 | 필요 |

### 필터 쿼리 파라미터

**용병 구함 (`GET /mercenary-posts`)**
```
cursor?: string
limit?: number
dateFrom?: string        -- matchDate >=
dateTo?: string          -- matchDate <=
positions?: string[]     -- 포지션 필터 (FW|MF|DF|GK)
regionId?: string
level?: ClubLevel
includeExpired?: boolean -- 만료(경기 날짜 경과) 포함 (기본 false)
includeClosed?: boolean  -- 마감(CLOSED) 포함 (기본 false)
```

**용병 가능 (`GET /mercenary-availabilities`)**
```
cursor?: string
limit?: number
date?: string            -- 해당 날짜가 availableDates에 포함되는 게시글
positions?: string[]
regionId?: string
level?: PlayerLevel
includeExpired?: boolean -- 만료 포함 (기본 false)
```

---

## 4. 데이터 레이어 설계 (`client/src/features/mercenary/data/`)

### Schemas (`data/schemas/`)

**`mercenaryPost.schema.ts`**

```ts
MercenaryPostStatusSchema      // 'OPEN' | 'CLOSED'
MercenaryApplicationStatusSchema // 'PENDING' | 'ACCEPTED' | 'REJECTED'

MercenaryPostSummarySchema     // 목록 카드
  id, clubId, clubName, clubLogoUrl, clubLevel,
  positions, requiredCount, acceptedCount,
  matchDate, startTime, endTime,
  location, address, regionName, regionSigungu,
  level, fee, status, isExpired, createdAt

MercenaryPostDetailSchema      // 상세 (SummarySchema.extend)
  description, contactName?, contactPhone?,
  isOwnPost, canApply, alreadyApplied

MercenaryPostListSchema        // { items: Summary[], nextCursor }

MercenaryApplicationItemSchema // 지원자 1명
  id, postId, applicantId, applicantName, applicantLevel,
  applicantPosition, applicantAvatarUrl, applicantMannerScore,
  mercenaryMatchCount, message, status, createdAt

MercenaryApplicationListSchema

CreateMercenaryPostSchema      // 등록 폼 입력
UpdateMercenaryPostSchema      // 수정 폼 입력 (partial)
CreateMercenaryApplicationSchema // 지원 폼 입력 { message? }
```

**`mercenaryAvailability.schema.ts`**

```ts
MercenaryAvailabilitySummarySchema
  id, userId, userName, userAvatarUrl, userLevel,
  positions, availableDates, regionNames,
  timeSlot, acceptsFee, isExpired, createdAt,
  mannerScore, mercenaryMatchCount

MercenaryAvailabilityDetailSchema // extend + bio, canRecruit, alreadyRecruited

MercenaryAvailabilityListSchema

MercenaryRecruitmentItemSchema
  id, availabilityId, recruitingClubId, recruitingClubName,
  message, status, createdAt, contactName?, contactPhone?

MercenaryRecruitmentListSchema

CreateMercenaryAvailabilitySchema
UpdateMercenaryAvailabilitySchema
CreateMercenaryRecruitmentSchema  // { message? }
```

### Services (`data/services/`)

**`mercenaryPost.service.ts`**
```ts
getMercenaryPosts(filters)         // GET /mercenary-posts
getMyMercenaryPosts()              // GET /mercenary-posts/my
getMercenaryPostDetail(id)         // GET /mercenary-posts/:id
createMercenaryPost(body)          // POST /mercenary-posts
updateMercenaryPost(id, body)      // PATCH /mercenary-posts/:id
deleteMercenaryPost(id)            // DELETE /mercenary-posts/:id
applyMercenaryPost(id, body)       // POST /mercenary-posts/:id/applications
getMercenaryApplications(id)       // GET /mercenary-posts/:id/applications
acceptMercenaryApplication(id, appId) // PATCH .../accept
rejectMercenaryApplication(id, appId) // PATCH .../reject
```

**`mercenaryAvailability.service.ts`**
```ts
getMercenaryAvailabilities(filters)          // GET /mercenary-availabilities
getMyMercenaryAvailabilities()               // GET /mercenary-availabilities/my
getMyRecruitments()                          // GET /mercenary-availabilities/my-recruitments
getMercenaryAvailabilityDetail(id)           // GET /mercenary-availabilities/:id
createMercenaryAvailability(body)            // POST /mercenary-availabilities
updateMercenaryAvailability(id, body)        // PATCH /mercenary-availabilities/:id
deleteMercenaryAvailability(id)              // DELETE /mercenary-availabilities/:id
recruitMercenary(id, body)                   // POST /mercenary-availabilities/:id/recruitments
acceptMercenaryRecruitment(id, recId)        // PATCH .../accept
rejectMercenaryRecruitment(id, recId)        // PATCH .../reject
```

**`noShowReport.service.ts`**
```ts
createNoShowReport(body)  // POST /no-show-reports
```

### Hooks (`data/hooks/`)

**`useMercenaryPosts.ts`**
```ts
useMercenaryPosts(filters)        // useSuspenseInfiniteQuery
useMyMercenaryPosts()             // useSuspenseQuery
useMercenaryPostDetail(id)        // useSuspenseQuery
useCreateMercenaryPost()          // useMutation
useUpdateMercenaryPost(id)        // useMutation
useDeleteMercenaryPost()          // useMutation
```

**`useMercenaryApplications.ts`**
```ts
useMercenaryApplications(postId)  // useSuspenseQuery — 지원자 목록
useApplyMercenaryPost(postId)     // useMutation — 지원하기
useAcceptMercenaryApplication()   // useMutation — 수락 (캐시 즉시 반영)
useRejectMercenaryApplication()   // useMutation — 거절
```

**`useMercenaryAvailabilities.ts`**
```ts
useMercenaryAvailabilities(filters)   // useSuspenseInfiniteQuery
useMyMercenaryAvailabilities()        // useSuspenseQuery
useMercenaryAvailabilityDetail(id)    // useSuspenseQuery
useMyRecruitments()                   // useSuspenseQuery — 내 영입 신청
useCreateMercenaryAvailability()      // useMutation
useUpdateMercenaryAvailability(id)    // useMutation
useDeleteMercenaryAvailability()      // useMutation
useRecruitMercenary(id)               // useMutation — 영입 신청
useAcceptMercenaryRecruitment()       // useMutation
useRejectMercenaryRecruitment()       // useMutation
```

**`mercenaryQueryKeys.ts`** — 쿼리키 상수 중앙 관리
```ts
mercenaryQueryKeys = {
  postLists: (filters) => ['mercenary-posts', 'list', filters],
  myPosts: () => ['mercenary-posts', 'my'],
  postDetail: (id) => ['mercenary-posts', id],
  applications: (postId) => ['mercenary-posts', postId, 'applications'],
  availabilityLists: (filters) => ['mercenary-availabilities', 'list', filters],
  myAvailabilities: () => ['mercenary-availabilities', 'my'],
  availabilityDetail: (id) => ['mercenary-availabilities', id],
  myRecruitments: () => ['mercenary-availabilities', 'my-recruitments'],
}
```

---

## 5. UI 레이어 설계 (`client/src/features/mercenary/ui/`)

### Components (`ui/components/`)

| 파일 | 설명 |
|---|---|
| `MercenaryPostCard.tsx` | 용병 구함 목록 카드 (팀 정보, 포지션, 인원, 날짜, 참가비, 뱃지) |
| `MercenaryAvailabilityCard.tsx` | 용병 가능 목록 카드 (프로필, 포지션, 레벨, 지역, 날짜) |
| `MercenaryStatusBadge.tsx` | OPEN(초록) / CLOSED(파랑) / 만료(회색) 뱃지 |
| `MercenaryApplicationCard.tsx` | 지원자 1명 카드 (이름·포지션·레벨·매너점수·용병횟수·메시지) |
| `MercenaryRecruitmentCard.tsx` | 영입 신청 카드 (팀명·레벨·메시지·상태) |
| `ApplyBottomSheet.tsx` | 지원하기 BottomSheet (메시지 입력) |
| `RecruitBottomSheet.tsx` | 영입 신청 BottomSheet (메시지 입력) |
| `PositionPicker.tsx` | 포지션 복수 선택 UI (FW·MF·DF·GK 칩) |
| `DateMultiPicker.tsx` | 날짜 복수 선택 캘린더 (용병 가능 등록용) |

### Views (`ui/view/`)

| 파일 | 설명 |
|---|---|
| `MercenaryTabView.tsx` | 탑탭 레이아웃 (용병 구함 / 용병 가능) |
| `MercenaryPostListView.tsx` | 용병 구함 목록 + 필터바 + FlatList 무한 스크롤 |
| `MercenaryPostDetailView.tsx` | 용병 구함 상세 (팀·경기정보·지원 현황·지원하기 CTA) |
| `MercenaryPostFormView.tsx` | 용병 구함 등록/수정 폼 |
| `ApplicationListView.tsx` | 지원자 관리 (지원자 카드 + 수락·거절 버튼) |
| `MercenaryAvailabilityListView.tsx` | 용병 가능 목록 + 필터바 + FlatList 무한 스크롤 |
| `MercenaryAvailabilityDetailView.tsx` | 용병 가능 상세 (개인정보·가능날짜·자기소개·영입신청 CTA) |
| `MercenaryAvailabilityFormView.tsx` | 용병 가능 등록/수정 폼 |
| `MyRecruitmentsView.tsx` | 내 영입 신청 목록 (팀 정보·상태·수락·거절 버튼) |

### Containers (`ui/container/`)

| 파일 | 책임 |
|---|---|
| `MercenaryTabContainer.tsx` | 탑탭 상태 관리, AsyncBoundary 래핑 |
| `MercenaryPostListContainer.tsx` | 필터 상태, 무한 스크롤, 블랙리스트 등록 가드 |
| `MercenaryPostDetailContainer.tsx` | 상세 데이터 + phone guard + 지원 BottomSheet |
| `MercenaryPostCreateContainer.tsx` | phone 체크, 블랙리스트 가드, useForm 조립 |
| `MercenaryPostEditContainer.tsx` | 수정 폼 + useUpdateMercenaryPost |
| `ApplicationListContainer.tsx` | 지원자 목록 + 수락/거절 핸들러 |
| `MercenaryAvailabilityListContainer.tsx` | 필터 상태, 무한 스크롤 |
| `MercenaryAvailabilityDetailContainer.tsx` | 상세 + phone guard + 영입 BottomSheet |
| `MercenaryAvailabilityCreateContainer.tsx` | 블랙리스트 가드, useForm 조립 |
| `MercenaryAvailabilityEditContainer.tsx` | 수정 폼 조립 |
| `MyRecruitmentsContainer.tsx` | 내 영입 신청 목록 + 수락/거절 핸들러 |

---

## 6. 서버 레이어 설계 (`server/src/features/mercenary/`)

### Prisma 스키마 추가

```prisma
enum MercenaryPostStatus {
  OPEN
  CLOSED
}

enum MercenaryApplicationStatus {
  PENDING
  ACCEPTED
  REJECTED
}

enum NoShowReportStatus {
  PENDING
  APPROVED
  REJECTED
}

model MercenaryPost {
  id            String              @id @default(cuid())
  clubId        String
  createdBy     String              // userId (FK 없음 — 탈퇴 후 보존)
  positions     PlayerPosition[]    // 구하는 포지션 (복수)
  requiredCount Int                 // 필요 인원
  acceptedCount Int   @default(0)   // 현재 수락 인원
  matchDate     DateTime            // 경기 날짜
  startTime     String              // HH:mm
  endTime       String              // HH:mm
  location      String              // 구장 이름 (max 100)
  address       String?             // 상세 주소 (max 200)
  regionId      String
  level         ClubLevel
  fee           Int   @default(0)   // 0 = 무료
  description   String?             // 상세 설명 (max 500)
  contactName   String              // 담당자 이름 (기본값: user.name)
  contactPhone  String              // 담당자 연락처 (기본값: user.phone)
  status        MercenaryPostStatus @default(OPEN)
  isDeleted     Boolean @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  club          Club                  @relation(fields: [clubId], references: [id])
  region        Region                @relation(fields: [regionId], references: [id])
  applications  MercenaryApplication[]

  @@index([matchDate])
  @@index([regionId])
  @@index([level])
  @@index([clubId])
  @@map("mercenary_posts")
}

model MercenaryAvailability {
  id             String   @id @default(cuid())
  userId         String
  positions      PlayerPosition[]  // 가능 포지션 (복수)
  availableDates DateTime[]        // 가능 날짜 배열 — MAX 경과 시 만료
  regionIds      String[]          // 가능 지역 ID 배열
  timeSlot       String?           // 가능 시간대 (자유 텍스트, max 100)
  bio            String?           // 자기소개 (max 500)
  acceptsFee     Boolean @default(true)
  isDeleted      Boolean @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user           User                   @relation(fields: [userId], references: [id])
  recruitments   MercenaryRecruitment[]

  @@index([userId])
  @@map("mercenary_availabilities")
}

model MercenaryApplication {
  id          String                    @id @default(cuid())
  postId      String
  applicantId String                    // FK → User
  message     String?                   // max 100자
  status      MercenaryApplicationStatus @default(PENDING)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  post        MercenaryPost @relation(fields: [postId], references: [id])
  applicant   User          @relation(fields: [applicantId], references: [id])
  noShowReports NoShowReport[] @relation("AppNoShowReport")

  @@unique([postId, applicantId])
  @@map("mercenary_applications")
}

model MercenaryRecruitment {
  id               String                    @id @default(cuid())
  availabilityId   String
  recruitingClubId String                    // FK → Club
  recruitedBy      String                    // 신청한 관리자 userId (FK 없음)
  message          String?                   // max 100자
  contactName      String                    // 팀 담당자 이름 (기본값: admin.name)
  contactPhone     String                    // 팀 담당자 연락처 (기본값: admin.phone)
  status           MercenaryApplicationStatus @default(PENDING)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  availability     MercenaryAvailability @relation(fields: [availabilityId], references: [id])
  recruitingClub   Club                  @relation(fields: [recruitingClubId], references: [id])
  noShowReports    NoShowReport[]        @relation("RecNoShowReport")

  @@unique([availabilityId, recruitingClubId])
  @@map("mercenary_recruitments")
}

model NoShowReport {
  id             String             @id @default(cuid())
  reporterId     String             // 신고자 userId (FK 없음)
  reportedUserId String             // 피신고자 userId (FK 없음)
  applicationId  String?            // FK → MercenaryApplication (입단 기반)
  recruitmentId  String?            // FK → MercenaryRecruitment (영입 기반)
  reason         String             // 신고 사유 (max 200자)
  status         NoShowReportStatus @default(PENDING)
  reviewedBy     String?            // 운영자 userId (FK 없음)
  reviewedAt     DateTime?
  createdAt      DateTime @default(now())

  application    MercenaryApplication? @relation("AppNoShowReport", fields: [applicationId], references: [id])
  recruitment    MercenaryRecruitment? @relation("RecNoShowReport", fields: [recruitmentId], references: [id])

  @@unique([reporterId, applicationId])
  @@unique([reporterId, recruitmentId])
  @@map("no_show_reports")
}
```

> **Migration**: `npx prisma migrate dev --name add-mercenary-feature`

### DTO

**`mercenary-posts/dto/`**
- `create-mercenary-post.dto.ts` — positions, requiredCount, matchDate, startTime, endTime, location, address?, regionId, level, fee, description?, contactName, contactPhone
- `update-mercenary-post.dto.ts` — 위 전부 optional (PartialType)
- `filter-mercenary-post.dto.ts` — cursor, limit, dateFrom, dateTo, positions, regionId, level, includeExpired, includeClosed
- `create-mercenary-application.dto.ts` — message?

**`mercenary-availabilities/dto/`**
- `create-mercenary-availability.dto.ts` — positions, availableDates, regionIds, timeSlot?, bio?, acceptsFee
- `update-mercenary-availability.dto.ts` — PartialType
- `filter-mercenary-availability.dto.ts` — cursor, limit, date, positions, regionId, level, includeExpired
- `create-mercenary-recruitment.dto.ts` — message?, contactName, contactPhone

**`no-show-reports/dto/`**
- `create-no-show-report.dto.ts` — reportedUserId, applicationId?, recruitmentId?, reason

### Service 메서드

**`mercenary-posts.service.ts`**
```
getList(userId, dto)              — 목록 조회 (만료/마감 필터, 블랙리스트 유저 제외)
getMyPosts(userId)                — 내 팀 게시글 목록
getDetail(id, userId)             — 상세 (isOwnPost, canApply, alreadyApplied)
create(userId, dto)               — 등록 (관리자 확인, 블랙리스트 체크)
update(id, userId, dto)           — 수정 (OPEN 상태, 등록자 확인)
softDelete(id, userId)            — soft delete (등록자 확인)
apply(postId, userId, dto)        — 입단 신청 (phone 확인, 블랙리스트, 중복, 만료, 마감 체크)
getApplications(postId, userId)   — 지원자 목록 (등록팀 관리자만)
accept(postId, appId, userId)     — 수락 트랜잭션:
                                    1. Application ACCEPTED
                                    2. acceptedCount +1
                                    3. acceptedCount == requiredCount → status CLOSED + 잔여 PENDING 일괄 REJECTED
reject(postId, appId, userId)     — 거절 (등록팀 관리자, PENDING만)
isBlacklisted(userId): boolean    — 블랙리스트 판단 헬퍼 (mannerScore ≤ 20 OR noShowApproved ≥ 3 OR status = RESTRICTED)
```

**`mercenary-availabilities.service.ts`**
```
getList(userId, dto)                      — 목록 조회 (만료 필터, 블랙리스트 유저 제외)
getMyAvailabilities(userId)               — 내 게시글 목록
getMyRecruitments(userId)                 — 내가 받은 영입 신청 목록
getDetail(id, userId)                     — 상세 (canRecruit, alreadyRecruited)
create(userId, dto)                       — 등록 (블랙리스트 체크)
update(id, userId, dto)                   — 수정 (등록자, 만료 전만)
softDelete(id, userId)                    — soft delete (등록자)
recruit(availId, userId, dto)             — 영입 신청 (관리자 확인, phone 확인, 블랙리스트, 중복, 만료 체크)
acceptRecruitment(availId, recId, userId) — 수락 (게시글 등록자만, PENDING만)
rejectRecruitment(availId, recId, userId) — 거절 (게시글 등록자만)
```

**`no-show-reports.service.ts`**
```
create(reporterId, dto)  — 신고 생성 (신청/영입 ACCEPTED 확인, 경기 날짜 이후 확인, 중복 체크)
```

### Controller 엔드포인트

서버 모듈은 2개로 분리:
- `MercenaryPostsModule` — `/mercenary-posts` 라우트
- `MercenaryAvailabilitiesModule` — `/mercenary-availabilities` + `/no-show-reports` 라우트

모든 엔드포인트: `@ApiBearerAuth()`, `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()` 필수

---

## 7. 예외 처리

### 에러 코드 (`server/src/common/constants/error-codes.ts` 추가)

```ts
// ─── MercenaryPost ─────────────────────────────────────────────────────────
MERCENARY_POST_001: 'MERCENARY_POST_001',  // 존재하지 않는 게시글 404
MERCENARY_POST_002: 'MERCENARY_POST_002',  // 수정/삭제 권한 없음 403
MERCENARY_POST_003: 'MERCENARY_POST_003',  // OPEN 상태 아님 (마감·수정 불가) 409
MERCENARY_POST_004: 'MERCENARY_POST_004',  // 만료된 게시글 410
MERCENARY_POST_005: 'MERCENARY_POST_005',  // 본인 팀 게시글 지원 불가 403
MERCENARY_POST_006: 'MERCENARY_POST_006',  // 이미 지원한 게시글 409
MERCENARY_POST_007: 'MERCENARY_POST_007',  // 지원자 목록 조회 권한 없음 403

// ─── MercenaryAvailability ─────────────────────────────────────────────────
MERCENARY_AVAIL_001: 'MERCENARY_AVAIL_001', // 존재하지 않는 게시글 404
MERCENARY_AVAIL_002: 'MERCENARY_AVAIL_002', // 수정/삭제 권한 없음 403
MERCENARY_AVAIL_003: 'MERCENARY_AVAIL_003', // 만료된 게시글 410
MERCENARY_AVAIL_004: 'MERCENARY_AVAIL_004', // 이미 영입 신청한 게시글 409
MERCENARY_AVAIL_005: 'MERCENARY_AVAIL_005', // 본인 게시글에 영입 신청 불가 403

// ─── MercenaryApplication / Recruitment ────────────────────────────────────
MERCENARY_APP_001: 'MERCENARY_APP_001',  // 존재하지 않는 신청 404
MERCENARY_APP_002: 'MERCENARY_APP_002',  // 이미 처리된 신청 409

// ─── Blacklist ─────────────────────────────────────────────────────────────
MERCENARY_BLACKLIST: 'MERCENARY_BLACKLIST', // 블랙리스트 유저 403

// ─── NoShowReport ──────────────────────────────────────────────────────────
NO_SHOW_REPORT_001: 'NO_SHOW_REPORT_001', // 신고 가능한 수락 신청 없음 (경기 미참여) 403
NO_SHOW_REPORT_002: 'NO_SHOW_REPORT_002', // 경기 날짜 이전 신고 불가 422
NO_SHOW_REPORT_003: 'NO_SHOW_REPORT_003', // 이미 신고됨 409
```

### 클라이언트 에러 핸들링

| 에러 코드 | 표시 방법 | 메시지 |
|---|---|---|
| `MERCENARY_BLACKLIST` | toast.error | 지원/신청이 제한된 계정입니다. |
| `MERCENARY_POST_003` | toast.error | 이미 마감된 게시글입니다. |
| `MERCENARY_POST_004` | toast.error | 만료된 게시글입니다. |
| `MERCENARY_POST_006` | toast.error | 이미 지원한 게시글입니다. |
| `MERCENARY_AVAIL_004` | toast.error | 이미 신청한 게시글입니다. |
| `MERCENARY_APP_002` | toast.error | 이미 처리된 신청입니다. |
| `CLUB_NO_PERMISSION` | toast.error | 주장·부주장만 가능합니다. |
| phone 미설정 | AlertDialog | "연락처를 먼저 설정해주세요" |
| Zod 파싱 실패 | toast.error | 서버 응답 형식 오류 |

---

## 8. 구현 체크리스트

### 서버

**Prisma 스키마**
- [ ] `MercenaryPostStatus`, `MercenaryApplicationStatus`, `NoShowReportStatus` enum 추가
- [ ] `MercenaryPost` 모델 추가
- [ ] `MercenaryAvailability` 모델 추가 (PlayerPosition[], DateTime[], String[] 배열 타입)
- [ ] `MercenaryApplication` 모델 추가
- [ ] `MercenaryRecruitment` 모델 추가
- [ ] `NoShowReport` 모델 추가
- [ ] `User`, `Club`, `Region` 모델에 reverse relation 추가
- [ ] `npx prisma migrate dev --name add-mercenary-feature` 실행

**에러 코드**
- [ ] `error-codes.ts`에 MERCENARY_*, NO_SHOW_REPORT_* 추가

**모듈 생성**
- [ ] `nest g module features/mercenary-posts`
- [ ] `nest g service features/mercenary-posts`
- [ ] `nest g controller features/mercenary-posts`
- [ ] `nest g module features/mercenary-availabilities`
- [ ] `nest g service features/mercenary-availabilities`
- [ ] `nest g controller features/mercenary-availabilities`
- [ ] `no-show-reports` 서비스 + 컨트롤러 (mercenary-availabilities 모듈 내)

**DTO**
- [ ] `create/update/filter-mercenary-post.dto.ts`
- [ ] `create-mercenary-application.dto.ts`
- [ ] `create/update/filter-mercenary-availability.dto.ts`
- [ ] `create-mercenary-recruitment.dto.ts`
- [ ] `create-no-show-report.dto.ts`

**서비스**
- [ ] `isBlacklisted(userId)` 헬퍼 (mannerScore ≤ 20 OR noShowApproved ≥ 3 OR RESTRICTED)
- [ ] `mercenary-posts.service.ts` — getList, getMyPosts, getDetail, create, update, softDelete
- [ ] `mercenary-posts.service.ts` — apply, getApplications, accept(트랜잭션), reject
- [ ] accept 트랜잭션: acceptedCount 달성 시 CLOSED + 잔여 PENDING 일괄 거절
- [ ] `mercenary-availabilities.service.ts` — getList, getMyAvailabilities, getMyRecruitments, getDetail, create, update, softDelete
- [ ] `mercenary-availabilities.service.ts` — recruit, acceptRecruitment, rejectRecruitment
- [ ] `no-show-reports.service.ts` — create (경기 날짜 이후 확인, 중복 체크)

**컨트롤러**
- [ ] 모든 엔드포인트 Swagger 데코레이터 추가
- [ ] `@UseGuards(AuthGuard)` 전체 적용

### 클라이언트

**스캐폴딩**
- [ ] `cd client && npm run feature mercenary` 실행

**Data Layer**
- [ ] `mercenaryPost.schema.ts` — Zod 스키마 정의
- [ ] `mercenaryAvailability.schema.ts` — Zod 스키마 정의
- [ ] `mercenaryPost.service.ts` — API 호출 함수
- [ ] `mercenaryAvailability.service.ts` — API 호출 함수
- [ ] `noShowReport.service.ts`
- [ ] `mercenaryQueryKeys.ts`
- [ ] `useMercenaryPosts.ts` — useQuery/useMutation
- [ ] `useMercenaryApplications.ts`
- [ ] `useMercenaryAvailabilities.ts`

**UI Layer — Components**
- [ ] `MercenaryPostCard.tsx`
- [ ] `MercenaryAvailabilityCard.tsx`
- [ ] `MercenaryStatusBadge.tsx`
- [ ] `MercenaryApplicationCard.tsx`
- [ ] `MercenaryRecruitmentCard.tsx`
- [ ] `ApplyBottomSheet.tsx` (지원하기)
- [ ] `RecruitBottomSheet.tsx` (영입 신청)
- [ ] `PositionPicker.tsx` (포지션 복수 선택)
- [ ] `DateMultiPicker.tsx` (날짜 복수 선택)

**UI Layer — Views**
- [ ] `MercenaryTabView.tsx`
- [ ] `MercenaryPostListView.tsx`
- [ ] `MercenaryPostDetailView.tsx`
- [ ] `MercenaryPostFormView.tsx`
- [ ] `ApplicationListView.tsx`
- [ ] `MercenaryAvailabilityListView.tsx`
- [ ] `MercenaryAvailabilityDetailView.tsx`
- [ ] `MercenaryAvailabilityFormView.tsx`
- [ ] `MyRecruitmentsView.tsx`

**UI Layer — Containers**
- [ ] `MercenaryTabContainer.tsx`
- [ ] `MercenaryPostListContainer.tsx`
- [ ] `MercenaryPostDetailContainer.tsx` (phone guard + 블랙리스트 가드)
- [ ] `MercenaryPostCreateContainer.tsx` (phone guard + 블랙리스트 가드)
- [ ] `MercenaryPostEditContainer.tsx`
- [ ] `ApplicationListContainer.tsx` (수락 시 캐시 즉시 반영)
- [ ] `MercenaryAvailabilityListContainer.tsx`
- [ ] `MercenaryAvailabilityDetailContainer.tsx` (phone guard + 블랙리스트 가드)
- [ ] `MercenaryAvailabilityCreateContainer.tsx`
- [ ] `MercenaryAvailabilityEditContainer.tsx`
- [ ] `MyRecruitmentsContainer.tsx`

**라우트**
- [ ] `app/(app)/mercenary/index.tsx` — 탭 진입
- [ ] `app/(app)/mercenary/post/[id].tsx`
- [ ] `app/(app)/mercenary/post/create.tsx`
- [ ] `app/(app)/mercenary/post/[id]/edit.tsx`
- [ ] `app/(app)/mercenary/post/[id]/applications.tsx`
- [ ] `app/(app)/mercenary/availability/[id].tsx`
- [ ] `app/(app)/mercenary/availability/create.tsx`
- [ ] `app/(app)/mercenary/availability/[id]/edit.tsx`
- [ ] `app/(app)/mercenary/my-recruitments.tsx`
