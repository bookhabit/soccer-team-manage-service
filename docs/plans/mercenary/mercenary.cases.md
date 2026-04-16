# Mercenary Test Cases

## Unit Test Cases (data/schemas, utils)

| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
| MERC-02-001 | 유효한 MercenaryPost 응답 JSON | MercenaryPostSummarySchema.parse() 호출 | 파싱 성공, 타입 안전한 객체 반환 | P1 |
| MERC-02-002 | `matchDate`가 빈 문자열인 응답 | MercenaryPostSummarySchema.parse() 호출 | ZodError 발생 | P1 |
| MERC-02-003 | `positions`가 유효하지 않은 값 포함 (`["FW","XX"]`) | MercenaryPostSummarySchema.parse() 호출 | ZodError 발생 | P1 |
| MERC-02-004 | `status`가 `"OPEN"` | MercenaryPostStatusSchema.parse() 호출 | `"OPEN"` 반환 | P2 |
| MERC-02-005 | `status`가 `"INVALID"` | MercenaryPostStatusSchema.parse() 호출 | ZodError 발생 | P2 |
| MERC-02-006 | 유효한 CreateMercenaryPostSchema 입력 | safeParse() 호출 | `success: true` | P1 |
| MERC-02-007 | `fee`가 음수(-1) | CreateMercenaryPostSchema.safeParse() 호출 | `success: false` | P1 |
| MERC-02-008 | `requiredCount`가 0 | CreateMercenaryPostSchema.safeParse() 호출 | `success: false` | P1 |
| MERC-02-009 | `positions`가 빈 배열 | CreateMercenaryPostSchema.safeParse() 호출 | `success: false` | P1 |
| MERC-02-010 | `contactPhone`이 빈 문자열 | CreateMercenaryPostSchema.safeParse() 호출 | `success: false` | P1 |
| MERC-02-011 | 유효한 MercenaryAvailabilityDetail 응답 | MercenaryAvailabilityDetailSchema.parse() 호출 | 파싱 성공 | P1 |
| MERC-02-012 | `availableDates`가 빈 배열 | MercenaryAvailabilityDetailSchema.parse() 호출 | 파싱 성공 (`isExpired: true` 기대) | P2 |
| MERC-02-013 | 유효한 CreateMercenaryAvailabilitySchema 입력 | safeParse() 호출 | `success: true` | P1 |
| MERC-02-014 | `availableDates`가 빈 배열 | CreateMercenaryAvailabilitySchema.safeParse() 호출 | `success: false` | P1 |
| MERC-02-015 | `regionIds`가 빈 배열 | CreateMercenaryAvailabilitySchema.safeParse() 호출 | `success: false` | P1 |
| MERC-02-016 | `message`가 100자 초과 (101자) | CreateMercenaryApplicationSchema.safeParse() 호출 | `success: false` | P2 |
| MERC-02-017 | `message`가 null | CreateMercenaryApplicationSchema.safeParse() 호출 | `success: true` (선택 필드) | P2 |

---

## Integration Test Cases (hooks + MSW)

### 용병 구함 (MercenaryPost)

| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
| MERC-03-001 | MSW: GET /mercenary-posts → 200 + items 10개 | `useMercenaryPosts({})` 마운트 | `data.pages[0].items` 10개, `nextCursor` 있으면 hasNextPage true | P0 |
| MERC-03-002 | MSW: GET /mercenary-posts → 200 + items 0개 | `useMercenaryPosts({})` 마운트 | `data.pages[0].items` 빈 배열 | P1 |
| MERC-03-003 | MSW: GET /mercenary-posts → 500 | `useMercenaryPosts({})` 마운트 | `isError: true` | P1 |
| MERC-03-004 | MSW: GET /mercenary-posts?positions=FW | `useMercenaryPosts({ positions: ['FW'] })` 호출 | 요청 URL에 `positions=FW` 포함 | P1 |
| MERC-03-005 | MSW: GET /mercenary-posts/:id → 200 | `useMercenaryPostDetail(id)` 마운트 | `data.id` 일치 | P0 |
| MERC-03-006 | MSW: GET /mercenary-posts/:id → 404 | `useMercenaryPostDetail(id)` 마운트 | Suspense 에러 바운더리 트리거 | P1 |
| MERC-03-007 | MSW: POST /mercenary-posts → 201 | `useCreateMercenaryPost().mutate(data)` 호출 | `onSuccess` 콜백 실행, `['mercenary-posts','list']` 쿼리 invalidate | P0 |
| MERC-03-008 | MSW: POST /mercenary-posts → 403 (MERCENARY_BLACKLIST) | `useCreateMercenaryPost().mutate(data)` 호출 | `onError` 콜백 실행, error.response.data.code === 'MERCENARY_BLACKLIST' | P0 |
| MERC-03-009 | MSW: PATCH /mercenary-posts/:id → 200 | `useUpdateMercenaryPost(id).mutate(data)` 호출 | postDetail, myPosts 쿼리 invalidate | P1 |
| MERC-03-010 | MSW: DELETE /mercenary-posts/:id → 200 | `useDeleteMercenaryPost().mutate(id)` 호출 | myPosts, postLists 쿼리 invalidate | P1 |
| MERC-03-011 | MSW: POST /mercenary-posts/:id/applications → 201 | `useApplyMercenaryPost(postId).mutate({ message })` 호출 | `onSuccess`, postDetail invalidate | P0 |
| MERC-03-012 | MSW: POST /mercenary-posts/:id/applications → 409 (중복 지원) | `useApplyMercenaryPost(postId).mutate()` 호출 | `onError` 콜백 실행 | P1 |
| MERC-03-013 | MSW: GET /mercenary-posts/:id/applications → 200 | `useMercenaryApplications(postId)` 마운트 | 지원자 목록 반환 | P1 |
| MERC-03-014 | MSW: PATCH .../accept → 200 + contact 반환 | `useAcceptMercenaryApplication().mutate({ postId, appId })` 호출 | applications, postDetail 쿼리 invalidate, contact 데이터 반환 | P0 |
| MERC-03-015 | MSW: PATCH .../reject → 200 | `useRejectMercenaryApplication().mutate({ postId, appId })` 호출 | applications 쿼리 invalidate | P1 |

