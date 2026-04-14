# club_match 테스트 작업 로그

> 테스트 리포트: `docs/test/club_match_test_report.md`  
> 작업 일자: 2026-04-14  
> 테스트 범위: Club 생성·가입·운영 기능 및 Match 포지션 배정·경기 기록 기능 전반 수동 테스트

---

## 테스트 개요

**테스트한 기능**

- Club: 클럽 생성, 팀원 목록, 초대 코드 발급/조회/가입, 가입 신청 승인, 팀원 강퇴, 게시판(조회·작성·수정·삭제·댓글)
- Match: 포지션 배정(쿼터별), 경기 기록 입력, 경기 기록 조회, 다가오는 경기 목록

**테스트 환경**: 로컬 개발 서버 (NestJS + PostgreSQL), iOS 시뮬레이터

---

## 발견된 문제 목록

| # | 구분 | 우선순위 | 위치 | 내용 | 상태 |
|---|------|----------|------|------|------|
| 1 | 🐛 버그 | P0 | `server/features/club/club.service.ts:52` | `recalcMannerScoreAvg` — `aggregate()`에 `user.mannerScore` 중첩 전달로 PrismaClientValidationError | ✅ 완료 |
| 2 | ✨ 기능 추가 | P1 | `server/features/club` | `GET /clubs/:clubId/members/:userId` 팀원 상세 조회 API 미구현 → 404 | ✅ 완료 |
| 3 | 📐 기획 변경 | P1 | `server/prisma/schema.prisma` | Club name 중복 불가로 정책 변경 (`@unique` 추가 + 에러 처리) | ✅ 완료 |
| 4 | 🐛 버그 | P1 | `client/features/match/data/schemas/match.schema.ts:8` | `PlayerPositionSchema`가 `FW\|MF\|DF\|GK`만 허용 → 서버 `FormationSlot` 값과 불일치, ZodError | ✅ 완료 |
| 5 | 🐛 버그 | P1 | `client/features/club/ui/container/PostDetailContainer.tsx` | 내 게시글 수정·삭제 버튼 미노출 — 현재 userId와 authorId 비교 로직 누락 | ✅ 완료 |
| 6 | 🐛 버그 | P2 | `client/features/club` 네비게이션 | 클럽 생성 성공 후 초대 코드 화면 미전환 | ✅ 완료 |
| 7 | 🐛 버그 | P2 | `server/prisma/data/regions.json` | 지역 중복 데이터 (268→229개 정리) | ✅ 완료 |
| 8 | 🐛 버그 | P2 | `client/features/club/ui` 게시판 | 일반 글 작성 후 일반 탭 미갱신 — invalidateQueries prefix 수정 | ✅ 완료 |
| 9 | ✨ 기능 추가 | P2 | `client/features/club/ui` 게시판 | FlatList `refreshControl` 없음 | ✅ 완료 |
| 10 | ✨ 기능 추가 | P2 | `client/features/club/ui` 팀원 목록 | '나' 배지 표시 및 내 역할 확인 UI 없음 | ✅ 완료 |
| 11 | 🐛 버그 | P2 | `client/features/match/ui` | 종료된 경기에서 포지션 배정 UI 진입 가능 | ✅ 완료 |
| 12 | ✨ 기능 추가 | P2 | `client/features/match/ui` | 포지션 배정 화면 — 쿼터별 조회(읽기 전용) 모드 없음 | ⏳ 보류 |
| 13 | 🐛 버그 | P2 | `client/features/match/ui` | 포지션 배정 화면 — 기본 쿼터 수 1→2로 수정 | ✅ 완료 |
| 14 | 📐 기획 변경 | P2 | `client/features/match` | 경기 기록 입력 — 어시스트·쿼터 선택 필수로 변경 | ✅ 완료 |
| 15 | 🐛 버그 | P2 | `client` 공통 | BottomCTA + Input 조합 시 KeyboardAvoidingView 기기별 높이 불일치 | ⏳ 보류 |
| 16 | ⏳ TODO | P3 | `server/features/club/club.service.ts:72` | 초대 코드 보안 검토 (유효기간·재사용 방지·무차별 대입) | ⏳ 보류 |
| 17 | ⏳ TODO | P3 | `server/features/club` 팀원 stats | `goals/assists/momCount/matchCount` 하드코딩 → 경기 도메인 연동 후 집계 | ⏳ 보류 |
| 18 | ⏳ TODO | P3 | `server/features/post` | 게시글 조회수 Redis INCR 전환 | ⏳ 보류 |
| 19 | ⏳ TODO | P3 | `client/features/club`, `client/features/profile` | 팀 로고·프로필 이미지 파일 업로드 구현 | ⏳ 보류 |
| 20 | ⏳ TODO | P3 | `client` 전반 | 카카오 주소 검색 API + 카카오맵 연동 | ⏳ 보류 |

