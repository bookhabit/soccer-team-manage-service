# 파일 업로드 (File Upload) Test Cases

## 📌 테스트 요약
- **총 케이스 수:** 38개
- **성공(04):** 10개 / **실패 및 예외(01, 02, 03, 05):** 28개

---

## 1. Unit Test Cases (Logic & Schema)

| ID | GIVEN (상황/데이터) | WHEN (입력/실행) | THEN (기대 결과) | 우선순위 |
|---|---|---|---|---|
| FILE-02-001 | `uploadResponseSchema` 정의됨 | `{ url: '/uploads/avatars/abc.jpg' }` 를 파싱 | `{ url: string }` 타입 정상 추출 | P1 |
| FILE-02-002 | `uploadResponseSchema` 정의됨 | `{ url: 123 }` 처럼 잘못된 타입 파싱 | Zod 파싱 오류 throw | P1 |
| FILE-02-003 | `uploadResponseSchema` 정의됨 | `{}` (url 필드 누락) 파싱 | Zod 파싱 오류 throw | P1 |
| FILE-02-004 | `getAvatarUrl` 헬퍼 정의됨 | `null` 전달 | `DEFAULT_AVATAR` URL 반환 | P1 |
| FILE-02-005 | `getAvatarUrl` 헬퍼 정의됨 | `undefined` 전달 | `DEFAULT_AVATAR` URL 반환 | P1 |
| FILE-02-006 | `getAvatarUrl` 헬퍼 정의됨 | `'/uploads/avatars/abc.jpg'` 전달 | `BASE_URL + '/uploads/avatars/abc.jpg'` 반환 | P1 |
| FILE-02-007 | `getClubLogoUrl` 헬퍼 정의됨 | `null` 전달 | `DEFAULT_CLUB_LOGO` URL 반환 | P1 |
| FILE-02-008 | `getClubLogoUrl` 헬퍼 정의됨 | `'/uploads/clubs/xyz.jpg'` 전달 | `BASE_URL + '/uploads/clubs/xyz.jpg'` 반환 | P1 |

---

## 2. Integration Test Cases (API / 데이터 흐름)

| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
| FILE-04-001 | 로그인된 유저, 유효한 JPEG FormData | `POST /upload/avatar` 호출 | 200 + `{ url: '/uploads/avatars/{uuid}.jpg' }` 반환 | P1 |
| FILE-04-002 | 로그인된 유저, 기존 avatarUrl 존재 | `POST /upload/avatar` 재업로드 | 기존 파일 삭제 + 새 URL 반환 + `user.avatarUrl` 업데이트 | P1 |
| FILE-04-003 | 로그인된 유저, avatarUrl 존재 | `DELETE /upload/avatar` 호출 | `user.avatarUrl = null` + 기존 파일 삭제 + 204 반환 | P1 |
| FILE-04-004 | 로그인된 유저, avatarUrl이 이미 null | `DELETE /upload/avatar` 호출 | 오류 없이 204 반환 | P2 |
| FILE-04-005 | CAPTAIN 유저, 유효한 PNG FormData | `POST /upload/club-logo/:clubId` 호출 | 200 + `{ url: '/uploads/clubs/{uuid}.jpg' }` 반환 + JPEG 변환 저장 | P1 |
| FILE-04-006 | VICE_CAPTAIN 유저 | `POST /upload/club-logo/:clubId` 호출 | 200 정상 응답 (부주장도 업로드 가능) | P1 |
| FILE-04-007 | CAPTAIN, 기존 logoUrl 존재 | `POST /upload/club-logo/:clubId` 재업로드 | 이전 파일 삭제 + 새 URL 저장 | P1 |
| FILE-04-008 | CAPTAIN | `DELETE /upload/club-logo/:clubId` 호출 | `club.logoUrl = null` + 파일 삭제 | P1 |
| FILE-01-001 | 비로그인 상태 | `POST /upload/avatar` 호출 | 401 Unauthorized | P1 |
| FILE-01-002 | MEMBER 권한 유저 | `POST /upload/club-logo/:clubId` 호출 | 403 + `UPLOAD_004` 에러 코드 | P1 |
| FILE-01-003 | 존재하지 않는 clubId | `POST /upload/club-logo/:clubId` 호출 | 404 + `UPLOAD_005` 에러 코드 | P1 |
| FILE-02-009 | 로그인된 유저 | 파일 없이 `POST /upload/avatar` 호출 | 400 + `UPLOAD_001` 에러 코드 | P1 |
| FILE-02-010 | 로그인된 유저 | `image/gif` MIME 타입 파일 전송 | 415 + `UPLOAD_002` 에러 코드 | P1 |
| FILE-02-011 | 로그인된 유저 | 6MB 파일 전송 | 413 + `UPLOAD_003` 에러 코드 | P1 |
| FILE-02-012 | 로그인된 유저 | 정확히 5MB 파일 전송 | 200 정상 업로드 (경계값) | P2 |
| FILE-04-009 | 로그인된 유저, `useUploadAvatar` 뮤테이션 성공 | 업로드 완료 | `['my-profile']` 쿼리 자동 invalidate → 프로필 화면 최신화 | P1 |
| FILE-04-010 | CAPTAIN, `useUploadClubLogo` 뮤테이션 성공 | 업로드 완료 | `['my-club']`, `['club', clubId]` 쿼리 invalidate | P1 |
| FILE-05-001 | 서버 500 에러 상황 | `POST /upload/avatar` 호출 | `onError` 콜백 실행 → toast.error 노출 | P1 |
| FILE-05-002 | 네트워크 단절 상태 | `POST /upload/avatar` 호출 | Axios 네트워크 에러 → toast.error 노출 | P2 |
| FILE-05-003 | avatarUrl이 기본 이미지 경로(`/uploads/defaults/profile.jpg`) | `DELETE /upload/avatar` 호출 | fs.unlink 호출 안 함 (기본 이미지 파일 삭제 방지) | P1 |

