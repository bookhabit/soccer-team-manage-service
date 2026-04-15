# Matching 기능 테스트 리포트

> 테스트 일자: 2026-04-15
> 테스트 범위: 매칭 목록, 매칭 등록/수정, 신청/수락, 연락처

---

## 발견된 문제 목록

| # | 구분 | 우선순위 | 위치 | 내용 | 상태 |
|---|------|----------|------|------|------|
| 1 | 🐛 버그 | P2 | MatchingTabContainer | 탭 전환 시마다 스켈레톤 로딩 노출 | ⏳ 미처리 |
| 2 | 📐 기획 변경 | P1 | MatchCreateView | 날짜·시간 입력 UI가 MatchFormView 방식과 불일치 — 통일 필요 | ⏳ 미처리 |
| 3 | 🐛 버그 | P1 | ApplicationListContainer | 수락 후 전체 매칭 목록의 상태(모집중→매칭완료) 미동기화 | ⏳ 미처리 |
| 4 | 📐 기획 변경 | P1 | MatchCreateView | 장소 입력: 카카오 주소 검색 API 도입 → regionId 입력 필드 제거 | ⏳ 미처리 |
| 5 | ✨ 기능 추가 | P1 | matching | 매칭 취소 기능 필요 (투표 참석자 부족 등) | ⏳ 미처리 |
| 6 | 📐 기획 변경 | P1 | matching → match 연동 | 매칭 수락 시 Match 자동생성 → 투표탭 경기등록 시 완료된 매칭 pre-fill로 변경 | ⏳ 미처리 |

---

## 수정 상세

### #1 — 탭 전환 시 스켈레톤 로딩 반복 노출 (P2 버그)

**문제**
탭(전체 매칭 / 내 게시글 / 내 신청)을 클릭할 때마다 스켈레톤 로딩이 보임.
탭 상단은 고정되어야 하고, 아래 리스트 영역만 바뀌어야 한다.

**원인 추정**
각 탭 컨텐츠가 `AsyncBoundary` (Suspense) 로 독립 마운트되어 탭 전환 시마다 새로 마운트 → 초기 로딩 발생.
TanStack Query 캐시가 있어도 Suspense boundary 재마운트 시 stale 상태가 되면 다시 suspend 됨.

**수정 방향**
- 탭 컨텐츠를 조건부 `display:none` 스타일로 숨기는 방식(마운트 유지) 또는
- `placeholderData: keepPreviousData` 옵션으로 이전 데이터 유지하면서 background refetch

---

### #2 — 매칭 등록 날짜·시간 UI 불일치 (P1 기획 변경)

**문제**
현재 `MatchCreateView`는 날짜·시간을 `TextField`로 직접 문자열 입력 받음 (예: `2026-05-10`, `14:00`).
`MatchFormView`(경기 관리 탭 경기 등록)는 `DateTimePicker`(네이티브 선택기)를 사용해 UX가 훨씬 낫다.
같은 서비스 내에서 같은 정보를 입력받는 UI가 달라서는 안 됨.

**수정 방향**
- `MatchCreateView`의 날짜/시간 입력을 `MatchFormView`의 DateTimePicker 방식으로 교체
- `MatchFormView`의 날짜 선택 로직(`openPicker` + `IOSPickerModal` + Android `DateTimePickerAndroid`)을 공통 컴포넌트(`DateTimeField` 등)로 추출
- `MatchCreateView`와 `MatchFormView` 양쪽에서 공통 컴포넌트 사용

**영향 범위**
- `client/src/features/matching/ui/view/MatchCreateView.tsx`
- `client/src/features/match/ui/view/MatchFormView.tsx`
- (신규) 공통 컴포넌트 `client/src/shared/ui/` 또는 각 feature 내 `components/`

---

### #3 — 수락 후 전체 매칭 목록 미동기화 (P1 버그)

**문제**
신청 수락 후 게시글 상태가 `OPEN → MATCHED`로 바뀌어야 하는데, 전체 매칭 탭 목록에서 여전히 "모집중" 뱃지로 표시됨.

**원인 추정**
`useAcceptApplication` 뮤테이션 성공 후 `invalidateQueries`에서 `matchPosts` (전체 목록) 쿼리가 누락된 것으로 보임.

**수정 방향**
`ApplicationListContainer`의 수락 뮤테이션 성공 콜백에서 아래 쿼리 전부 invalidate:
```ts
queryClient.invalidateQueries({ queryKey: ['matchPost', postId] });      // 상세
queryClient.invalidateQueries({ queryKey: ['matchPosts'] });              // 전체 목록 ← 누락
queryClient.invalidateQueries({ queryKey: ['myMatchPosts'] });            // 내 게시글
queryClient.invalidateQueries({ queryKey: ['matchApplications', postId] }); // 신청 목록
```

---

### #4 — 장소 입력: 카카오 주소 검색 API 도입 (P1 기획 변경)