### 용병 가능 (MercenaryAvailability)

| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
| MERC-03-016 | MSW: GET /mercenary-availabilities → 200 + items 10개 | `useMercenaryAvailabilities({})` 마운트 | items 10개, 무한 스크롤 동작 | P0 |
| MERC-03-017 | MSW: GET /mercenary-availabilities → 500 | `useMercenaryAvailabilities({})` 마운트 | `isError: true` | P1 |
| MERC-03-018 | MSW: GET /mercenary-availabilities/:id → 200 | `useMercenaryAvailabilityDetail(id)` 마운트 | `data.id` 일치 | P0 |
| MERC-03-019 | MSW: GET /mercenary-availabilities/my-recruitments → 200 | `useMyRecruitments()` 마운트 | 영입 신청 목록 반환 | P1 |
| MERC-03-020 | MSW: POST /mercenary-availabilities → 201 | `useCreateMercenaryAvailability().mutate(data)` 호출 | availabilityLists, myAvailabilities 쿼리 invalidate | P0 |
| MERC-03-021 | MSW: POST /mercenary-availabilities → 403 (MERCENARY_BLACKLIST) | `useCreateMercenaryAvailability().mutate(data)` 호출 | error.code === 'MERCENARY_BLACKLIST' | P0 |
| MERC-03-022 | MSW: POST /mercenary-availabilities/:id/recruitments → 201 | `useRecruitMercenary(id).mutate(data)` 호출 | availabilityDetail invalidate | P1 |
| MERC-03-023 | MSW: PATCH .../accept → 200 | `useAcceptMercenaryRecruitment().mutate({ availId, recId })` 호출 | myRecruitments invalidate, contact 반환 | P0 |
| MERC-03-024 | MSW: PATCH .../reject → 200 | `useRejectMercenaryRecruitment().mutate({ availId, recId })` 호출 | myRecruitments invalidate | P1 |

---

## Component Test Cases (UI 인터랙션)

### MercenaryPostCard

| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
| MERC-04-001 | status=OPEN, isExpired=false | 카드 렌더링 | "OPEN" 뱃지(초록) 노출, 만료 문구 없음 | P1 |
| MERC-04-002 | status=CLOSED, isExpired=false | 카드 렌더링 | "CLOSED" 뱃지(파랑) 노출 | P1 |
| MERC-04-003 | isExpired=true | 카드 렌더링 | 만료 뱃지(회색) 노출 | P1 |
| MERC-04-004 | acceptedCount=2, requiredCount=3 | 카드 렌더링 | "2/3명" 텍스트 노출 | P2 |
| MERC-04-005 | fee=0 | 카드 렌더링 | "무료" 텍스트 노출 | P2 |

### PositionPicker

| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
| MERC-04-006 | 포지션 선택 0개 상태 | "FW" 칩 탭 | FW 칩 선택 상태(활성 스타일), onChange(['FW']) 호출 | P1 |
| MERC-04-007 | FW 이미 선택된 상태 | "FW" 칩 재탭 | FW 칩 비선택, onChange([]) 호출 | P1 |
| MERC-04-008 | FW, MF 선택된 상태 | "DF" 칩 탭 | ['FW','MF','DF'] onChange 호출 | P1 |

