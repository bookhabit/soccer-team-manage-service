# match-feed Plan

## 1. 기능 개요

- **목적**: 기록이 완료된 전체 클럽의 경기 결과를 타임라인 피드로 노출하여, 경기가 없는 날에도 앱 재방문을 유도하고 상대 전적 탐색 진입점을 제공한다.

- **핵심 사용자 시나리오 (GIVEN-WHEN-THEN)**:

  **시나리오 1 — 전체 피드 탐색**
  - GIVEN: 로그인된 유저가 홈 탭에 진입했다
  - WHEN: 피드 섹션이 렌더링된다
  - THEN: `isRecordSubmitted = true`, `isDeleted = false` 조건의 최신 경기 결과가 커서 기반 무한 스크롤로 노출된다

  **시나리오 2 — 지역 필터**
  - GIVEN: 유저가 피드 필터 바에서 "서울특별시 > 은평구"를 선택했다
  - WHEN: 필터가 적용된다
  - THEN: 클럽 소재지가 은평구인 클럽의 경기 결과만 노출된다

  **시나리오 3 — 내 클럽 경기 필터 (소속 있음)**
  - GIVEN: 클럽에 소속된 유저가 "내 클럽만" 토글을 활성화했다
  - WHEN: 필터가 적용된다
  - THEN: 본인 클럽의 경기 결과만 노출된다

  **시나리오 4 — 내 클럽 경기 필터 (미소속)**
  - GIVEN: 클럽에 소속되지 않은 유저가 "내 클럽만" 토글을 탭했다
  - WHEN: 토글 탭 이벤트가 발생한다
  - THEN: 토글은 비활성 상태를 유지하고 "클럽에 가입하면 사용할 수 있어요" 안내가 표시된다

  **시나리오 5 — 경기 상세 진입**
  - GIVEN: 유저가 피드 아이템을 탭했다
  - WHEN: 네비게이션이 발생한다
  - THEN: 해당 경기의 공개 결과 상세 화면으로 이동하며, 스코어/득점 타임라인/MOM/참여 선수 수가 읽기 전용으로 표시된다

  **시나리오 6 — district only 필터 요청 (에러)**
  - GIVEN: 클라이언트가 `province` 없이 `district`만 쿼리 파라미터로 전송했다
  - WHEN: 서버가 요청을 수신한다
  - THEN: `MATCH_FEED_001` 에러 코드와 함께 400 응답이 반환된다

  **시나리오 7 — 날짜 범위 초과 (에러)**
  - GIVEN: 클라이언트가 `from`~`to` 범위가 6개월을 초과하는 요청을 보냈다
  - WHEN: 서버가 요청을 수신한다
  - THEN: `MATCH_FEED_002` 에러 코드와 함께 400 응답이 반환된다

---

## 2. 클라이언트 라우트

| 경로 | 설명 | 내비게이션 타입 |
|---|---|---|
| `/(app)/(tabs)/home` (기존 홈 탭) | 피드 섹션 통합 — 별도 라우트 없음 | 탭 네비게이션 |
| `/(app)/match-feed/[matchId]` | 경기 공개 결과 상세 (읽기 전용) | push |

---

## 3. API 설계

| Method | Endpoint | 설명 | Auth |
|---|---|---|---|
| GET | `/match-feed` | 피드 목록 (커서 페이지네이션) | 필수 |
| GET | `/match-feed/:matchId` | 단일 경기 공개 결과 상세 | 필수 |

### 쿼리 파라미터 상세 (`GET /match-feed`)

| 파라미터 | 타입 | 기본값 | 검증 규칙 |
|---|---|---|---|
| `cursor` | `string?` | — | 커서 matchId |
| `limit` | `number?` | `20` | 최대 `50` |
| `province` | `string?` | — | `Region.name` 기준 |
| `district` | `string?` | — | `province` 없으면 `MATCH_FEED_001` (400) |
| `type` | `"LEAGUE" \| "SELF"?` | — | enum 검증 |
| `myClub` | `boolean?` | `false` | 클럽 미소속 시 서버에서 무시 |
| `myMatches` | `boolean?` | `false` | 로그인 유저 ID 기준 |
| `from` | `string?` (ISO date) | — | — |
| `to` | `string?` (ISO date) | — | `from`~`to` 범위 6개월 초과 시 `MATCH_FEED_002` (400) |

