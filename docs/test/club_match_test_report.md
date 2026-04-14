# 기능 테스트 수정사항 — 우선순위 정리

> 테스트 일자: 2026-04-13  
> 기준: P0 → P1 → P2 → P3 순으로 수정

---

## P0 — 서버 오류 (즉시 수정 필요)

### [서버] `recalcMannerScoreAvg` Prisma 오류

- **증상**: 가입 신청 승인 시 서버 500 에러
- **위치**: `server/src/features/club/club.service.ts:52`
- **원인**: `clubMember.aggregate()`에 `user.mannerScore`를 중첩 select로 전달 — ClubMember 모델에는 직접 필드가 없어 `PrismaClientValidationError` 발생
- **해결**: 잘못된 `aggregate()` 호출 제거. 이미 아래에 `$queryRaw` 로직이 올바르게 구현되어 있으므로 중복된 aggregate 블록(52~55줄)만 삭제하면 됨
- **영향 범위**: `kickMember`, `leaveClub`, `approveJoinRequest` 등 `recalcMannerScoreAvg` 를 호출하는 모든 경로

```
서버 에러 로그:
Unknown field `user` for select statement on model `ClubMemberAvgAggregateOutputType`.
Available options: jerseyNumber, speed, shoot, pass, dribble, defense, physical
```

---

## P1 — 기능 블로킹 (주요 기능 동작 불가)

### [서버] 팀원 상세 조회 API 미구현

- **증상**: `GET /clubs/:clubId/members/:userId` → 404
- **원인**: 컨트롤러 및 서비스에 해당 엔드포인트 없음
- **영향**: 팀원 상세 조회 불가 → `useKickMember`, `useTransferCaptain`, `useChangeRole`, `useUpdateMemberStats` 전부 블로킹됨
- **할 일**: 서비스에 `getMemberDetail(clubId, userId, targetUserId)` 구현 후 컨트롤러에 `GET :clubId/members/:userId` 라우트 추가

### [서버] Club name 중복 허용 (스키마 미설정)

- **증상**: 동일 이름으로 클럽 생성 가능
- **원인**: `schema.prisma`의 Club 모델에 `@unique` 없음 (`// 고유값은 아님 — 중복 가능` 주석 현재 상태)
- **할 일**:
  1. `schema.prisma` → `name String @unique`
  2. 마이그레이션 실행
  3. `createClub` 서비스에 `ConflictException` 처리 추가 (`CLUB_NAME_DUPLICATED`)

### [클라이언트] Match 포지션 Zod 스키마 불일치

- **증상**: 포메이션·포지션 변경 후 ZodError 발생
  ```
  Invalid option: expected one of "FW"|"MF"|"DF"|"GK"
  ```
- **원인**: 서버 DB는 `FormationSlot` enum (LB, RCB, ST 등 세분화된 슬롯)을 사용하지만, 클라이언트 `PlayerPositionSchema`는 `['FW', 'MF', 'DF', 'GK']`만 허용
- **위치**: `client/src/features/match/data/schemas/match.schema.ts:8`
- **할 일**: `FormationSlot` 전체 값을 포함하도록 스키마 확장하거나, 서버 응답 타입을 공유 타입으로 맞춤

### [클라이언트] 게시글 수정·삭제 권한 비교 오류

- **증상**: 내가 작성한 글인데 수정·삭제 버튼 동작 안 함
- **원인**: `PostWriteContainer`에서 현재 로그인 userId와 게시글 작성자 userId 비교 로직 누락 또는 잘못됨
- **위치**: `client/src/features/club/ui/container/PostWriteContainer.tsx`
- **할 일**: `useAuthStore`에서 현재 userId를 가져와 게시글 `authorId`와 비교하여 수정·삭제 노출 여부 제어

---

## P2 — UX 문제 (기능은 되나 불편·혼란)

### [클라이언트] 클럽 생성 후 화면 전환 문제

- **증상 1**: 클럽 생성 성공 후 클럽 탭으로 이동하나 바텀탭이 안 보임
- **증상 2**: 생성 직후 초대 코드 화면이 노출되지 않음
- **할 일**: 생성 완료 후 네비게이션 스택 정리 + 초대 코드 화면으로 이동하는 플로우 구현

### [클라이언트] 지역 중복 데이터

- **증상**: 클럽 생성 시 같은 시/군/구가 여러 번 노출 (예: 수원시 5회, 창원시 6회)
- **결정 필요**: 서버 측 `data.regions.json` 정리 vs 클라이언트 필터링
- **추천**: 서버에서 `DISTINCT` 처리 또는 시드 데이터 중복 제거 (클라이언트 필터링은 임시방편)

### [클라이언트] 게시판 동기화 문제

