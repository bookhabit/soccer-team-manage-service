# Club Test Cases

> 테스트케이스 ID 규격: `{기능}-{카테고리}-{순번}`
> 카테고리: 01(접근/권한) · 02(입력 유효성) · 03(제출/요청) · 04(성공) · 05(실패/예외)

---

## Unit Test Cases — `data/schemas`, utils

| ID | GIVEN | WHEN | THEN | 우선순위 |
|----|-------|------|------|---------|
| CLUB-01-01 | 유효한 ClubDetail 응답 객체 | `ClubDetailSchema.parse()` 호출 | 파싱 성공, myRole 포함 타입 반환 | P0 |
| CLUB-01-02 | `recruitmentStatus` 필드가 없는 응답 | `ClubDetailSchema.parse()` 호출 | ZodError throw | P0 |
| CLUB-01-03 | 유효한 ClubMember 객체 | `ClubMemberSchema.parse()` 호출 | 파싱 성공, stats 포함 | P1 |
| CLUB-01-04 | 유효한 Post 객체 | `PostSchema.parse()` 호출 | 파싱 성공 | P1 |
| CLUB-01-05 | 유효한 InviteCode 객체 (`expiresAt` 미래) | `InviteCodeSchema.parse()` 호출 | `isExpired: false` | P1 |
| CLUB-01-06 | `expiresAt`이 과거인 InviteCode 객체 | `InviteCodeSchema.parse()` 호출 | `isExpired: true` | P1 |
| CLUB-01-07 | 유효한 ClubPreview 배열 응답 | `ClubPreviewSchema.array().parse()` 호출 | 파싱 성공, 전체 항목 반환 | P1 |
| CLUB-01-08 | 유효한 JoinRequest 객체 | `JoinRequestSchema.parse()` 호출 | status 필드 enum 검증 통과 | P1 |
| CLUB-01-09 | 예상 외 필드 포함된 응답 | 각 Schema `.parse()` 호출 | 추가 필드 strip (strip 모드 기준) | P2 |
| CLUB-01-10 | 유효한 DissolveVote 객체 (`IN_PROGRESS`) | `DissolveVoteSchema.parse()` 호출 | 파싱 성공, expiresAt 포함 | P1 |

---

## Integration Test Cases — hooks + MSW

### 클럽 조회

| ID | GIVEN | WHEN | THEN | 우선순위 |
|----|-------|------|------|---------|
| CLUB-03-01 | 인증된 유저, 소속 클럽 있음 | `useMyClub()` 호출 | `GET /clubs/my` 요청 → ClubDetail 반환 | P0 |
| CLUB-03-02 | 인증된 유저, 소속 클럽 없음 | `useMyClub()` 호출 | `GET /clubs/my` 200 null 반환 → data = null | P0 |
| CLUB-03-03 | 인증된 유저, 유효한 clubId | `useClubDetail(clubId)` 호출 | `GET /clubs/:clubId` → 상세 데이터 반환 | P0 |
| CLUB-03-04 | 서버 500 응답 | `useMyClub()` 호출 | `isError: true`, `throwOnError` 시 ErrorBoundary 활성화 | P0 |
| CLUB-03-05 | 네트워크 단절 | `useClubDetail(clubId)` 호출 | 네트워크 에러 → `isError: true`, 재시도 UI 표시 | P1 |

### 클럽 생성

| ID | GIVEN | WHEN | THEN | 우선순위 |
|----|-------|------|------|---------|
| CLUB-03-06 | 유효한 클럽 생성 DTO | `useCreateClub().mutate(dto)` 호출 | `POST /clubs` 201 → myClub 쿼리 무효화 | P0 |
| CLUB-03-07 | 이미 소속 팀 있는 유저 | `useCreateClub().mutate(dto)` 호출 | 서버 `CLUB_003` → `isError: true` | P0 |
| CLUB-03-08 | 클럽 생성 성공 | `useCreateClub()` onSuccess 콜백 | `clubQueryKeys.myClub` invalidate 확인 | P1 |

### 팀원 목록

