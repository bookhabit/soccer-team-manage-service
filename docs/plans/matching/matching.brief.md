# 경기 매칭 기획안

## 개요

팀 단위로 상대팀을 모집하거나 탐색하는 기능.  
용병 탭과 별개인 **독립 탭**으로 제공한다.  
등록·수락 권한은 클럽 관리자(주장·부주장)에게만 부여한다.

---

## 매칭 탭 구조

탭 내부를 3개 섹션으로 분리한다.

| 탭        | 내용                                                       |
| --------- | ---------------------------------------------------------- |
| 전체 매칭 | 전체 게시글 목록 + 필터                                    |
| 내 게시글 | 본인 팀이 등록한 매칭 목록 + 신청 관리                     |
| 내 신청   | 본인 팀이 신청한 매칭 현황 (PENDING / ACCEPTED / REJECTED) |

---

## 매칭 목록 페이지 (전체 매칭 탭)

**게시글 1개 카드 데이터**

- 팀 정보 (이름, 레벨, 대표 이미지)
- 날짜 / 요일 / 시간
- 인원 (예: 11 vs 11)
- 성별 (혼성 / 남성 / 여성)
- 구장 장소
- 실력 레벨
- 구장비
- 매칭 상태 (모집 중 / 매칭 완료 / 만료)

**검색 및 필터**

- 날짜 범위
- 지역 (시도 + 시군구 기반 — 온보딩 Region 데이터 연계)
- 실력 레벨
- 성별
- 구장비 유무

**기본 뷰**: 만료·완료 게시글 숨김. 필터로 조회 가능.

---

## 매칭 상세 페이지

- 팀 정보 (이름, 레벨, 대표 이미지 — 클릭 시 클럽 프로필 이동)
- 날짜 / 요일 / 시간
- 인원
- 성별
- 구장 (이름 + 주소)
- 실력 레벨
- 구장비 (원(KRW) 단위 정수, 0 = 무료, UI에서 쉼표 포맷 표시)
- 작성일
- 매칭 상태 표시 (모집 중 / 매칭 완료 / 만료)
- **매칭 신청 버튼** (상대팀 관리자에게만 표시, 본인 팀 게시글엔 미표시)

---

## 매칭 등록 페이지

> 권한: 클럽 관리자(주장·부주장)만 등록 가능

**전화번호 사전 확인 (진입 가드)**

- 등록 버튼 클릭 시 `user.phone` 설정 여부 확인
- 미설정 시 AlertDialog: "연락처를 먼저 설정해주세요" → [나중에] [프로필 설정 가기]
- 설정 완료 후 등록 폼으로 진입

**등록 폼 필드**

- 팀 정보 (본인 소속팀 자동 채움)
- 날짜 / 요일 / 시작 시간 / 종료 시간
- 인원 선택 (5 / 6 / 7 / 8 / 9 / 10 / 11명 중 선택)
- 성별 선택 (혼성 / 남성 / 여성)
- 구장 입력 (이름 + 주소)
- 실력 레벨 선택
- 구장비 (무료 / 금액 직접 입력, 원 단위 정수)
- 문의 담당자 이름 (기본값: 등록자 이름, 수정 가능)
- 문의 연락처 (기본값: `user.phone`, 수정 가능)

**수정/삭제**

- 등록자(관리자)만 가능
- 매칭 완료 상태에서는 수정 불가, 삭제만 가능

---

## 내 게시글 탭

- 본인 팀이 등록한 매칭 게시글 목록
- 각 게시글 카드에 **"신청 목록 보기"** 버튼 표시 (PENDING 신청이 있을 때 강조)
- 신청 목록 화면: 신청팀 이름 / 레벨 / 메시지 / 신청 일시 + 수락·거절 버튼

---

## 내 신청 탭

- 본인 팀이 신청한 매칭 게시글 목록
- 신청 상태별 표시: 대기 중(PENDING) / 수락됨(ACCEPTED) / 거절됨(REJECTED)
- 빈 상태: "아직 신청한 매칭이 없어요" 안내

---