---

## 4. 데이터 레이어 설계 (`client/src/features/match-feed/data/`)

### Schemas (Zod)

**파일**: `schemas/matchFeed.schema.ts`

```ts
// 피드 아이템 스키마
matchFeedItemSchema       // 피드 1건: id, type, clubName, clubLogoUrl,
                          // homeScore, awayScore, opponentName?,
                          // momUserName?, momUserId?,
                          // province, district, location, startAt

// 피드 목록 페이지 스키마
matchFeedPageSchema       // items: matchFeedItemSchema[], nextCursor: string | null

// 경기 상세 스키마
matchFeedDetailSchema     // id, type, clubName, opponentName?,
                          // homeScore, awayScore,
                          // goals: matchGoalItemSchema[],  // { scorerName, assistName?, quarterNumber?, team? }
                          // momList: momItemSchema[],       // { userId, userName }  동점 시 복수
                          // participantCount,
                          // province, district, location, startAt

// 필터 파라미터 타입
matchFeedFilterSchema     // province?, district?, type?, myClub?, myMatches?, from?, to?
```

**타입 export**: `MatchFeedItem`, `MatchFeedDetail`, `MatchFeedFilter`

### Services

**파일**: `services/matchFeed.service.ts`

```ts
export const matchFeedService = {
  /**
   * 피드 목록 한 페이지를 조회한다 (커서 기반 페이지네이션).
   * @param params cursor?, limit?, 필터 조건
   * @returns matchFeedPageSchema 파싱 결과
   */
  getFeedPage: async (params: GetFeedPageParams): Promise<MatchFeedPage> => { ... }

  /**
   * 단일 경기 공개 결과 상세를 조회한다.
   * @param matchId 경기 ID
   * @returns matchFeedDetailSchema 파싱 결과
   */
  getDetail: async (matchId: string): Promise<MatchFeedDetail> => { ... }
}
```

- 두 함수 모두 `privateApi` 사용, 응답은 Zod 스키마로 `parse`

### Hooks

**파일**: `hooks/useMatchFeed.ts`

```ts
/**
 * 피드 무한 스크롤 훅.
 * useSuspenseInfiniteQuery 사용, getNextPageParam은 nextCursor 기반.
 * queryKey: matchFeedQueryKeys.list(filter)
 */
export function useMatchFeed(filter: MatchFeedFilter) { ... }
```

**파일**: `hooks/useMatchFeedDetail.ts`

```ts
/**
 * 경기 상세 데이터 훅.
 * useSuspenseQuery 사용.
 * queryKey: matchFeedQueryKeys.detail(matchId)
 */
export function useMatchFeedDetail(matchId: string) { ... }
```

**파일**: `hooks/matchFeedQueryKeys.ts`

```ts
export const matchFeedQueryKeys = {
  all: ['match-feed'] as const,
  list: (filter: MatchFeedFilter) => [...matchFeedQueryKeys.all, 'list', filter] as const,
  detail: (matchId: string) => [...matchFeedQueryKeys.all, 'detail', matchId] as const,
}
```

---

## 5. UI 레이어 설계 (`client/src/features/match-feed/ui/`)

### Container

**`container/MatchFeedContainer.tsx`**
- 역할: 필터 상태 관리, `useMatchFeed` 데이터 주입, `fetchNextPage` 핸들러 조립
- `useMyClub()` 호출 → 클럽 소속 여부 확인 → `myClub` 토글 비활성화 제어
- `useMyProfile()` 호출 → userId → `myMatches` 필터에 주입
- `useSuspenseInfiniteQuery` 사용이므로 `AsyncBoundary`로 감싼다
- pages 평탄화: `data.pages.flatMap(p => p.items)`
- `MatchFeedView`에 전달: `items`, `filter`, `hasNextPage`, `isLoadingMore`, `onFilterChange`, `onLoadMore`

**`container/MatchFeedDetailContainer.tsx`**
- 역할: `useMatchFeedDetail(matchId)` 데이터 주입
- `AsyncBoundary`로 감싸고 `MatchFeedDetailView`에 `detail` prop 전달

### View / Components