---

## 수정 상세

### #1 — recalcMannerScoreAvg aggregate 오류 (P0 버그) ✅

**문제**: `clubMember.aggregate()`에 `user.mannerScore` 중첩 전달 → `PrismaClientValidationError`
(`ClubMemberAvgAggregateOutputType`에는 `user` 필드 없음)

**수정 파일**: `server/src/features/club/club.service.ts`

**수정 내용**: 잘못된 `aggregate()` 블록(4줄) 제거. 이미 존재하던 `$queryRaw` JOIN 로직으로 단일화.

```ts
// Before (오류 발생)
const result = await this.prisma.clubMember.aggregate({
  where: { clubId },
  _avg: { user: { mannerScore: true } } as any,   // ← 존재하지 않는 필드
});

// After (제거 후 $queryRaw만 사용)
const agg = await this.prisma.$queryRaw<{ avg: number | null }[]>`
  SELECT AVG(u."mannerScore") as avg ...
`;
```

---

### #2 — 팀원 상세 조회 API 구현 (P1 기능 추가) ✅

**수정 파일**:
- `server/src/features/club/club.service.ts` — `getMemberDetail()` 메서드 추가
- `server/src/features/club/club.controller.ts` — `GET :clubId/members/:targetUserId` 라우트 추가
- `server/src/features/club/dto/club-response.dto.ts` — `ClubMemberDetailResponseDto`, `MemberDetailStatsDto` 추가

**반환 필드**: `userId, name, avatarUrl, jerseyNumber, role, position, mannerScore, foot, level, phone(null), isPhonePublic, stats(속성치+성과통계), joinedAt`

**참고**: `User` 모델에 `phone` 필드 미구현 → 현재 `null` 반환

---

### #3 — Club name @unique 추가 (P1 기획 변경) ✅

**수정 파일**:
- `server/prisma/schema.prisma` — `name String @unique`
- `server/src/common/constants/error-codes.ts` — `CLUB_NAME_DUPLICATED` 추가
- `server/src/features/club/club.service.ts` — `createClub()` 내 중복 체크 추가

**마이그레이션 필요**:
```bash
cd server && npx prisma migrate dev --name add-club-name-unique
```

---

### #4 — Match FormationSlotSchema 추가 (P1 버그) ✅

**증상**: 포메이션 변경 후 ZodError — `Invalid option: expected one of "FW"|"MF"|"DF"|"GK"`

**원인**: 서버는 `FormationSlot`(LB, RCB, ST 등 25개 슬롯) 반환, 클라이언트는 4가지만 허용

**수정 파일**: `client/src/features/match/data/schemas/match.schema.ts`

**수정 내용**:
- `FormationSlotSchema` 신규 추가 (25개 FormationSlot 전체)
- `AssignmentSchema.position` → `FormationSlotSchema` 사용
- `AssignmentInputSchema.position` → `FormationSlotSchema` 사용
- `FormationSlot` 타입 export 추가

**수정 파일**: `client/src/features/match/ui/components/FormationField.tsx`
- `Assignment` 타입 → `FormationSlot` 사용
- `POSITION_ROW` 모든 슬롯 → row 매핑 추가 (GK=0, 수비=1, 미드=2, 공격=3)

---

### #5 — 게시글 수정·삭제 권한 수정 (P1 버그) ✅

**수정 파일**:
- `client/src/features/club/ui/container/PostDetailContainer.tsx`
- `client/src/features/club/ui/view/PostDetailView.tsx`
- `client/src/features/club/ui/container/PostWriteContainer.tsx`
- `client/src/features/club/data/hooks/usePost.ts`