| ID | GIVEN | WHEN | THEN | 우선순위 |
|----|-------|------|------|---------|
| CLUB-03-09 | 팀원 25명, 커서 페이지 | `useClubMembers(clubId)` 호출 | 첫 페이지 20건 반환, `nextCursor` 존재 | P0 |
| CLUB-03-10 | 마지막 페이지 도달 | `fetchNextPage()` 호출 | 나머지 5건 반환, `nextCursor: null` | P0 |
| CLUB-03-11 | 팀원 0명 (해당 없는 케이스지만 방어) | `useClubMembers(clubId)` 호출 | `data.pages[0].data = []`, `nextCursor: null` | P1 |

### 가입 신청

| ID | GIVEN | WHEN | THEN | 우선순위 |
|----|-------|------|------|---------|
| CLUB-03-12 | 소속 없는 유저, 모집 중 클럽 | `useCreateJoinRequest().mutate(dto)` | `POST /clubs/:clubId/join-requests` 201 | P0 |
| CLUB-03-13 | 이미 신청 중인 유저 | `useCreateJoinRequest().mutate(dto)` | 서버 `CLUB_006` → onError 콜백 실행 | P0 |
| CLUB-03-14 | 강퇴 이력 있는 유저 | `useCreateJoinRequest().mutate(dto)` | 서버 `CLUB_005` → onError 콜백 실행 | P0 |
| CLUB-03-15 | 이미 소속 팀 있는 유저 | `useCreateJoinRequest().mutate(dto)` | 서버 `CLUB_003` → onError 콜백 실행 | P0 |
| CLUB-03-16 | 신청 취소 | `useCancelJoinRequest().mutate()` | `DELETE /clubs/:clubId/join-requests/mine` 200 | P1 |
| CLUB-03-17 | Captain·Vice가 신청 승인 | `useApproveRequest().mutate(requestId)` | `PATCH .../approve` 200 → joinRequests 무효화 | P0 |
| CLUB-03-18 | 승인으로 정원 50명 도달 | `useApproveRequest().mutate(requestId)` | 서버가 `recruitmentStatus = CLOSED` 자동 전환, 응답에 반영 | P0 |
| CLUB-03-19 | Captain·Vice가 신청 거절 | `useRejectRequest().mutate(requestId)` | `PATCH .../reject` 200 | P1 |

### 초대 코드

| ID | GIVEN | WHEN | THEN | 우선순위 |
|----|-------|------|------|---------|
| CLUB-03-20 | 유효한 초대 코드 입력 | `useJoinByCode().mutate({ code })` | `POST /clubs/join-by-code` 201 → JoinRequest 생성 | P0 |
| CLUB-03-21 | 만료된 초대 코드 입력 | `useJoinByCode().mutate({ code })` | 서버 `CLUB_007` → onError 콜백 실행 | P0 |
| CLUB-03-22 | 존재하지 않는 코드 입력 | `useJoinByCode().mutate({ code })` | 서버 `CLUB_008` → onError 콜백 실행 | P0 |
| CLUB-03-23 | 이미 가입된 유저가 코드 입력 | `useJoinByCode().mutate({ code })` | 서버 `CLUB_003` → onError 콜백 실행 | P0 |
| CLUB-03-24 | Captain·Vice가 코드 재발급 | `useRenewInviteCode().mutate()` | `POST .../invite-code/renew` 201 → inviteCode 무효화 | P1 |

### 강퇴

| ID | GIVEN | WHEN | THEN | 우선순위 |
|----|-------|------|------|---------|
| CLUB-03-25 | Captain이 일반 팀원 강퇴 | `useKickMember().mutate(targetUserId)` | `DELETE .../kick` 200 → members 무효화 | P0 |
| CLUB-03-26 | Vice가 일반 팀원 강퇴 | `useKickMember().mutate(targetUserId)` | `DELETE .../kick` 200 성공 | P0 |
| CLUB-03-27 | MEMBER 권한이 강퇴 시도 | `useKickMember().mutate(targetUserId)` | 서버 `CLUB_002` → onError 콜백 실행 | P0 |