**`view/MatchFeedView.tsx`**
- 역할: 필터 바 + 피드 FlatList 레이아웃
- props: `items`, `filter`, `hasNextPage`, `isLoadingMore`, `onFilterChange`, `onLoadMore`, `onItemPress`
- 빈 상태: `EmptyBoundary` 없이 View 내부에서 상태 판별 변수로 처리
  - `isEmptyFeed = items.length === 0` → `MatchFeedEmptyView` 렌더
- 필터 결과 없음 메시지는 활성 필터 종류에 따라 분기

**`view/MatchFeedDetailView.tsx`**
- 역할: 경기 상세 전체 레이아웃 (읽기 전용)
- LEAGUE 경기에만 "상대 전적 보기" 버튼 표시
- props: `detail: MatchFeedDetail`, `onGoBack`, `onGoOpponentRecord?`

**`components/MatchFeedItem.tsx`**
- LEAGUE / SELF 유형에 따라 다른 레이아웃 분기 렌더
- LEAGUE: 홈팀명, 스코어, 상대팀명, MOM, 지역, 날짜
- SELF: 클럽명, "자체전" 레이블, A팀:B팀 스코어, 지역, 날짜
- props: `item: MatchFeedItem`, `onPress`

**`components/MatchFeedFilterBar.tsx`**
- 지역 필터(province/district 드릴다운 Drawer), 유형 필터(Chip), 내 클럽 토글, 내가 뛴 경기 토글
- 내 클럽 토글: `isClubMember` prop으로 비활성 제어 및 안내 문구 표시
- props: `filter`, `isClubMember`, `onChange`

**`components/MatchGoalTimeline.tsx`**
- 상세 화면용 득점 타임라인 — 쿼터별 득점자/어시스트 나열

**`view/MatchFeedEmptyView.tsx`**
- 빈 상태 메시지 컴포넌트 (필터 상태에 따라 적절한 메시지 표시)

**`view/MatchFeedLoadingView.tsx`**
- 피드 스켈레톤 UI (AsyncBoundary fallback)

---

## 6. 서버 레이어 설계 (`server/src/features/match-feed/`)

### DTO

**`dto/get-match-feed.dto.ts`**

```ts
export class GetMatchFeedDto {
  @IsOptional() @IsString()
  cursor?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50)
  limit?: number;         // 기본 20

  @IsOptional() @IsString()
  province?: string;

  @IsOptional() @IsString()
  district?: string;      // province 없으면 서비스에서 MATCH_FEED_001

  @IsOptional() @IsEnum(MatchType)
  type?: MatchType;

  @IsOptional() @Transform(({ value }) => value === 'true')  @IsBoolean()
  myClub?: boolean;

  @IsOptional() @Transform(({ value }) => value === 'true') @IsBoolean()
  myMatches?: boolean;

  @IsOptional() @IsDateString()
  from?: string;

  @IsOptional() @IsDateString()
  to?: string;             // from~to 범위 6개월 초과 시 서비스에서 MATCH_FEED_002
}
```

**`dto/match-feed-item.response.dto.ts`**

```ts
export class MatchFeedItemResponseDto {
  id: string;
  type: MatchType;            // LEAGUE | SELF
  clubId: string;
  clubName: string;
  clubLogoUrl: string | null;
  homeScore: number;
  awayScore: number;
  opponentName: string | null; // LEAGUE만
  momUserName: string | null;  // 최다 득표자 1명 (동점 시 첫 번째)
  momUserId: string | null;
  province: string;
  district: string;
  location: string;
  startAt: string;             // ISO 8601
}

export class MatchFeedPageResponseDto {
  items: MatchFeedItemResponseDto[];
  nextCursor: string | null;
}
```

**`dto/match-feed-detail.response.dto.ts`**

```ts
export class MatchGoalItemDto {
  scorerUserId: string;
  scorerUserName: string;
  assistUserId: string | null;
  assistUserName: string | null;
  quarterNumber: number | null;
  team: string | null;         // SELF 경기 A/B
}

export class MomItemDto {
  userId: string;
  userName: string;
  voteCount: number;
}

export class MatchFeedDetailResponseDto {
  id: string;
  type: MatchType;
  clubId: string;
  clubName: string;
  clubLogoUrl: string | null;
  homeScore: number;
  awayScore: number;
  opponentName: string | null;
  goals: MatchGoalItemDto[];
  momList: MomItemDto[];        // 최다 득표자 (동점 시 복수)
  participantCount: number;
  province: string;
  district: string;
  location: string;
  startAt: string;
}
```

