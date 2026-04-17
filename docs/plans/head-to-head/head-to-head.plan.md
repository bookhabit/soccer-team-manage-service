# Head-to-Head (상대 전적) Plan

## 1. 기능 개요

- **목적**: 두 클럽 간 역대 맞대결 전적(승/무/패 요약 + 이력)을 조회한다. 매칭 경기 피드 상세에서 진입하며, 내 클럽이 요청 주체일 때만 접근 가능하다.

- **핵심 사용자 시나리오**

  **시나리오 1 — 상대 전적 진입**
  - GIVEN: 사용자가 `마무리FC` 소속이고, 피드 상세(`detail.clubId === myClub.id`, `detail.opponentClubId !== null`)를 보고 있다.
  - WHEN: "상대 전적 보기" 버튼을 누른다.
  - THEN: `/(app)/club/{clubId}/head-to-head/{opponentClubId}` 화면으로 이동하고, 승/무/패 요약 및 최근 맞대결 이력이 표시된다.

  **시나리오 2 — 맞대결 이력 없음**
  - GIVEN: 두 클럽이 LEAGUE 경기를 치른 이력이 없다.
  - WHEN: H2H 화면에 진입한다.
  - THEN: 요약은 0승 0무 0패로 표시되고, 이력 영역에 "아직 맞붙은 적이 없습니다." 빈 상태 UI가 노출된다.

  **시나리오 3 — 무한 스크롤 페이지네이션**
  - GIVEN: 맞대결 이력이 10건을 초과한다.
  - WHEN: 목록 하단에 도달한다.
  - THEN: 다음 10건이 자동 로드된다.

  **시나리오 4 — 권한 차단**
  - GIVEN: 사용자가 `clubId` 소속이 아니다.
  - WHEN: API를 직접 호출한다.
  - THEN: 서버가 403을 반환하고, 클라이언트에서는 버튼 자체를 숨겨 진입을 차단한다.

---

## 2. 클라이언트 라우트

| 경로 | 설명 | 내비게이션 타입 |
|---|---|---|
| `/(app)/club/[clubId]/head-to-head/[opponentClubId]` | H2H 상세 화면 | Stack push |

**진입점**: `MatchFeedDetailContainer`의 `onGoOpponentRecord` 핸들러
```ts
onGoOpponentRecord={
  detail.clubId === myClub?.id && detail.opponentClubId
    ? () => router.push(`/(app)/club/${detail.clubId}/head-to-head/${detail.opponentClubId}` as Href)
    : undefined
}
```

---

## 3. API 설계

| Method | Endpoint | 설명 | Auth |
|---|---|---|---|
| `GET` | `/clubs/:clubId/head-to-head/:opponentClubId` | H2H 요약 + 이력 (cursor 페이지네이션) | 필수 (JWT) |

**Query Params**
| 파라미터 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `cursor` | `string` (ISO 날짜) | 없음 | 다음 페이지 커서 (`startAt` 기준) |
| `limit` | `number` | `10` | 페이지 크기 |

**응답**
```json
{
  "summary": {
    "myClubId": "club-a",
    "opponentClubId": "club-b",
    "myClubName": "마무리FC",
    "opponentClubName": "카동FC",
    "wins": 3,
    "draws": 1,
    "losses": 2,
    "goalsFor": 11,
    "goalsAgainst": 9
  },
  "history": [
    {
      "matchId": "match-xxx",
      "date": "2025-03-15T14:00:00.000Z",
      "myScore": 2,
      "opponentScore": 1,
      "result": "WIN"
    }
  ],
  "nextCursor": "2025-01-10T14:00:00.000Z",
  "hasNextPage": true
}
```

---

## 4. 데이터 레이어 설계 (`client/src/features/head-to-head/data/`)

### Schemas (Zod) — `data/schemas/headToHead.schema.ts`

```ts
// H2H 요약
headToHeadSummarySchema = z.object({
  myClubId: z.string(),
  opponentClubId: z.string(),
  myClubName: z.string(),
  opponentClubName: z.string(),
  wins: z.number().int(),
  draws: z.number().int(),
  losses: z.number().int(),
  goalsFor: z.number().int(),
  goalsAgainst: z.number().int(),
})

// 이력 단건
headToHeadResultSchema = z.enum(['WIN', 'DRAW', 'LOSS'])
headToHeadHistoryItemSchema = z.object({
  matchId: z.string(),
  date: z.string(),
  myScore: z.number().int(),
  opponentScore: z.number().int(),
  result: headToHeadResultSchema,
})

// 페이지 응답
headToHeadPageSchema = z.object({
  summary: headToHeadSummarySchema,
  history: z.array(headToHeadHistoryItemSchema),
  nextCursor: z.string().nullable(),
  hasNextPage: z.boolean(),
})
```