### 탈퇴 / 권한 이전

| ID | GIVEN | WHEN | THEN | 우선순위 |
|----|-------|------|------|---------|
| CLUB-03-28 | 부주장이 자진 탈퇴 | `useLeaveClub().mutate({ reason })` | `DELETE .../leave` 200 → 역할 해제 후 멤버십 삭제 | P0 |
| CLUB-03-29 | 주장이 권한 이전 없이 탈퇴 시도 | `useLeaveClub().mutate({ reason })` | 서버 `CLUB_009` → onError 콜백 실행 | P0 |
| CLUB-03-30 | 주장이 권한 이전 후 탈퇴 | `useTransferCaptain().mutate({ targetUserId })` → `useLeaveClub()` | 이전 성공 후 탈퇴 성공 | P0 |

### 해체 투표

| ID | GIVEN | WHEN | THEN | 우선순위 |
|----|-------|------|------|---------|
| CLUB-03-31 | 주장 혼자뿐 | `useStartDissolveVote().mutate()` | 즉시 해체 처리, myClub = null | P0 |
| CLUB-03-32 | 팀원 2명 이상 | `useStartDissolveVote().mutate()` | `POST .../dissolve-vote` 201, expiresAt +48h | P0 |
| CLUB-03-33 | 이미 투표 진행 중 | `useStartDissolveVote().mutate()` | 서버 `CLUB_010` → onError 콜백 실행 | P0 |
| CLUB-03-34 | 팀원이 동의 응답 | `useRespondDissolveVote().mutate({ agreed: true })` | `PATCH .../respond` 200 | P1 |
| CLUB-03-35 | 팀원이 거절 응답 | `useRespondDissolveVote().mutate({ agreed: false })` | 해체 취소, vote status = REJECTED | P0 |
| CLUB-03-36 | 48시간 만료 후 조회 | `useDissolveVote(clubId)` 호출 | 서버 `CLUB_011` → 만료 상태 반환 | P0 |

### 게시판

| ID | GIVEN | WHEN | THEN | 우선순위 |
|----|-------|------|------|---------|
| CLUB-03-37 | 게시글 20건 이상 | `usePosts(clubId)` 호출 | 커서 페이지 첫 페이지 20건 + `nextCursor` | P0 |
| CLUB-03-38 | 공지사항 탭 선택 | `usePosts(clubId, 'NOTICE')` 호출 | type=NOTICE 필터링된 게시글만 반환 | P1 |
| CLUB-03-39 | 게시글 없음 | `usePosts(clubId)` 호출 | `data.pages[0].data = []` | P1 |
| CLUB-03-40 | 유효한 게시글 작성 DTO | `useCreatePost().mutate(dto)` | `POST .../posts` 201 → posts 무효화 | P0 |
| CLUB-03-41 | 게시글 상세 조회 | `usePostDetail(clubId, postId)` 호출 | `GET .../posts/:postId` 200 → Redis INCR 트리거 | P0 |
| CLUB-03-42 | 작성자가 게시글 수정 | `useUpdatePost().mutate(dto)` | `PATCH .../posts/:postId` 200 | P1 |
| CLUB-03-43 | 비작성자가 게시글 수정 시도 | `useUpdatePost().mutate(dto)` | 서버 `POST_002` → onError 콜백 실행 | P0 |
| CLUB-03-44 | Captain이 타인 게시글 삭제 | `useDeletePost().mutate(postId)` | `DELETE .../posts/:postId` 200 | P0 |
| CLUB-03-45 | 댓글 작성 | `useCreateComment().mutate(dto)` | `POST .../comments` 201 → comments 무효화 | P1 |
| CLUB-03-46 | 서버 500 중 게시글 작성 | `useCreatePost().mutate(dto)` | onError 콜백 실행, 캐시 롤백 없음 | P1 |

---

## Component Test Cases — UI 인터랙션

### 클럽 탭 홈