- **증상**:
  - 일반 글 작성 시 전체 탭에는 보이고 일반 탭에는 안 보임 (새로고침하면 보임)
  - 게시판 목록 조회수 2 → 상세 조회수 4 불일치
  - 댓글 삭제 후 목록 댓글 수와 상세 댓글 수 불일치
- **할 일**: `invalidateQueries` 또는 낙관적 업데이트 중 선택 후 일관 적용
  - 추천: 뮤테이션 성공 시 관련 쿼리 키 `invalidateQueries` (단순하고 안전함)
  - 조회수는 추후 Redis INCR로 전환 시 해결 예정

### [클라이언트] 게시판 FlatList refreshControl 없음

- `FlatList`에 `refreshControl` props 추가 필요

### [클라이언트] 팀원 목록 — '나' 표시 및 내 역할 확인 UI

- 팀원 목록에서 현재 로그인 유저에 '나' 배지 표시
- 내 역할(CAPTAIN 등) 확인 위치 결정 필요 (팀 정보 탭 or 멤버 목록 상단)

### [클라이언트] 경기 종료 후 포지션 배정 막기

- **증상**: 이미 끝난 경기에서도 포지션 배정 UI 진입 가능
- **할 일**: 경기 상태가 `ENDED`이면 포지션 배정 버튼 비활성화

### [클라이언트] 포지션 배정 — 쿼터 조회 UI 없음

- 포지션 배정 화면에서 쿼터별 포메이션·포지션 조회(읽기 전용) 모드 추가 필요

### [클라이언트] 포지션 배정 — 1쿼터만 표시되는 문제

- **증상**: 포지션 배정 화면에 1쿼터만 표시됨
- **할 일**: 경기 등록 시 쿼터 수 DTO 포함 여부 확인 → 누락이면 필수 필드로 추가

### [클라이언트] 경기 기록 입력 — 필수 필드 미검증

- 어시스트 선택, 쿼터 선택이 선택 사항으로 처리됨 → 필수로 변경

### [클라이언트] KeyboardAvoidingView 통일

- BottomCTA + Input 조합 시 Android/iOS 기기별 높이 불일치
- `KeyboardAvoidingView` 동작을 공통 컴포넌트 수준에서 통일

---

## P3 — 추후 개선 (TODO / 외부 의존)

### [서버] 초대 코드 보안 검토

- `generateInviteCode`: 현재 `randomBytes(4).toString('hex').toUpperCase()` — 8자리 hex
- 보안 취약점 점검 항목: 코드 유효기간, 재사용 방지, 무차별 대입 방어
- 위치: `club.service.ts:72` `renewInviteCode`

### [서버] 팀원 목록 stats 집계

- 현재 `goals: 0, assists: 0, momCount: 0, matchCount: 0` 하드코딩
- **TODO**: 경기 도메인 연동 완료 후 집계 쿼리 추가

### [서버] 게시글 조회수 Redis INCR 전환

- 현재: DB 직접 증가 (임시)
- **TODO**: `Redis INCR post:{id}:views` → 임계값 도달 시 flush

### [클라이언트] 파일 업로드 구현

- 팀 로고, 프로필 이미지 업로드
- 필요 작업: 권한 설정(app.json), 카메라·갤러리, 이미지 리사이징, 서버 업로드 API

### [클라이언트] 주소·위치 — 카카오 API 연동

- 카카오 주소 검색 API + 카카오맵 연동
- 적용 대상: 사용자·팀 주 위치, 오늘 경기 구장 위치
- 구현 단계:
  1. 카카오 개발자 센터 앱 생성 → JavaScript 키 확보
  2. `react-native-webview` 설치
  3. 웹뷰에서 카카오 우편번호 스크립트 로드
  4. `onMessage` → `window.ReactNativeWebView.postMessage`로 앱 전달
  5. `server/prisma/data.regions.json` 데이터와 연동

---

## 수정 순서 요약

| 순서 | 항목 | 작업 위치 |
|------|------|-----------|
| 1 | `recalcMannerScoreAvg` aggregate 오류 제거 | server |
| 2 | 팀원 상세 조회 API 구현 | server |
| 3 | Club name `@unique` 마이그레이션 | server |
| 4 | Match 포지션 Zod 스키마 불일치 수정 | client |
| 5 | 게시글 수정·삭제 권한 비교 수정 | client |
| 6 | 클럽 생성 후 화면 전환·초대 코드 플로우 | client |
| 7 | 지역 중복 데이터 정리 | server |
| 8 | 게시판 invalidateQueries 동기화 | client |
| 9 | 경기 종료 후 포지션 배정 막기 | client |
| 10 | 나머지 UX 개선 (P2) | client |