**수정 내용**:

1. `PostDetailContainer`
   - `useMyProfile()` import 추가
   - `canDeletePost = isCaptainOrVice || isAuthor` (기존: 주장/부주장만)
   - `canEditPost = isAuthor` 추가
   - `handleEditPost` — `router.push("/club/:clubId/board/write?postId=:postId")`

2. `PostDetailView`
   - `canEditPost`, `onEditPost` props 추가
   - 수정 버튼 추가 (작성자 전용) + 삭제 버튼 (작성자 or 주장/부주장)

3. `PostWriteContainer`
   - edit 모드 진입 시 `usePostDetailQuery()`로 기존 게시글 fetch
   - `useEffect`에서 fetch 완료 후 `reset()` 호출 → 폼 초기화

4. `usePost.ts`
   - `usePostDetailQuery()` 추가 — non-suspense 버전 (`useQuery`, `enabled` 옵션 지원)

---

## P2 수정 상세 (2026-04-14 세션 2)

### #6 — 클럽 생성 후 초대 코드 화면 미전환 (P2 버그) ✅

**수정 파일**: `client/src/features/club/ui/container/ClubCreateContainer.tsx`

**수정 내용**: `onSuccess` 콜백에서 `router.replace('/(app)/club')` → `router.replace('/(app)/club/${newClub.id}/invite')`로 변경.
기획 변경(2026-04-14): 클럽 생성 직후 초대 코드 화면 노출.

---

### #7 — 지역 중복 데이터 정리 (P2 버그) ✅

**수정 파일**: `server/prisma/data/regions.json`

**수정 내용**: `(name, sigungu)` 조합 기준으로 중복 제거. 268개 → 229개. 중복 원인은 행정 코드가 다른 동일 시군구가 여러 번 등록된 것.

---

### #8 — 게시판 invalidateQueries 동기화 (P2 버그) ✅

**수정 파일**: `client/src/features/club/data/hooks/usePost.ts`

**문제**: `useCreatePost` / `useDeletePost`가 `clubQueryKeys.posts(clubId)` (= `['club', id, 'posts', 'ALL']`)만 무효화 → 탭별 쿼리(`GENERAL`, `NOTICE`, `INQUIRY`)가 갱신 안 됨.

**수정 내용**: prefix key `['club', clubId, 'posts']`로 변경 → 모든 탭 쿼리 일괄 무효화.

---

### #9 — FlatList refreshControl 추가 (P2 기능 추가) ✅

**수정 파일**:
- `client/src/features/club/ui/view/BoardView.tsx` — `RefreshControl` import, `isRefreshing`/`onRefresh` props 추가, FlatList에 `refreshControl` 바인딩
- `client/src/features/club/ui/container/BoardContainer.tsx` — `isRefreshing` state, `handleRefresh` 핸들러 추가

---

### #10 — 팀원 목록 '나' 배지 (P2 기능 추가) ✅

**수정 파일**:
- `client/src/features/club/ui/components/MemberCard.tsx` — `isMe` prop 추가, '나' 배지 렌더링 (`colors.blue50` 배경)
- `client/src/features/club/ui/view/MemberListView.tsx` — `myUserId` prop 추가, `MemberCard`에 전달
- `client/src/features/club/ui/container/MemberListContainer.tsx` — `useMyProfile()` import, `myProfile?.id` 전달

---

### #11 — 종료된 경기 포지션 배정 막기 (P2 버그) ✅

**수정 파일**: `client/src/features/match/ui/view/MatchProgressView.tsx`

**수정 내용**: `{isCaptainOrVice ? ...}` → `{isCaptainOrVice && status !== 'AFTER' ? ...}`

---

### #13 — 포지션 배정 기본 쿼터 수 (P2 버그) ✅

**수정 파일**: `client/src/features/match/ui/container/LineupContainer.tsx`

**수정 내용**: 기존 lineup이 없을 때 1쿼터만 기본값으로 초기화되던 것을 1·2쿼터 2개로 변경. 서버에 `quarterCount` 필드 없음 — 일반적인 전/후반 2쿼터를 기본값으로 사용.