### ApplyBottomSheet

| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
| MERC-04-009 | isOpen=true | 렌더링 | TextArea, "지원하기" 버튼 노출 | P1 |
| MERC-04-010 | 메시지 100자 초과 입력 | "지원하기" 버튼 탭 | Zod 오류 메시지 노출, API 호출 없음 | P1 |
| MERC-04-011 | 메시지 비워둔 상태 | "지원하기" 버튼 탭 | API 호출됨 (message 선택 필드) | P1 |
| MERC-04-012 | isPending=true | 렌더링 | "지원하기" 버튼 비활성 or 로딩 인디케이터 | P2 |

### RecruitBottomSheet

| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
| MERC-04-013 | isOpen=true | 렌더링 | contactName, contactPhone, message 필드 노출 | P1 |
| MERC-04-014 | contactName 빈 상태 | "영입 신청" 버튼 탭 | 오류 메시지 노출, API 호출 없음 | P1 |

### MercenaryPostFormView

| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
| MERC-04-015 | 폼 빈 상태 | "등록하기" 버튼 탭 | 필수 필드 에러 메시지 노출 | P1 |
| MERC-04-016 | 모든 필수 필드 입력 | "등록하기" 버튼 탭 | onSubmit 콜백 호출 | P0 |
| MERC-04-017 | isPending=true | 렌더링 | 버튼 비활성화 | P2 |

### MercenaryAvailabilityFormView

| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
| MERC-04-018 | 폼 빈 상태 | "등록하기" 버튼 탭 | 필수 필드 에러 메시지 노출 | P1 |
| MERC-04-019 | acceptsFee Switch 기본값 true | Switch 토글 | acceptsFee false, UI 반영 | P2 |

### ApplicationListView

| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
| MERC-04-020 | applications 빈 배열 | 렌더링 | "지원자가 없습니다" 빈 상태 UI 노출 | P1 |
| MERC-04-021 | status=PENDING 지원자 존재 | "수락" 버튼 탭 | onAccept(appId) 콜백 호출 | P0 |
| MERC-04-022 | status=ACCEPTED 지원자 | 렌더링 | 수락/거절 버튼 비노출, 수락 상태 표시 | P1 |

---

## E2E Test Cases (핵심 플로우)

### 용병 구함 — 전체 플로우

| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
| MERC-05-001 | 클럽 관리자(주장)로 로그인, phone 등록 완료 | 용병 탭 → "용병 구함" 탭 진입 | 용병 구함 목록 화면 노출 | P0 |
| MERC-05-002 | 클럽 관리자가 목록 화면에서 FAB 탭 | 포지션·인원·날짜·참가비 입력 후 "등록하기" 탭 | 등록 성공 토스트, 해당 상세 화면으로 이동, 목록에 새 게시글 OPEN 상태 노출 | P0 |
| MERC-05-003 | 클럽 관리자 + phone 미등록 상태 | 용병 구함 등록 버튼 탭 | "연락처를 등록해주세요" AlertDialog 노출 | P1 |
| MERC-05-004 | 블랙리스트 사용자(mannerScore≤20) | 용병 구함 등록 제출 | 서버 403 → "게시글 등록이 제한된 계정입니다" 토스트 | P0 |
| MERC-05-005 | 관리자가 자신의 OPEN 게시글 상세 진입 | "수정" 버튼 탭 | 수정 폼 화면으로 이동, 기존 데이터 defaultValues로 채워짐 | P1 |
| MERC-05-006 | 관리자가 CLOSED 게시글 상세 진입 | 화면 렌더링 | "수정" 버튼 비노출 or 비활성 | P1 |
| MERC-05-007 | 관리자가 자신의 게시글 상세 진입 | "삭제" 탭 → ConfirmDialog 확인 | soft delete 성공, 목록으로 이동 | P1 |
| MERC-05-008 | 일반 사용자가 OPEN 게시글 상세 진입, phone 등록 완료 | "지원하기" 버튼 탭 | ApplyBottomSheet 노출 | P0 |
| MERC-05-009 | 일반 사용자가 메시지 입력 후 "지원하기" 제출 | ApplyBottomSheet submit | PENDING 생성 성공 토스트, 버튼이 "지원 완료" 상태로 변경 | P0 |
| MERC-05-010 | 이미 지원한 사용자가 게시글 상세 진입 | 화면 렌더링 | "지원하기" 버튼 비활성화 or "지원 완료" 표시 | P1 |
| MERC-05-011 | 관리자가 지원자 관리 페이지 진입 | PENDING 지원자 "수락" 탭 | Application ACCEPTED, 연락처 Modal 노출 | P0 |
| MERC-05-012 | acceptedCount+1 == requiredCount인 상태에서 수락 | 마지막 지원자 "수락" 탭 | 게시글 상태 CLOSED, 잔여 PENDING 일괄 REJECTED, 관리자 화면에 CLOSED 배지 노출 | P0 |
| MERC-05-013 | 관리자가 지원자 "거절" 탭 | PENDING 지원자 거절 | Application REJECTED, 목록에서 상태 변경 반영 | P1 |
| MERC-05-014 | 관리자(부주장 아닌 일반 멤버)가 지원자 관리 URL 직접 접근 | API GET /applications 호출 | 서버 403, 화면에 에러 표시 | P0 |

