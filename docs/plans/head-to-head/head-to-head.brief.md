# 상대 전적 (Head-to-Head) 기획안

---

## 1. 목적

두 클럽 간 역대 맞대결 전적을 한눈에 비교한다.
매칭 경기 피드 상세 화면에서 "상대 전적 보기" 버튼을 통해 진입하며,
내 클럽과 상대 클럽 간 승/무/패 요약 + 최근 맞대결 이력을 제공한다.

---

## 2. 진입 조건

- **접근 제한**: 요청자가 `clubId`(내 클럽) 소속 멤버인 경우에만 접근 가능.
  - 서버에서 `ClubMember` 존재 여부 검증.
  - 피드에서 남의 경기를 보는 경우(비멤버)에는 "상대 전적 보기" 버튼 자체를 숨김.
- **버튼 노출 조건** (클라이언트):
  - `detail.clubId === myClub.id` (내 클럽 경기)
  - `detail.opponentClubId !== null` (LEAGUE 경기이고 matchPostId가 존재)
  - 두 조건 모두 충족 시에만 버튼 노출.

---

## 3. 화면 구성

### 3-1. 스코어 요약 (상단 고정)

```
┌─────────────────────────────────────────────┐
│  마무리FC  ←──────────── vs ────────────→  카동FC  │
│   (내 클럽 — 항상 좌측 고정)                  │
│                                               │
│    3승 · 1무 · 2패                            │
│   득점 11골 / 실점 9골                        │
└─────────────────────────────────────────────┘
```

- **내 클럽** (`clubId`) 항상 좌측 고정.
- 요약: 승/무/패 카운트, 총 득점/실점.

### 3-2. 맞대결 이력 목록 (무한 스크롤)

- 최근 경기부터 내림차순 (`recordedAt DESC`).
- 각 행: 경기 날짜 · 스코어 (`내득점 : 상대득점`) · 결과 (승/무/패 뱃지).
- 페이지 크기: 10건씩 cursor 기반 무한 스크롤.
- 빈 상태: "아직 맞붙은 적이 없습니다."

---

## 4. 스코어 방향 (HOST / GUEST 정규화)

Match 레코드는 **각 클럽이 직접 생성** (매칭 수락 시 자동 생성 없음).
`matchPostId`로 연결된 경우, 원 게시글(`MatchPost.clubId`)이 HOST.

| 내 클럽 역할 | 내 득점 필드  | 상대 득점 필드 |
| ------------ | ------------- | -------------- |
| HOST         | `homeScore`   | `awayScore`    |
| GUEST        | `awayScore`   | `homeScore`    |

- HOST 판단: `MatchPost.clubId === myClubId`
- GUEST 판단: `MatchApplication(ACCEPTED).applicantClubId === myClubId`
- 두 클럽의 Match 레코드 중 **내 클럽(`Match.clubId = myClubId`) 레코드만 기준**으로 집계.

---

## 5. `opponentClubId` 추가 (MatchFeedDetail)

기존 `MatchFeedDetailResponseDto`에 `opponentClubId: string | null` 필드 추가.

| 조건                                     | 값           |
| ---------------------------------------- | ------------ |
| `type = LEAGUE` AND `matchPostId` 존재   | 상대 clubId  |
| `type = SELF` OR `matchPostId` 없음      | `null`       |

**상대 clubId 도출 방법**:
- HOST인 경우: `MatchApplication(ACCEPTED, postId=matchPostId).applicantClubId`
- GUEST인 경우: `MatchPost(matchPostId).clubId`

클라이언트 Zod 스키마도 함께 업데이트 필요.

---

## 6. API 설계

```
GET /clubs/:clubId/head-to-head/:opponentClubId
  ?cursor=   (ISO 날짜 문자열, 다음 페이지 커서)
  ?limit=10  (기본 10)
```

- **Auth**: 필수 (JWT)
- **권한**: 요청자가 `clubId` 소속 ClubMember여야 함
- **응답**:

```json
{
  "summary": {
    "myClubId": "...",
    "opponentClubId": "...",
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
      "matchId": "...",
      "date": "2025-03-15T14:00:00Z",
      "myScore": 2,
      "opponentScore": 1,
      "result": "WIN"
    }
  ],
  "nextCursor": "2025-01-10T14:00:00Z",
  "hasNextPage": true
}
```

---

## 7. 라우트

| 경로                                                      | 설명                 | 진입 방식  |
| --------------------------------------------------------- | -------------------- | ---------- |
| `/(app)/club/[clubId]/head-to-head/[opponentClubId]`      | H2H 화면             | Stack push |

`MatchFeedDetailContainer`에서 `onGoOpponentRecord` 핸들러 구현:
```ts
onGoOpponentRecord={
  detail.clubId === myClub?.id && detail.opponentClubId
    ? () => router.push(`/(app)/club/${detail.clubId}/head-to-head/${detail.opponentClubId}`)
    : undefined
}
```

---

## 8. 데이터 모델 변경

### Match 인덱스 추가 (마이그레이션 필요)

```prisma
@@index([matchPostId])   // H2H 집계 JOIN 성능
@@index([clubId, isDeleted, isRecordSubmitted])  // H2H 필터링 성능
```

### MatchFeedDetailResponseDto 변경

- `opponentClubId: string | null` 필드 추가

---

## 9. 예외 처리

| 상황                                        | 서버 응답                | 클라이언트 처리        |
| ------------------------------------------- | ------------------------ | ---------------------- |
| 요청자가 clubId 비소속                      | 403 FORBIDDEN            | 에러 바운더리          |
| clubId 또는 opponentClubId 존재하지 않음    | 404 NOT_FOUND            | 에러 바운더리          |
| 맞대결 이력 0건                             | 200 (history: [])        | "아직 맞붙은 적이 없습니다." 빈 상태 UI |
| SELF 경기에서 잘못 진입 (opponentClubId=null) | 400 BAD_REQUEST        | 버튼 자체를 숨겨 진입 차단 |

---

## 10. UI 상태

| 상태     | 처리                                          |
| -------- | --------------------------------------------- |
| 로딩     | 요약 Skeleton + 이력 리스트 Skeleton          |
| 에러     | ErrorFallback (재시도 버튼 포함)              |
| 빈 데이터| "아직 맞붙은 적이 없습니다." 안내 텍스트     |
| 정상     | 스코어 요약 + 무한 스크롤 이력 목록           |

---

## 11. 성능 고려

- MOM 정보 미포함 (H2H에서는 불필요 → N+1 방지)
- `@@index([matchPostId])` 추가로 JOIN 성능 확보
- summary는 단일 집계 쿼리 (`_count`, `_sum`), history는 cursor 기반 페이지네이션
- Match 레코드 필터 조건: `clubId = myClubId AND isDeleted = false AND isRecordSubmitted = true`

---

## 12. 구현 체크리스트 (사전 의존)

- [ ] `MatchFeedDetailResponseDto`에 `opponentClubId: string | null` 추가
- [ ] 클라이언트 `matchFeedDetail` Zod 스키마에 `opponentClubId` 추가
- [ ] `MatchFeedDetailContainer`의 `onGoOpponentRecord` 핸들러 구현
- [ ] `Match` 모델에 `@@index([matchPostId])` 마이그레이션