---

### #14 — GoalInputSchema 어시스트·쿼터 필수 (P2 기획 변경) ✅

**수정 파일**: `client/src/features/match/data/schemas/match.schema.ts`

**수정 내용**: `GoalInputSchema.assistUserId` `.optional()` 제거 → 필수. `GoalInputSchema.quarterNumber` `.optional()` 제거 → 필수.

---

## P2 처리 결과 (2026-04-14 세션 2)

| # | 구분 | 내용 | 상태 | 수정 파일 |
|---|------|------|------|-----------|
| 6 | P2 | 클럽 생성 후 초대 코드 화면 미전환 | ✅ 완료 | `ClubCreateContainer.tsx` |
| 7 | P2 | 지역 중복 데이터 정리 | ✅ 완료 | `server/prisma/data/regions.json` (268→229개) |
| 8 | P2 | 게시판 invalidateQueries 동기화 | ✅ 완료 | `usePost.ts` (prefix key로 변경) |
| 9 | P2 | FlatList refreshControl | ✅ 완료 | `BoardView.tsx`, `BoardContainer.tsx` |
| 10 | P2 | 팀원 목록 '나' 배지 | ✅ 완료 | `MemberCard.tsx`, `MemberListView.tsx`, `MemberListContainer.tsx` |
| 11 | P2 | 종료 경기 포지션 배정 막기 | ✅ 완료 | `MatchProgressView.tsx` |
| 12 | P2 | 쿼터별 조회 전용 모드 | ⏳ 보류 | 별도 UI 플로우 기획 필요 |
| 13 | P2 | 포지션 배정 기본 쿼터 수 1→2 | ✅ 완료 | `LineupContainer.tsx` |
| 14 | P2 | 경기 기록 어시스트·쿼터 필수 | ✅ 완료 | `match.schema.ts` (GoalInputSchema) |
| 15 | P2 | KeyboardAvoidingView 통일 | ⏳ 보류 | 기기별 측정 후 별도 처리 |

---

## 미처리 항목 (P3 — 보류)

| # | 구분 | 내용 | 이유 |
|---|------|------|------|
| 16 | P3 | 초대 코드 보안 검토 | `/security` 에이전트로 별도 처리 예정 |
| 17 | P3 | 팀원 stats 집계 | 경기 도메인 연동 완료 후 처리 |
| 18 | P3 | 조회수 Redis INCR | Redis 인프라 미구성 |
| 19 | P3 | 파일 업로드 | 별도 기획 후 `/feature` 플로우로 처리 |
| 20 | P3 | 카카오 API 연동 | 개발자 센터 JS 키 필요 |

---

## 기획 변경 사항

| 항목 | 기존 정책 | 변경 정책 | 결정 일자 |
|------|-----------|-----------|-----------|
| Club name | 중복 허용 | 중복 불가 (`@unique`, `CLUB_NAME_DUPLICATED` 에러) | 2026-04-14 |
| 경기 기록 — 어시스트 | 선택 사항 | 필수 | 2026-04-14 |
| 경기 기록 — 쿼터 선택 | 선택 사항 | 필수 | 2026-04-14 |
| 클럽 생성 후 초대 코드 | 플로우 미정 | 생성 직후 초대 코드 화면 노출 | 2026-04-14 |

---

## 플랜 문서 업데이트

### club.plan.md

| 항목 | 변경 내용 |
|------|-----------|
| Club 스키마 `name` | `@unique` 추가 반영 |
| 에러 코드 표 | `CLUB_NAME_DUPLICATED` 추가 |
| 서버 체크리스트 | 완료 항목 `[x]` 표시 + 버그 수정·기획 변경 메모 추가 |
| `getMemberDetail` | 신규 구현 완료로 체크리스트 추가 |

### match.plan.md

| 항목 | 변경 내용 |
|------|-----------|
| `AssignmentSchema` | `position` 타입을 `FormationSlotSchema`로 수정, `userName` 필드 없음 명시 |
| `GoalInputSchema` | `assistUserId`, `quarterNumber` 필수로 변경 (기획 변경 2026-04-14) |