**추가 작업**: `matchFeedDetailSchema`에 `opponentClubId: z.string().nullable()` 필드 추가.

### Services — `data/services/headToHead.service.ts`

| 함수 | 설명 |
|---|---|
| `getHeadToHead(clubId, opponentClubId, cursor?, limit?)` | H2H 조회 API 호출 → `headToHeadPageSchema` 파싱 |

### Hooks — `data/hooks/useHeadToHead.ts`

| Hook | 내부 쿼리 | 설명 |
|---|---|---|
| `useHeadToHead(clubId, opponentClubId)` | `useSuspenseInfiniteQuery` | 첫 페이지 요약 + 이력, cursor 기반 무한 스크롤 |

```ts
const H2H_QUERY_KEYS = {
  detail: (clubId: string, opponentClubId: string) =>
    ['head-to-head', clubId, opponentClubId] as const,
};
```

`getNextPageParam`: 응답의 `nextCursor` (null이면 undefined 반환 → 스크롤 중단)

---

## 5. UI 레이어 설계 (`client/src/features/head-to-head/ui/`)

### Container — `ui/container/HeadToHeadContainer.tsx`

- `useHeadToHead(clubId, opponentClubId)` 호출
- 모든 페이지의 `history` 배열을 `flatMap`으로 병합
- `summary`는 첫 번째 페이지에서 추출 (cursor 갱신 시 고정)
- `fetchNextPage`, `hasNextPage` 전달
- `AsyncBoundary` + `Suspense` 적용

### View — `ui/view/HeadToHeadView.tsx`

| Props | 타입 | 설명 |
|---|---|---|
| `summary` | `HeadToHeadSummary` | 요약 데이터 |
| `history` | `HeadToHeadHistoryItem[]` | 전체 이력 (누적) |
| `hasNextPage` | `boolean` | 다음 페이지 존재 여부 |
| `onLoadMore` | `() => void` | 스크롤 끝 이벤트 |

- `FlatList` 사용: `ListHeaderComponent`에 요약 카드, `data`에 이력 목록
- 빈 상태: `ListEmptyComponent`에 "아직 맞붙은 적이 없습니다." 텍스트
- `onEndReached`: `hasNextPage ? onLoadMore : undefined`

### Components — `ui/components/`

| 컴포넌트 | 설명 |
|---|---|
| `H2HSummaryCard` | 두 클럽 이름 + 승/무/패 + 득실점 요약 카드 |
| `H2HHistoryItem` | 이력 단건: 날짜 · 스코어 · 결과 뱃지 (WIN/DRAW/LOSS 컬러) |
| `H2HSummarySkeleton` | 요약 카드 로딩 Skeleton |
| `H2HHistoryItemSkeleton` | 이력 행 로딩 Skeleton (3개 반복) |

---

## 6. 서버 레이어 설계 (`server/src/features/head-to-head/`)

### DTO

**`dto/get-head-to-head.dto.ts`**
```ts
class GetHeadToHeadQueryDto {
  @IsOptional() @IsISO8601() cursor?: string;
  @IsOptional() @IsInt() @Min(1) @Max(50) @Type(() => Number) limit?: number = 10;
}
```

**`dto/head-to-head-response.dto.ts`**
```ts
class HeadToHeadSummaryDto { myClubId, opponentClubId, myClubName, opponentClubName, wins, draws, losses, goalsFor, goalsAgainst }
class HeadToHeadHistoryItemDto { matchId, date (ISO), myScore, opponentScore, result: 'WIN'|'DRAW'|'LOSS' }
class HeadToHeadResponseDto { summary: HeadToHeadSummaryDto, history: HeadToHeadHistoryItemDto[], nextCursor: string | null, hasNextPage: boolean }
```

### Service 메서드 — `head-to-head.service.ts`

**`getHeadToHead(myClubId, opponentClubId, userId, cursor?, limit)`**

```
1. userId가 myClubId 소속인지 ClubMember 확인 (없으면 403 H2H_001)
2. myClubId, opponentClubId 클럽 존재 확인 (없으면 404 H2H_002)
3. [요약 집계]
   - Match.findMany WHERE:
       clubId = myClubId
       isDeleted = false
       isRecordSubmitted = true
       matchPostId IN (
         MatchPost WHERE clubId = opponentClubId (HOST 시나리오)
         UNION
         MatchPost WHERE id IN (
           MatchApplication WHERE applicantClubId = opponentClubId AND status = ACCEPTED
         ) AND clubId = myClubId (GUEST 시나리오)
       )
   - 각 Match에서 HOST/GUEST 판별 → myScore/opponentScore 계산
   - 집계: wins, draws, losses, goalsFor, goalsAgainst
4. [이력 페이지네이션]
   - 위 쿼리에 cursor(startAt < cursor) + take(limit+1) + orderBy(startAt DESC) 적용
   - limit+1번째 항목 존재 시 hasNextPage=true, nextCursor 설정
5. 응답 조립
```

