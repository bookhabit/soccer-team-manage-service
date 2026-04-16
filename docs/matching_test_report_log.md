# Matching 테스트 작업 로그

> 테스트 리포트: `docs/matching_test_report.md`
> 작업 일자: 2026-04-15
> 테스트 범위: 매칭 목록 탭·필터, 게시글 등록 UI, 수락 후 동기화, Match 자동생성 정책

---

## 테스트 개요

매칭 기능 전반을 앱 실행 및 seed 데이터로 수동 테스트.
탭 전환 UX, 수락 후 목록 동기화, 날짜·시간 입력 일관성, Match 자동생성 정책 변경 이슈가 발견됨.

---

## 발견된 문제 목록

| #   | 구분         | 우선순위 | 위치                     | 내용                                                      | 상태      |
| --- | ------------ | -------- | ------------------------ | --------------------------------------------------------- | --------- |
| 1   | 🐛 버그      | P2       | `MatchingTabView`        | 탭 전환 시마다 스켈레톤 로딩 반복 노출                    | ✅ 완료   |
| 2   | 📐 기획 변경 | P1       | `MatchCreateView`        | 날짜·시간 UI가 MatchFormView 방식과 불일치                | ✅ 완료   |
| 3   | 🐛 버그      | P1       | `useAcceptApplication`   | 수락 후 전체 매칭 목록에 "모집중" 상태 유지               | ✅ 완료   |
| 4   | 📐 기획 변경 | P3       | `MatchCreateView`        | 장소 입력: 카카오 주소 검색 API 도입 예정                 | ⏳ 보류   |
| 5   | ✨ 기능 추가 | P1       | matching                 | 매칭 취소 기능 (MATCHED → CANCELLED)                      | ⏳ 미구현 |
| 6   | 📐 기획 변경 | P1       | `match-posts.service.ts` | 수락 시 Match 자동생성 → 경기 등록 pre-fill 방식으로 변경 | ✅ 완료   |

---

## 수정 상세

### #1 — 탭 전환 스켈레톤 반복 (P2 버그)

**문제**: `MatchingTabView`에서 `{selectedTab === 'all' && listContent}` 패턴으로 탭 전환 시 컴포넌트가 언마운트/리마운트 → `useSuspenseInfiniteQuery`가 매번 Suspense trigger.

**수정 파일**: `client/src/features/matching/ui/view/MatchingTabView.tsx`

**수정 내용**:

- 탭 콘텐츠를 항상 렌더링하되 비활성 탭에 `display: 'none'` 스타일 적용
- 3개 탭 컨텐츠가 모두 마운트 유지 → 탭 전환 시 Suspense 재실행 없음
- `styles.hidden = { display: 'none' }` 추가

---

### #2 — 날짜·시간 입력 UI 불일치 (P1 기획 변경)

**문제**: `MatchCreateView`의 날짜(`matchDate`)·시작/종료 시간(`startTime`/`endTime`) 입력이 `TextField` 문자열 직접 입력 방식. `MatchFormView`(경기 등록)는 네이티브 `DateTimePicker` 방식으로 UX 불일치.

**수정 파일**: `client/src/features/matching/ui/view/MatchCreateView.tsx`

**수정 내용**:

- `matchDate` Controller → `DateInputField` 컴포넌트 (네이티브 날짜 선택기)
  - iOS: `Modal` + `DateTimePicker mode="date"` spinner
  - Android: `DateTimePickerAndroid.open mode: 'date'`
  - 출력 형식: `'YYYY-MM-DD'` (기존 스키마 유지)
- `startTime`/`endTime` Controller → `TimeInputField` 컴포넌트 (네이티브 시간 선택기)
  - iOS: `Modal` + `DateTimePicker mode="time" is24Hour`
  - Android: `DateTimePickerAndroid.open mode: 'time' is24Hour`
  - 출력 형식: `'HH:mm'` (기존 스키마 유지)
- 두 컴포넌트 모두 `MatchFormView`의 `DatePickerField` UI와 동일한 패턴

---

### #3 — 수락 후 목록 미동기화 (P1 버그)

**문제**: 수락 성공 후 `invalidateQueries`는 정상 작동하나, `useSuspenseInfiniteQuery`의 stale-while-revalidate 동작으로 배경 리페치 완료 전까지 "모집중" 상태가 표시됨.

**수정 파일**: `client/src/features/matching/data/hooks/useMatchApplications.ts`

**수정 내용**:

- `useAcceptApplication` `onSuccess` 에서 `setQueriesData`로 목록 캐시 즉시 업데이트
  - 모든 `['match-posts', 'list', ...]` 캐시에서 해당 `postId`의 `status`를 `'MATCHED'`로 변경
  - 이후 `invalidateQueries`로 배경 리페치하여 서버 상태 최종 확인
- `myApplications` 쿼리 invalidation 추가 (수락 후 내 신청 탭 상태도 동기화)

---

### #6 — 수락 시 Match 자동생성 제거 (P1 기획 변경)

**문제**: `accept()` 서비스에서 두 팀의 `Match` 레코드를 자동 생성하는 로직이 있었으나, 투표 참석자 부족으로 경기가 취소될 수 있어 수락 시점이 경기 확정 시점이 아님. 경기 등록 폼에서 "완료된 매칭 목록" pre-fill 편의 기능으로 대체.

