# FC Flow — 구현 백로그

> 최종 업데이트: 2026-04-17  
> 기능 구현 완료 후 남은 P3 작업 및 보류 항목 우선순위 정리

---

## 구현 순서 가이드

```
외부 의존 없는 것 먼저 → 인프라 필요한 것 → 외부 API 키 필요한 것
```

---

## 1순위 — 외부 의존 없음, 즉시 시작 가능

### 팀원 stats 실집계

| 항목 | 내용 |
|------|------|
| 출처 | club_match_test_report_log.md #17 |
| 현재 | `goals / assists / momCount / matchCount` 하드코딩 0 반환 |
| 목표 | Match 도메인 데이터 기반 실집계 쿼리로 전환 |
| 영향 | `server/src/features/club/club.service.ts` — `getMemberDetail()` stats 블록 |
| 방법 | `Goal`, `MomVote`, `MatchParticipant` 테이블 JOIN 집계 |

### 초대 코드 보안 강화

| 항목 | 내용 |
|------|------|
| 출처 | club_match_test_report_log.md #16 |
| 현재 | 유효기간만 체크, 재사용 방지·무차별 대입 방어 없음 |
| 목표 | `/security` 에이전트로 점검 후 보완 |
| 검토 항목 | 코드 엔트로피(6자리 → 충분한가), 일일 시도 횟수 제한(Throttler), 사용 후 만료 처리 |

### 매칭 탭 전환 스켈레톤 반복 제거

| 항목 | 내용 |
|------|------|
| 출처 | matching_test_report.md #1 |
| 현재 | 탭 전환 시 매번 스켈레톤 노출 |
| 목표 | 탭 전환 시 이전 데이터 유지하며 background refetch |
| 방법 | `useMatchPosts`, `useMyMatchPosts` 등 쿼리에 `placeholderData: keepPreviousData` 추가 |
| 영향 | `client/src/features/matching/data/hooks/useMatchPosts.ts` |

---

## 2순위 — 인프라 구성 필요 (묶음 처리 권장)

### 파일 업로드 + 이미지 처리 + 기본 아바타

> 세 항목은 함께 기획·구현한다.

| 항목 | 내용 |
|------|------|
| 출처 | club_match_test_report_log.md #19 + 사용자 요청 |
| 현재 | 클럽 로고·프로필 이미지 URL 필드만 있고 업로드 불가, 기본 아바타 없음 |
| 목표 | 이미지 선택 → 업로드 → URL 저장 + 미설정 시 기본 아바타 자동 표시 |
| 인프라 | S3 (또는 Cloudflare R2) + presigned URL 방식 권장 |
| 구현 범위 | presigned URL 발급 API, 클라이언트 업로드 플로우, 리사이징(Sharp 또는 Lambda), 기본 아바타 fallback |

### Redis 조회수 INCR

| 항목 | 내용 |
|------|------|
| 출처 | club_match_test_report_log.md #18 |
| 현재 | 게시글 조회 시 매번 DB UPDATE — 동시 접속 많을 시 성능 저하 |
| 목표 | Redis INCR → 주기적 DB 반영 |
| 인프라 | Redis (또는 Upstash) |
| 우선 적용 | `PostController.findOne()` |

### Push 알림

| 항목 | 내용 |
|------|------|
| 출처 | matching_test_report.md 보류 #2 |
| 현재 | 매칭 취소·수락 시 상대팀 알림 없음 |
| 목표 | FCM(Firebase Cloud Messaging) 기반 Push 알림 |
| 인프라 | Firebase 프로젝트 + FCM 키 + `Notification` 테이블 추가 |
| 우선 발송 이벤트 | 매칭 신청 수락, 매칭 취소, 경기 투표 마감 임박 |

---

## 3순위 — 외부 API 키 필요

### 카카오 주소 검색 API + 지오코딩

| 항목 | 내용 |
|------|------|
| 출처 | matching_test_report.md #4, club_match_test_report_log.md #20 |
| 현재 | 장소 입력 시 텍스트 + RegionPicker 수동 선택 |
| 목표 | 카카오 주소 검색 → `address`, `regionId`, 위도/경도 자동 채움 |
| 필요 | 카카오 개발자 센터 JavaScript 키 |
| 영향 | `MatchCreateView`, 매칭 등록 DTO (`regionId` optional 처리) |
| 현재 workaround | RegionPicker 유지 중 — API 키 발급 후 교체 |

---

## 보류 (별도 기획 필요)

| 항목 | 내용 | 이유 |
|------|------|------|
| 포지션 배정 쿼터별 조회 전용 모드 | 관리자 아닌 멤버의 읽기 전용 라인업 뷰 | UI 플로우 기획 필요 |
| KeyboardAvoidingView 기기별 대응 | BottomCTA + Input 높이 불일치 | 기기별 실측 필요 |

---

## 완료 기준 체크리스트

- [x] 팀원 stats 실집계
- [ ] 초대 코드 보안 강화
- [x] 매칭 탭 스켈레톤 반복 제거
- [ ] 파일 업로드 (클럽 로고)
- [ ] 파일 업로드 (프로필 이미지)
- [ ] 이미지 리사이징
- [ ] 기본 아바타 fallback
- [ ] Redis 조회수 INCR
- [ ] Push 알림
- [ ] 카카오 주소 검색 API