| ID | GIVEN | WHEN | THEN | 우선순위 |
|----|-------|------|------|---------|
| CLUB-04-01 | 소속 클럽 없음 | `ClubTabContainer` 렌더링 | `NoClubView` 렌더링, "팀 만들기"·"팀 찾기" 버튼 노출 | P0 |
| CLUB-04-02 | 소속 클럽 있음 | `ClubTabContainer` 렌더링 | 대시보드 View 렌더링 (클럽 이름, 전적, 경기 프리뷰) | P0 |
| CLUB-04-03 | 데이터 로딩 중 | `ClubTabContainer` 렌더링 | Skeleton UI 표시 | P0 |
| CLUB-04-04 | API 에러 | `ClubTabContainer` 렌더링 | 에러 Fallback + 재시도 버튼 | P0 |

### 클럽 생성 Funnel

| ID | GIVEN | WHEN | THEN | 우선순위 |
|----|-------|------|------|---------|
| CLUB-04-05 | 1단계 폼, 팀 이름 빈 값 | "다음" 버튼 클릭 | 버튼 비활성화 또는 필수 입력 에러 메시지 | P0 |
| CLUB-04-06 | 1단계 폼, 최대 인원 1 입력 | "다음" 버튼 클릭 | "2명 이상 입력하세요" 유효성 에러 | P0 |
| CLUB-04-07 | 1단계 폼, 최대 인원 51 입력 | "다음" 버튼 클릭 | "50명 이하 입력하세요" 유효성 에러 | P0 |
| CLUB-04-08 | 1단계 유효 완료 | "다음" 버튼 클릭 | 2단계로 전환 | P0 |
| CLUB-04-09 | 3단계 완료 후 제출 | `useCreateClub().mutate()` 성공 | 클럽 탭 홈으로 이동, 초대 코드 화면 노출 | P0 |
| CLUB-04-10 | 3단계 완료 후 제출, 서버 에러 | `useCreateClub().mutate()` 실패 | 에러 토스트 표시, Funnel 유지 | P1 |

### 가입 신청

| ID | GIVEN | WHEN | THEN | 우선순위 |
|----|-------|------|------|---------|
| CLUB-04-11 | 신청 메시지 501자 입력 | 제출 버튼 클릭 | "500자 이하" 유효성 에러 | P0 |
| CLUB-04-12 | `<script>alert(1)</script>` 입력 | 제출 버튼 클릭 | 클라이언트에서 표시는 escape 처리, 서버에서도 sanitize | P0 |
| CLUB-04-13 | 이미 신청 중인 상태 | `JoinRequestView` 렌더링 | "신청 취소" 버튼 표시 | P0 |
| CLUB-04-14 | 모집 마감 클럽 진입 | `JoinRequestView` 렌더링 | 신청 버튼 비활성화 + "모집 마감" 안내 | P0 |

### 초대 코드 입력

| ID | GIVEN | WHEN | THEN | 우선순위 |
|----|-------|------|------|---------|
| CLUB-04-15 | 만료된 코드 입력 후 제출 | `useJoinByCode()` `CLUB_007` 에러 | "초대 코드가 만료됐습니다. 팀 관리자에게 재발급을 요청하세요" 팝업 | P0 |
| CLUB-04-16 | 잘못된 코드 입력 후 제출 | `useJoinByCode()` `CLUB_008` 에러 | "유효하지 않은 초대 코드입니다" 팝업 | P0 |
| CLUB-04-17 | 이미 가입된 팀 코드 입력 | `useJoinByCode()` `CLUB_003` 에러 | "이미 가입된 팀입니다" 팝업 | P0 |
| CLUB-04-18 | 유효한 코드 입력 후 제출 | `useJoinByCode()` 성공 | "가입 신청이 완료됐습니다" 토스트 | P0 |

### 가입 신청 관리