---

## 3. Component Test Cases (UI/UX 인터랙션)

| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
| FILE-03-001 | 프로필 편집 화면, 업로드 진행 중 (`isPending: true`) | 화면 렌더링 | Avatar 위에 로딩 인디케이터 표시, 버튼 비활성화 | P2 |
| FILE-03-002 | 프로필 편집 화면 | Avatar 이미지 터치 | 갤러리 picker가 열림 | P1 |
| FILE-03-003 | picker에서 이미지 선택 취소 | picker dismiss | 업로드 API 호출 없이 화면 유지 | P2 |
| FILE-01-004 | MEMBER 권한으로 클럽 설정 화면 진입 | 화면 렌더링 | 로고 이미지 터치 불가 (canEditLogo = false) | P1 |
| FILE-01-005 | CAPTAIN으로 클럽 설정 화면 진입 | 화면 렌더링 | 로고 이미지 터치 가능 (canEditLogo = true) | P1 |
| FILE-02-013 | `avatarUrl = null`인 유저 | 프로필 화면 렌더링 | 기본 이미지(`defaults/profile.jpg`)가 표시됨 | P1 |
| FILE-02-014 | `logoUrl = null`인 클럽 | 클럽 화면 렌더링 | 기본 이미지(`defaults/club.jpg`)가 표시됨 | P1 |
| FILE-05-004 | 업로드 실패 (`UPLOAD_002`) | onError 콜백 실행 | `toast.error('이미지 파일만 업로드 가능합니다.')` 노출 | P2 |
| FILE-05-005 | 업로드 실패 (`UPLOAD_003`) | onError 콜백 실행 | `toast.error('파일 크기는 5MB 이하여야 합니다.')` 노출 | P2 |
| FILE-05-006 | 갤러리 접근 권한 거부됨 | Avatar 터치 → picker 권한 요청 거부 | Alert으로 갤러리 접근 권한 안내 노출 | P2 |
| FILE-03-004 | 업로드 중 | 동일 버튼 연속 두 번 터치 | 중복 요청 없음 (isPending 중 버튼 비활성화) | P2 |

---

## 4. E2E Test Cases (핵심 사용자 플로우)

| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
| FILE-04-011 | 로그인된 유저, 기존 이미지 없음 | 프로필 편집 → Avatar 터치 → 갤러리에서 이미지 선택 → 업로드 완료 | 프로필 화면 Avatar에 새 이미지 즉시 반영, `toast.success` 노출 | P1 |
| FILE-04-012 | 기존 avatarUrl 있는 유저 | 프로필 이미지 재업로드 | 이전 이미지 대체, 화면 최신화 | P1 |
| FILE-04-013 | CAPTAIN, 클럽 로고 없음 | 클럽 설정 → 로고 터치 → 이미지 선택 → 업로드 | 클럽 프로필 전체(헤더, 피드 등)에서 새 로고 반영 | P1 |
| FILE-05-007 | 업로드 중 네트워크 단절 | 업로드 진행 중 WiFi 끊김 | 에러 토스트 노출, 이전 이미지 유지 (UI 상태 롤백 없이 유지) | P2 |
| FILE-01-006 | MEMBER 권한 유저가 클럽 설정 화면 진입 | 로고 이미지 터치 시도 | 터치 이벤트 발생 안 함, API 호출 없음 | P1 |