### Service 메서드

**`match-feed.service.ts`**

```ts
/**
 * 피드 목록 커서 페이지네이션 조회.
 *
 * - Match.isRecordSubmitted = true, isDeleted = false 고정 조건
 * - 정렬: startAt DESC, id DESC (커서 안정성 보장)
 * - province/district: Club → Region join 후 필터
 * - myClub: ClubMember에서 userId → clubId 조회 후 Match.clubId 필터 (미소속 시 조건 무시)
 * - myMatches: MatchParticipant.userId = currentUserId 조건
 * - MOM: MomVote GROUP BY targetUserId → MAX count 1명 추출
 *
 * 검증:
 * - district 있고 province 없으면 → MATCH_FEED_001 (400)
 * - from~to 범위 > 6개월 → MATCH_FEED_002 (400)
 */
getFeed(dto: GetMatchFeedDto, userId: string): Promise<MatchFeedPageResponseDto>

/**
 * 단일 경기 공개 결과 상세 조회.
 *
 * - isRecordSubmitted = true, isDeleted = false 확인
 * - goals: MatchGoal + User join (scorerUserName, assistUserName)
 * - momList: MomVote GROUP BY targetUserId ORDER BY count DESC
 *   → 최다 득표 count와 동일한 모든 row 반환
 * - participantCount: MatchParticipant count
 *
 * 예외:
 * - 미존재 / isDeleted = true / isRecordSubmitted = false → MATCH_001 (404)
 */
getDetail(matchId: string, userId: string): Promise<MatchFeedDetailResponseDto>
```

### Controller 엔드포인트

**`match-feed.controller.ts`**

```ts
@Controller('match-feed')
@UseGuards(AuthGuard)
export class MatchFeedController {

  @Get()
  @ApiOperation({ summary: '경기 결과 피드 목록 조회 (커서 페이지네이션)' })
  @ApiResponse({ status: 200, description: '피드 목록 반환' })
  @ApiResponse({ status: 400, description: 'MATCH_FEED_001 | MATCH_FEED_002' })
  getFeed(
    @Query() dto: GetMatchFeedDto,
    @User() user: UserEntity,
  ): Promise<MatchFeedPageResponseDto>

  @Get(':matchId')
  @ApiOperation({ summary: '경기 공개 결과 상세 조회' })
  @ApiResponse({ status: 200, description: '경기 상세 반환' })
  @ApiResponse({ status: 404, description: 'MATCH_001 — 존재하지 않는 경기' })
  getDetail(
    @Param('matchId') matchId: string,
    @User() user: UserEntity,
  ): Promise<MatchFeedDetailResponseDto>
}
```

### 인덱스 추가 (Migration)

```prisma
@@index([isRecordSubmitted, startAt(sort: Desc), isDeleted])  // Match — 피드 기본 정렬
@@index([userId])                                              // MatchParticipant — 내가 뛴 경기
```

---

## 7. 예외 처리

### 서버 에러 코드

| 코드 | 설명 | HTTP |
|---|---|---|
| `MATCH_FEED_001` | `district`만 있고 `province` 누락 | 400 |
| `MATCH_FEED_002` | `from`~`to` 날짜 범위가 6개월 초과 | 400 |
| `MATCH_001` | 존재하지 않거나 삭제/미제출 경기 (상세 조회) | 404 |

### 클라이언트 에러 처리

| 에러 종류 | 처리 방식 |
|---|---|
| 피드 목록 Query 에러 | `AsyncBoundary` (ErrorBoundary) 인라인 에러 뷰 + 재시도 버튼 |
| 피드 상세 Query 에러 | `AsyncBoundary` (ErrorBoundary) 인라인 에러 뷰 + 뒤로가기 |
| 빈 피드 (200 OK, 빈 배열) | `MatchFeedEmptyView` — 활성 필터에 따른 메시지 분기 |
| 내 클럽 토글 (미소속 탭) | 토글 비활성 유지 + 안내 문구 표시 (에러 아님) |

### 빈 상태 메시지 분기