| ID | GIVEN | WHEN | THEN | 우선순위 |
|----|-------|------|------|---------|
| CLUB-04-19 | 신청 목록 없음 | `JoinRequestsManageView` 렌더링 | "신청이 없습니다" 빈 상태 UI | P0 |
| CLUB-04-20 | 신청 있음, 승인 클릭 | `useApproveRequest().mutate()` 성공 | 해당 카드 목록에서 제거, 성공 토스트 | P0 |
| CLUB-04-21 | 정원이 꽉 찬 상태에서 승인 | `useApproveRequest().mutate()` `CLUB_004` 에러 | "팀 정원이 초과되었습니다" 토스트 | P0 |
| CLUB-04-22 | MEMBER 권한 유저가 관리 페이지 진입 | 라우트 진입 | 접근 차단 또는 관리 버튼 미노출 | P0 |

### 팀원 목록 / 강퇴

| ID | GIVEN | WHEN | THEN | 우선순위 |
|----|-------|------|------|---------|
| CLUB-04-23 | 팀원 목록 스크롤 하단 | `FlatList` `onEndReached` 트리거 | `fetchNextPage()` 호출, 다음 팀원 로드 | P1 |
| CLUB-04-24 | 강퇴 버튼 클릭 | `ConfirmDialog` 표시 | "강퇴하시겠습니까?" 확인 Dialog | P0 |
| CLUB-04-25 | 강퇴 확인 클릭 | `useKickMember().mutate()` 성공 | 해당 팀원 목록에서 제거 | P0 |
| CLUB-04-26 | MEMBER가 팀원 상세 진입 | `MemberDetailView` 렌더링 | 능력치 수정 버튼 미노출 | P0 |
| CLUB-04-27 | Captain·Vice가 팀원 상세 진입 | `MemberDetailView` 렌더링 | 능력치 수정 버튼 노출 | P0 |

### 권한 이전 / 탈퇴

| ID | GIVEN | WHEN | THEN | 우선순위 |
|----|-------|------|------|---------|
| CLUB-04-28 | 주장이 클럽 설정 진입 | `ClubSettingsContainer` 렌더링 | "권한 이전 후 탈퇴 가능" 안내 + 탈퇴 버튼 비활성화 | P0 |
| CLUB-04-29 | 권한 이전 완료 후 탈퇴 버튼 | `useLeaveClub()` 버튼 활성화 상태 | 버튼 활성화 → 클릭 시 탈퇴 처리 | P0 |
| CLUB-04-30 | 일반 팀원 탈퇴 사유 미선택 | "팀 나가기" 버튼 클릭 | 버튼 비활성화 (필수 선택) | P1 |

### 해체 투표

| ID | GIVEN | WHEN | THEN | 우선순위 |
|----|-------|------|------|---------|
| CLUB-04-31 | 해체 투표 진행 중 | `DissolveVoteView` 렌더링 | 남은 시간 표시 + 동의·거절 버튼 노출 | P0 |
| CLUB-04-32 | 이미 만료된 투표 | `DissolveVoteView` 렌더링 | "투표가 만료되었습니다" 안내, 버튼 비활성화 | P0 |
| CLUB-04-33 | 거절 클릭 | `useRespondDissolveVote().mutate({ agreed: false })` 성공 | "해체가 취소되었습니다" 토스트 | P0 |

### 게시판

| ID | GIVEN | WHEN | THEN | 우선순위 |
|----|-------|------|------|---------|
| CLUB-04-34 | 게시글 제목 101자 입력 | 작성 제출 | "제목은 100자 이하" 에러 | P0 |
| CLUB-04-35 | 본문 2001자 입력 | 작성 제출 | "본문은 2000자 이하" 에러 | P0 |
| CLUB-04-36 | 작성자가 수정 버튼 클릭 | 게시글 상세 | 수정 폼 진입 | P1 |
| CLUB-04-37 | 타인이 게시글 상세 진입 | `PostDetailView` 렌더링 | 수정 버튼 미노출 | P0 |
| CLUB-04-38 | Captain이 타인 게시글 상세 진입 | `PostDetailView` 렌더링 | 삭제 버튼 노출, 수정 버튼 미노출 | P0 |
| CLUB-04-39 | 게시글 없음 | `BoardView` 렌더링 | "게시글이 없습니다" 빈 상태 | P1 |
| CLUB-04-40 | 댓글 501자 입력 | 댓글 제출 | "댓글은 500자 이하" 에러 | P0 |
| CLUB-04-41 | 공지사항 탭 클릭 | `BoardView` 탭 전환 | type=NOTICE 필터 쿼리 재요청 | P1 |