## 매칭 공유 기능

- 등록된 매칭 게시글을 팀원에게 공유
- 목적: "이 상대 어때요?" 내부 의견 수렴
- 공유 방식: 콘솔 로그 기록 + TODO (알림 기능 구축 시점에 구현)

---

## 매칭 성사 플로우

### 신청 (복수 신청 허용)

1. 상대팀 관리자가 매칭 상세 페이지에서 **"매칭 신청"** 버튼 클릭
2. **전화번호 사전 확인**: `user.phone` 미설정 시 AlertDialog → 프로필 설정 유도
3. BottomSheet에서 입력:
   - 신청 메시지 (선택, 최대 100자)
   - 담당자 이름 (기본값: `user.name`, 수정 가능)
   - 연락처 (기본값: `user.phone`, 수정 가능)
4. 한 게시글에 여러 팀이 신청 가능. 동일 팀의 중복 신청 불가 (서버 unique 제약)
5. 서버에서 게시글 등록팀 관리자에게 알림 (콘솔 로그 + TODO)
   - 신청팀 이름 / 레벨 / 신청 메시지 포함

**신청 불가 조건 (서버에서 검증):**

- 본인 팀 게시글
- 이미 `MATCHED` 상태인 게시글
- 만료(`matchDate < now()`) 게시글

### 수락/거절

5. 등록팀 관리자: 내 게시글 탭 → 신청 목록에서 **수락 / 거절** 선택
6. **수락 시** (트랜잭션 처리)
   - 해당 신청 → `ACCEPTED`
   - 나머지 PENDING 신청 일괄 → `REJECTED` + 각 신청팀에 거절 알림 (콘솔 로그 + TODO)
   - 게시글 상태 → `MATCHED` (추가 신청 버튼 비활성)
   - 양측 관리자에게 상대방 연락처(이름 + 휴대폰 번호) 인앱 화면 표시
   - **양 팀 각자의 내부 `Match`(경기 관리 탭) 항목 자동 생성**
     - 생성 데이터: 날짜/시간, 구장, 상대팀 이름 + 레벨
     - 유형: `SELF` (리그 아님)
7. **거절 시**
   - 해당 신청 → `REJECTED`
   - 신청팀 관리자에게 거절 알림 (콘솔 로그 + TODO)

### 연락처 노출 정책

- 수락 전까지 양측 휴대폰 번호 미노출
- 수락 이후 **인앱 화면에서 직접 표시**:
  - 등록팀 관리자 → 신청팀 연락처 (`MatchApplication.contactName` + `contactPhone`)
  - 신청팀 관리자 → 등록팀 연락처 (`MatchPost.contactName` + `contactPhone`)
- 연락처 조회 API에 Rate Limiting 적용 (IP당 일일 횟수 제한)
- 별도 인앱 채팅 없음 — 외부 앱(전화·문자)으로 연결

---

## 게시글 상태 및 만료

| 상태                | 조건                                                                   |
| ------------------- | ---------------------------------------------------------------------- |
| 모집 중 (OPEN)      | 등록 후 경기 날짜 이전, 수락 전                                        |
| 매칭 완료 (MATCHED) | 수락 확정된 상태 (DB에 저장)                                           |
| 만료 (EXPIRED)      | `matchDate < now()` 조건으로 **조회 시 동적 계산** — DB 상태 변경 없음 |

- **만료 처리**: 별도 배치/크론 없음. 조회 쿼리에서 `matchDate >= now()` 필터로 목록에서 자동 제외
- **수동 삭제**: 등록자(관리자)가 언제든 삭제 가능 (soft delete)
- 만료·완료 게시글은 목록 기본 뷰에서 숨김, 필터로 조회 가능

---

## 팀 해체 시 처리

- 클럽 해체(`ClubDissolveVote` APPROVED) 시점에:
  - 해당 클럽의 OPEN 매칭 게시글에 연결된 PENDING/ACCEPTED 신청 상대팀에게 경기 취소 알림 (콘솔 로그 + TODO)
  - 해당 클럽의 게시글 soft delete 처리