| 조건 | 메시지 |
|---|---|
| 필터 없음, 결과 없음 | "아직 등록된 경기 결과가 없습니다." |
| 지역 필터 활성, 결과 없음 | "해당 지역에 등록된 경기 결과가 없습니다." |
| 내가 뛴 경기 필터, 결과 없음 | "참가한 경기 기록이 없습니다." |
| SELF 유형 필터, 결과 없음 | "등록된 자체전 기록이 없습니다." |

---

## 8. 구현 체크리스트

### 서버

- [ ] `match-feed` 모듈 스캐폴딩 (`nest g module/service/controller features/match-feed`)
- [ ] `GetMatchFeedDto` — class-validator 데코레이터 + `@Transform` boolean 변환
- [ ] `MatchFeedItemResponseDto`, `MatchFeedPageResponseDto` 정의
- [ ] `MatchFeedDetailResponseDto`, `MatchGoalItemDto`, `MomItemDto` 정의
- [ ] `MatchFeedService.getFeed` 구현
  - [ ] `district` + no `province` → `MATCH_FEED_001` (400) 검증
  - [ ] `from`~`to` 6개월 초과 → `MATCH_FEED_002` (400) 검증
  - [ ] `isRecordSubmitted = true`, `isDeleted = false` 고정 필터
  - [ ] province/district → Club → Region join 필터
  - [ ] `myClub` → ClubMember에서 clubId 조회 후 Match.clubId 필터 (미소속 무시)
  - [ ] `myMatches` → MatchParticipant.userId 서브쿼리
  - [ ] MOM → MomVote GROUP BY targetUserId, MAX count 추출
  - [ ] 커서 기반 페이지네이션 (cursor matchId 기반, startAt DESC, id DESC)
- [ ] `MatchFeedService.getDetail` 구현
  - [ ] 미존재/삭제/미제출 → `MATCH_001` (404)
  - [ ] goals + User join (scorerUserName, assistUserName)
  - [ ] momList GROUP BY + 동점 복수 처리
  - [ ] participantCount
- [ ] `MatchFeedController` — `@UseGuards(AuthGuard)`, Swagger 데코레이터 작성
- [ ] `MatchParticipant`에 `@@index([userId])` 추가 Migration
- [ ] `Match`에 `@@index([isRecordSubmitted, startAt, isDeleted])` 추가 Migration

### 클라이언트

- [ ] `matchFeed.schema.ts` — Zod 스키마 및 타입 정의
- [ ] `matchFeed.service.ts` — `getFeedPage`, `getDetail` 순수 함수 구현 (privateApi + Zod parse)
- [ ] `matchFeedQueryKeys.ts` — 쿼리 키 상수 정의
- [ ] `useMatchFeed.ts` — `useSuspenseInfiniteQuery`, cursor 기반 `getNextPageParam`
- [ ] `useMatchFeedDetail.ts` — `useSuspenseQuery`
- [ ] `MatchFeedFilterBar.tsx` — 지역/유형/내 클럽/내가 뛴 경기 필터 UI
- [ ] `MatchFeedItem.tsx` — LEAGUE/SELF 분기 렌더
- [ ] `MatchGoalTimeline.tsx` — 득점 타임라인 컴포넌트
- [ ] `MatchFeedEmptyView.tsx`, `MatchFeedLoadingView.tsx` (Skeleton)
- [ ] `MatchFeedView.tsx` — FlatList + 필터 바, 빈 상태 처리
- [ ] `MatchFeedDetailView.tsx` — 상세 레이아웃, LEAGUE일 때 "상대 전적 보기" 버튼
- [ ] `MatchFeedContainer.tsx` — `useMyClub`, `useMyProfile`, `useMatchFeed` 조립, `AsyncBoundary` 래핑
- [ ] `MatchFeedDetailContainer.tsx` — `useMatchFeedDetail` 조립, `AsyncBoundary` 래핑
- [ ] `/(app)/match-feed/[matchId].tsx` 라우트 파일 생성 — `MatchFeedDetailContainer` 연결
- [ ] 홈 탭 화면에 `MatchFeedContainer` 섹션 통합
- [ ] `useMyClub` 훅으로 클럽 소속 여부 확인 후 `myClub` 토글 비활성 로직 연결