### 클럽 검색

| ID | GIVEN | WHEN | THEN | 우선순위 |
|----|-------|------|------|---------|
| CLUB-04-42 | 검색어 입력 후 검색 | `useClubSearch()` 호출 | 이름 매칭 클럽 카드 목록 표시 | P0 |
| CLUB-04-43 | 검색 결과 없음 | `useClubSearch()` 빈 배열 반환 | "검색 결과가 없습니다" 빈 상태 | P0 |
| CLUB-04-44 | 추천 클럽 탭 | `useRecommendedClubs()` 호출 | preferredRegion 기반 클럽 목록 노출 | P1 |

---

## E2E Test Cases — 핵심 플로우

| ID | GIVEN | WHEN | THEN | 우선순위 |
|----|-------|------|------|---------|
| CLUB-05-01 | 소속 없는 인증 유저 | 클럽 생성 3단계 Funnel 완료 | 클럽 탭에 새 클럽 대시보드 표시, 초대 코드 화면 노출 | P0 |
| CLUB-05-02 | 소속 없는 유저 A, 유효 초대 코드 보유 | 코드 입력 → 신청 완료 | 관리자 신청 관리 페이지에 A의 신청 노출 | P0 |
| CLUB-05-03 | 관리자가 신청 승인 (정원 1명 남음) | 승인 클릭 | 팀원 수 증가 + 정원 도달 시 모집 자동 마감 뱃지 전환 | P0 |
| CLUB-05-04 | Captain이 Vice 임명 | 역할 변경 | 해당 팀원 카드에 "부주장" 뱃지 노출 | P1 |
| CLUB-05-05 | Captain이 팀원 강퇴 | 강퇴 확인 → 완료 | 팀원 목록에서 제거 + 해당 유저 재가입 불가 | P0 |
| CLUB-05-06 | 주장이 권한 이전 후 탈퇴 | 이전 → 탈퇴 완료 | 클럽 탭이 빈 상태(NoClubView)로 전환 | P0 |
| CLUB-05-07 | 팀원 2명 이상, 해체 투표 시작 | 모든 팀원 동의 | 클럽 해체 완료 + 모든 유저 빈 상태 전환 | P0 |
| CLUB-05-08 | 팀원 2명 이상, 해체 투표 시작 | 1명 거절 | 해체 취소 + 클럽 유지 | P0 |
| CLUB-05-09 | 팀원 탈퇴 중 해체 투표 진행 | 해체 투표 중 팀원 자진 탈퇴 | 탈퇴자 자동 동의 처리 → 나머지 전원 동의 시 해체 | P0 |
| CLUB-05-10 | 팀원이 게시글 작성 + 상단 고정 | 팀원 알림 전송 on + 제출 | 게시글 목록 최상단에 핀 노출 | P1 |
| CLUB-05-11 | 게시글 상세 진입 (조회수 0) | 화면 렌더링 완료 | 재진입 시 조회수 +1 반영 (Redis flush 후 DB 기준) | P2 |
| CLUB-05-12 | Rate Limit — 초대 코드 10회 초과 | 11번째 코드 입력 제출 | 429 응답 → "잠시 후 다시 시도해주세요" 토스트 | P0 |
| CLUB-05-13 | 소속 없는 유저, 관리자 전용 라우트 직접 접근 | URL 직접 입력 | 접근 차단 또는 권한 없음 에러 | P0 |
| CLUB-05-14 | 네트워크 단절 중 클럽 탭 진입 | 오프라인 상태 | 캐시된 데이터 표시 또는 네트워크 에러 UI | P1 |
| CLUB-05-15 | 주장 1인 팀에서 해체 요청 | 해체 버튼 클릭 → 확인 | 즉시 해체 처리 + 빈 상태 전환 | P0 |