---

## 데이터 모델 설계

### 신규 모델: MatchPost

```
id, clubId, createdBy, regionId,
matchDate (DateTime), startTime (String), endTime (String),   ← HH:mm 형식
location, address,
playerCount (Int — 5/6/7/8/9/10/11),
gender (MALE | FEMALE | MIXED),
level (ClubLevel),
fee (Int, 0 = 무료),
contactName, contactPhone,   ← 등록 시 직접 입력 (기본값: user.name, user.phone)
status (OPEN | MATCHED),   ← EXPIRED는 동적 계산
isDeleted (Boolean),
createdAt, updatedAt
```

**인덱스:**

```
@@index([matchDate])
@@index([regionId])
@@index([level])
@@index([gender])
@@index([fee])
@@index([clubId])
```

### 신규 모델: MatchApplication

```
id, postId, applicantClubId, applicantUserId,
message (String?, max 100자),
contactName (String),    ← 신청 시 입력 (기본값: user.name)
contactPhone (String),   ← 신청 시 입력 (기본값: user.phone, 수정 가능)
status (PENDING | ACCEPTED | REJECTED),
createdAt, updatedAt
unique(postId, applicantClubId)
```

### 신규 Enum

```
MatchPostStatus: OPEN, MATCHED
MatchApplicationStatus: PENDING, ACCEPTED, REJECTED
MatchGender: MALE, FEMALE, MIXED
```

### 기존 모델 변경

- `User`: `phone String?` 필드 추가 — 프로필 설정에서 수정 가능 (온보딩 제외)
- `Match` (경기 기록): 매칭 수락 시 양 팀에 `Match` 자동 생성
  - `matchPostId` 참조 필드 추가 권장 (연결 추적용)
  - `startAt` = `matchDate + startTime`, `endAt` = `matchDate + endTime`

---

## 확정 사항

| 항목             | 결정 내용                                                                            |
| ---------------- | ------------------------------------------------------------------------------------ |
| 탭 위치          | 경기 매칭 독립 탭 (용병 탭과 분리)                                                   |
| 탭 내부 구조     | 전체 매칭 / 내 게시글 / 내 신청 — 3개 탭                                             |
| 만료 처리        | `matchDate < now()` 동적 계산 — DB 상태 변경 없음                                    |
| 복수 신청        | 허용. 팀당 1회 제한. 수락 시 나머지 자동 거절 (트랜잭션)                             |
| 인원 수          | 5~11명 중 선택                                                                       |
| 구장비 단위      | 원(KRW) 정수, 0 = 무료                                                               |
| 경기 시간        | 시작 시간(`startTime`) + 종료 시간(`endTime`) 별도 입력 (HH:mm)                      |
| 게시글 수정/삭제 | 등록자(관리자)만 가능, 매칭 완료 후 수정 불가                                        |
| 매칭 성사        | 수락 버튼 플로우 → 양측 연락처 인앱 공유 + 양 팀 Match 자동 생성                     |
| Match 자동 생성  | `startAt = matchDate+startTime`, `endAt = matchDate+endTime`                         |
| 연락처 저장 위치 | 등록팀: `MatchPost.contactName/Phone` / 신청팀: `MatchApplication.contactName/Phone` |
| 연락처 기본값    | `user.name` / `user.phone` (수정 가능)                                               |
| 전화번호 가드    | 등록·신청 진입 시 `user.phone` 미설정이면 프로필 설정 유도 AlertDialog               |
| User.phone       | 프로필 설정에서 수정 가능 (온보딩 불포함)                                            |
| 알림             | 콘솔 로그 + TODO (알림 기능 구축 시점에 구현)                                        |
| Rate Limiting    | 연락처 조회 API에 IP당 일일 횟수 제한                                                |
| 지역 검색        | Region 모델 기반 필터 (전체 조회도 병존)                                             |
| 팀 해체 시       | 관련 게시글 soft delete + 상대팀 취소 알림 (TODO)                                    |
| 신청 메시지      | 최대 100자                                                                           |