### 용병 가능 — 전체 플로우

| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
| MERC-05-015 | 개인 사용자로 로그인 | 용병 탭 → "용병 가능" 탭 진입 | 용병 가능 목록 화면 노출 | P0 |
| MERC-05-016 | 개인 사용자가 FAB 탭 | 포지션·날짜·지역 입력 후 "등록하기" 탭 | 등록 성공 토스트, 상세 화면으로 이동 | P0 |
| MERC-05-017 | 블랙리스트 사용자(noShowApproved≥3) | 용병 가능 등록 제출 | 서버 403 → "게시글 등록이 제한된 계정입니다" 토스트 | P0 |
| MERC-05-018 | 개인 사용자가 자신의 가능 게시글 상세 진입 | "수정" 탭 | 수정 폼 화면으로 이동, 기존 데이터 채워짐 | P1 |
| MERC-05-019 | 모든 availableDates가 과거 날짜 | 목록·상세 노출 | isExpired=true, 만료 배지 표시 | P1 |
| MERC-05-020 | 클럽 관리자가 OPEN 가능 게시글 상세 진입, phone 등록 완료 | "영입 신청" 버튼 탭 | RecruitBottomSheet 노출 | P0 |
| MERC-05-021 | 관리자가 contactName·Phone·message 입력 후 제출 | RecruitBottomSheet submit | PENDING 생성 성공 토스트 | P0 |
| MERC-05-022 | 동일 클럽이 동일 게시글에 두 번 영입 신청 | 두 번째 "영입 신청" 제출 | 서버 409 → 중복 에러 처리 | P1 |
| MERC-05-023 | 개인 사용자가 "내 영입 신청" 탭 진입 | 화면 렌더링 | PENDING 영입 신청 목록 노출 | P0 |
| MERC-05-024 | 개인 사용자가 PENDING 영입 신청 "수락" | 수락 버튼 탭 | Recruitment ACCEPTED, 팀 연락처 Modal 노출 | P0 |
| MERC-05-025 | 개인 사용자가 영입 신청 "거절" | 거절 버튼 탭 | Recruitment REJECTED, 목록 상태 변경 | P1 |
| MERC-05-026 | 자신의 게시글 등록자가 영입 신청 탭 진입 | "영입 신청" 버튼 | `isOwnPost=true` → 버튼 비노출 | P1 |

### 노쇼 신고

| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
| MERC-05-027 | 경기 날짜 이후, ACCEPTED Application 존재 | 노쇼 신고 제출 (reason 입력) | NoShowReport PENDING 생성 성공 | P1 |
| MERC-05-028 | 동일 신고자가 동일 Application에 중복 신고 | 두 번째 신고 제출 | 서버 409 → 중복 신고 에러 | P1 |
| MERC-05-029 | 경기 날짜 이전에 신고 시도 | 신고 제출 | 서버 400 → "경기 날짜 이전에는 신고할 수 없습니다" | P2 |
| MERC-05-030 | PENDING/REJECTED Application에 신고 시도 | 신고 제출 | 서버 400 → "수락된 신청만 신고 가능합니다" | P1 |

### 필터 / 페이지네이션

| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
| MERC-05-031 | 용병 구함 목록, 더 불러올 데이터 존재 | FlatList 끝까지 스크롤 | fetchNextPage 호출, 다음 페이지 아이템 리스트 하단에 추가 | P0 |
| MERC-05-032 | `positions=['FW']` 필터 적용 | 목록 렌더링 | FW 포지션 포함 게시글만 노출 | P1 |
| MERC-05-033 | `regionId=xxx` 필터 적용 | 목록 렌더링 | 해당 지역 게시글만 노출 | P1 |
| MERC-05-034 | 네트워크 오프라인 상태 | 목록 진입 | 에러 바운더리 fallback UI 노출 | P1 |
| MERC-05-035 | 목록 아이템 0개 | 렌더링 | 빈 상태 UI("등록된 게시글이 없습니다") 노출 | P1 |