**수정 파일**: `server/src/features/match-posts/match-posts.service.ts`

**수정 내용**:

- `accept()` 트랜잭션 내 `tx.match.create()` 2건 제거
- 불필요해진 `combineDateTime` 함수 제거
- 불필요해진 `MatchType` import 제거
- `post` select에서 match 생성에만 사용되던 필드 제거: `matchDate`, `startTime`, `endTime`, `location`, `address`, `level`, `club.name`
- `app` select에서 `applicantClub.level` 제거 (match 생성용)

---

## 미처리 항목 (TODO)

| #   | 구분  | 내용                      | 이유                                                 |
| --- | ----- | ------------------------- | ---------------------------------------------------- |
| 1   | ⏳ P3 | 카카오 주소 검색 API 연동 | 외부 API 키 필요. 키 설정 후 RegionPicker 교체 예정. |
| 2   | ⏳ P2 | 매칭 취소 알림 발송       | 알림(Push) 인프라 미구성. 현재 console.log 처리.     |

---

## 추가 구현 (2026-04-15, 이어서 진행)

| #   | 구분         | 위치 | 내용                       | 상태                                      |
| --- | ------------ | ---- | -------------------------- | ----------------------------------------- | ------- |
| 7   | ✨ 기능 추가 | P1   | matching + prisma          | 매칭 취소 기능 (MATCHED → CANCELLED)      | ✅ 완료 |
| 8   | ✨ 기능 추가 | P1   | match/CreateMatchContainer | 경기 등록 폼 "매칭에서 불러오기" pre-fill | ✅ 완료 |

### #7 — 매칭 취소 기능 (P1 기능 추가)

**구현 내용**:

- `server/prisma/schema.prisma` — `MatchPostStatus`에 `CANCELLED` 추가
- `server/src/common/constants/error-codes.ts` — `MATCH_POST_010` 추가 (취소 불가 상태)
- `server/src/features/match-posts/match-posts.service.ts` — `cancel()` 메서드 추가 (MATCHED인 경우만, 등록팀 관리자만)
- `server/src/features/match-posts/match-posts.controller.ts` — `PATCH :id/cancel` 엔드포인트 추가
- `apply()` + `update()` + `accept()` — `status !== OPEN` 체크로 통합 (CANCELLED 게시글 신청/수정/수락 불가)
- `client matchPost.schema.ts` — `MatchPostStatusSchema`에 `'CANCELLED'` 추가
- `client matchPost.service.ts` — `cancelMatchPost(id)` 추가
- `client useMatchPosts.ts` — `useCancelMatchPost()` 훅 추가
- `client MatchStatusBadge.tsx` — `CANCELLED` → "취소됨" 뱃지 (회색) 추가
- `client MatchPostDetailView.tsx` — `isOwnPost && status === 'MATCHED'`일 때 "매칭 취소" 버튼 노출
- `client MatchDetailContainer.tsx` — 취소 핸들러 + ConfirmDialog 추가

**마이그레이션 필요**:

```
cd server && npx prisma migrate dev --name add-cancelled-match-post-status
```

### #8 — 경기 등록 폼 매칭 pre-fill (P1 기능 추가)

**구현 내용**:

- `server/match-posts.service.ts` — `getMyPosts()`에 ACCEPTED 신청의 상대팀 정보 추가 (`opponentClubName`, `opponentClubLevel`)
- `client matchPost.schema.ts` — `MatchPostSummarySchema`에 `opponentClubName?`, `opponentClubLevel?` 옵셔널 필드 추가
- `client matchPost.service.ts` — `getMyMatchPosts()`에 `MyMatchPostListSchema` Zod 파싱 추가
- `client match/MatchFormView.tsx` — `headerAction?: React.ReactNode` prop 추가
- `client match/CreateMatchContainer.tsx` — "매칭에서 불러오기" Drawer + MATCHED posts 선택 → defaultValues pre-fill + `key` 기반 폼 리마운트

---

## 기획 변경 사항

| 항목           | 기존                        | 변경                                                                    |
| -------------- | --------------------------- | ----------------------------------------------------------------------- |
| 수락 후 동작   | Match 2건 자동 생성 (양 팀) | 자동생성 없음. 경기 등록 시 매칭 정보 pre-fill 편의 제공 (✅ 구현 완료) |
| 날짜·시간 입력 | TextField 문자열 직접 입력  | 네이티브 DateTimePicker (MatchFormView와 동일 패턴)                     |
| 탭 전환        | 조건부 렌더링 (언마운트)    | display:none으로 마운트 유지                                            |
| 매칭 상태값    | OPEN / MATCHED              | OPEN / MATCHED / CANCELLED (✅ 구현 완료)                               |

---

## 플랜 문서 업데이트

- `docs/plans/matching/matching.brief.md` — 수락 후 Match 자동생성 → pre-fill 방식으로 변경 기술. 매칭 취소 기능 TODO 추가.
- `docs/plans/matching/matching.plan.md` — `accept` 체크리스트 항목 업데이트 (Match 자동생성 제거 반영)