**문제 / 배경**
현재 `MatchCreateView`는 구장 이름(텍스트) + 상세 주소(텍스트) + `RegionPicker`(지역 드롭다운) 3개 필드로 위치를 입력받음.
카카오 주소 검색 API를 도입하면:
- 검색 결과에서 주소 선택 → 위도/경도 및 행정구역 자동 추출
- `regionId`를 별도로 입력받을 필요 없음 (주소에서 파싱 가능)

**수정 방향 (P3 외부 의존 — API 키 필요)**
- `RegionPicker` 필드 제거
- 구장 이름 필드: 자유 텍스트 유지 (카카오 검색으로 찾기 어려운 비공식 구장 대비)
- 주소 필드: 카카오 주소 검색 버튼 → 바텀시트/웹뷰로 검색 → 선택 시 `address`, `regionId` 자동 채움
- 서버 DTO에서 `regionId` 필수 → 선택(optional) 또는 주소 파싱 로직 추가 필요

**현재 상태**: 카카오 API 키 미설정. 키 설정 전까지 기존 RegionPicker 유지.

---

### #5 — 매칭 취소 기능 필요 (P1 기능 추가)

**배경**
매칭이 수락(MATCHED)된 이후, 투표를 올렸을 때 참석자가 너무 적어 경기를 못 치르게 되는 경우 매칭을 취소해야 한다.

**기능 설계 (초안)**
- 대상: 등록팀 주장/부주장만 취소 가능
- 가능 상태: `MATCHED`인 게시글 (OPEN은 그냥 삭제)
- 취소 시 동작:
  - 게시글 상태: `MATCHED → CANCELLED` (신규 상태값 추가 필요)
  - 수락됐던 신청 상태: `ACCEPTED → CANCELLED`
  - 상대팀(신청팀)에 취소 알림 (알림 기능 있을 경우)
- UI: 게시글 상세 하단 "매칭 취소" 버튼 (destructive 스타일, ConfirmDialog 경유)

**영향 범위**
- `server/prisma/schema.prisma` — `MatchPostStatus`에 `CANCELLED` 추가
- `server/src/features/match-posts/` — 취소 엔드포인트 및 서비스 로직
- `client/src/features/matching/` — 취소 버튼 및 뮤테이션

---

### #6 — 매칭 수락 시 Match 자동생성 기획 변경 (P1 기획 변경)

**기존 기획**
> 매칭 수락 시 양 팀 각자의 내부 `Match`(경기 관리 탭) 항목 자동 생성
> - 생성 데이터: 날짜/시간, 구장, 상대팀 이름 + 레벨 / 유형: `SELF`

**문제**
- Match 자동생성은 투표·라인업 등 경기 관리 탭의 흐름과 맞지 않음
- 매칭 수락이 바로 경기 확정을 의미하지 않음 (투표 후 참석자 부족으로 취소 가능)
- 사용자가 원하지 않는 시점에 Match가 생성되어 혼란 야기

**변경 기획**
매칭 수락 시 Match 자동생성 **안 함**.
대신 경기(Match) 등록 시 "매칭 완료 목록 불러오기" 편의 기능 제공:

```
투표 탭 → 경기 등록 →
  [매칭된 경기에서 불러오기] 버튼 →
  완료된 매칭 목록 표시 →
  1개 선택 →
  날짜/시간/구장/상대팀 필드 자동 채움
```

**영향 범위**
- 서버: 매칭 수락 핸들러에서 Match 자동생성 로직 제거 (또는 미구현이면 skip)
- 서버: `GET /match-posts?status=MATCHED&myClub=true` 또는 별도 엔드포인트로 내 클럽의 완료 매칭 목록 제공
- 클라이언트 (`match` feature): 경기 등록 폼에 "매칭에서 불러오기" 버튼 + 선택 모달

---

## 기획 변경 요약

| 항목 | 기존 | 변경 |
|------|------|------|
| 날짜·시간 입력 | TextField 직접 입력 | DateTimePicker (MatchFormView 방식과 통일) |
| 장소 입력 | 구장명 + 주소 텍스트 + RegionPicker | 카카오 주소 검색 → regionId 자동 (API 키 필요) |
| 매칭 수락 후 동작 | Match 자동 생성 | 자동생성 없음. 경기 등록 시 매칭 정보 pre-fill 편의 제공 |
| 매칭 상태값 | OPEN / MATCHED | OPEN / MATCHED / **CANCELLED** 추가 필요 |

---

## 미처리 항목 (TODO / 외부 의존)

| # | 구분 | 내용 | 이유 |
|---|------|------|------|
| 1 | ⏳ P3 | 카카오 주소 검색 API 연동 | 외부 API 키 필요 |
| 2 | ⏳ P2 | 매칭 취소 알림 발송 | 알림(Push) 인프라 미구성 |