**스코어 정규화 로직 (서비스 내 헬퍼)**:
```ts
function normalizeScore(match: Match, myClubId: string, matchPost: MatchPost | null) {
  const isHost = matchPost?.clubId === myClubId;
  return {
    myScore: isHost ? match.homeScore : match.awayScore,
    opponentScore: isHost ? match.awayScore : match.homeScore,
  };
}
```

### Controller 엔드포인트 — `head-to-head.controller.ts`

```ts
@UseGuards(AuthGuard)
@Get(':clubId/head-to-head/:opponentClubId')
@ApiOperation({ summary: '클럽 간 상대 전적 조회' })
@ApiResponse({ status: 200, type: HeadToHeadResponseDto })
@ApiResponse({ status: 403, description: 'H2H_001: 해당 클럽 소속이 아님' })
@ApiResponse({ status: 404, description: 'H2H_002: 클럽 없음' })
async getHeadToHead(
  @Param('clubId') clubId: string,
  @Param('opponentClubId') opponentClubId: string,
  @Query() query: GetHeadToHeadQueryDto,
  @CurrentUser() user: JwtPayload,
): Promise<HeadToHeadResponseDto>
```

**등록 위치**: `ClubModule` 내부가 아닌 독립 `HeadToHeadModule`로 분리.
`ClubsController` prefix(`/clubs`)에 중첩: `/clubs/:clubId/head-to-head/:opponentClubId`

---

## 7. 예외 처리

### 신규 에러코드 (`error-codes.ts`에 추가)

```ts
H2H_001: 'H2H_001', // 해당 클럽 소속이 아님 403
H2H_002: 'H2H_002', // 클럽(들) 존재하지 않음 404
```

### 클라이언트 처리

| 상황 | 처리 |
|---|---|
| 403 H2H_001 | `QueryErrorBoundary` → ErrorFallback |
| 404 H2H_002 | `QueryErrorBoundary` → ErrorFallback |
| 네트워크 에러 | `QueryErrorBoundary` → ErrorFallback (재시도 버튼) |
| 빈 이력 (200 OK) | `ListEmptyComponent` → "아직 맞붙은 적이 없습니다." |

---

## 8. 사전 의존 작업 (구현 전 필수)

- [ ] `MatchFeedDetailResponseDto`에 `opponentClubId: string | null` 필드 추가 (서버)
- [ ] `matchFeedDetailSchema`에 `opponentClubId: z.string().nullable()` 추가 (클라이언트)
- [ ] `MatchFeedDetailContainer`의 `onGoOpponentRecord` 핸들러 구현
- [ ] `Match` 모델 `@@index([matchPostId])` 마이그레이션 실행

---

## 9. 구현 체크리스트

### 사전 의존 (match-feed 수정)
- [ ] `MatchFeedDetailResponseDto` — `opponentClubId: string | null` 추가
- [ ] `match-feed.service.ts` — detail 응답에 `opponentClubId` 도출 로직 추가
- [ ] `matchFeedDetailSchema` — `opponentClubId` 필드 추가
- [ ] `MatchFeedDetailContainer` — `onGoOpponentRecord` 핸들러 구현 및 라우트 생성

### 마이그레이션
- [ ] `Match` 모델 `@@index([matchPostId])` 추가 → `npx prisma migrate dev --name add_match_post_id_index`

### 서버
- [ ] `error-codes.ts` — `H2H_001`, `H2H_002` 추가
- [ ] `head-to-head.module.ts` / `service.ts` / `controller.ts` 생성
- [ ] `GetHeadToHeadQueryDto`, `HeadToHeadResponseDto` 작성 (class-validator)
- [ ] `getHeadToHead` 서비스 구현 (HOST/GUEST 정규화 포함)
- [ ] Swagger 데코레이터 작성

### 클라이언트 스캐폴딩
- [ ] `cd client && npm run feature head-to-head`
- [ ] `headToHead.schema.ts` — Zod 스키마 정의
- [ ] `headToHead.service.ts` — API 호출 함수
- [ ] `useHeadToHead.ts` — `useSuspenseInfiniteQuery` hook
- [ ] `H2HSummaryCard`, `H2HHistoryItem`, Skeleton 컴포넌트
- [ ] `HeadToHeadView` — FlatList + ListHeaderComponent + ListEmptyComponent
- [ ] `HeadToHeadContainer` — 데이터 주입, AsyncBoundary
- [ ] 라우트 파일 `app/(app)/club/[clubId]/head-to-head/[opponentClubId].tsx`
- [ ] 레이아웃 `app/(app)/club/[clubId]/_layout.tsx` — `head-to-head/[opponentClubId]` Stack.Screen 등록
