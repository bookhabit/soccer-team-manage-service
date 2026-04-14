# @verify — Test Verification Agent

테스트 대상: **$ARGUMENTS**

> 테스트 리포트를 읽고, 코드를 수정하고, 작업 기록을 남기고, 플랜 문서와의 불일치를 정리한다.

---

## Step 0. 파일 경로 확정

- **테스트 리포트**: `docs/test/$ARGUMENTS_test_report.md`
- **작업 로그**: `docs/test/$ARGUMENTS_test_report_log.md`
- 테스트 리포트 파일이 없으면 중단하고 경로를 안내한다.

---

## Step 1. 테스트 리포트 분석

`docs/test/$ARGUMENTS_test_report.md` 를 읽고 아래 항목으로 분류한다.

### 분류 기준

| 구분 | 설명 | 예시 |
|------|------|------|
| 🐛 **버그** | 기존 기능이 잘못 동작 | 서버 500, Zod 파싱 오류, 권한 비교 누락 |
| ✨ **기능 추가** | 미구현 기능, 새 API 필요 | 팀원 상세 조회 API 없음, refreshControl 없음 |
| 📐 **기획 변경** | 기존 플로우·정책이 바뀜 | 클럽명 중복 불가로 변경, 필수 쿼터 수 입력 |
| ⏳ **TODO** | 외부 의존·추후 처리 | Redis INCR, 카카오 API, stats 집계 |

리포트에 우선순위(P0/P1/P2/P3)가 없으면 직접 분류한다:
- **P0**: 서버 크래시, 데이터 손상, 인증 우회
- **P1**: 핵심 기능 동작 불가 (빈 화면, 404, 권한 오류)
- **P2**: 기능은 되지만 UX 불량 (동기화 누락, UI 불일치)
- **P3**: 외부 의존·성능·보안 추후 개선

---

## Step 2. 관련 도메인 식별

`$ARGUMENTS` 에서 관련 서버·클라이언트 feature 도메인을 추출한다.  
예: `club_match` → `club`, `match`, `post`(게시판이 club 하위일 경우)

각 도메인에 대해 아래 경로를 확인한다:
- `server/src/features/{domain}/`
- `client/src/features/{domain}/`
- `docs/plans/{domain}/` (plan.md, brief.md, cases.md)

---

## Step 3. 코드 수정 (P0 → P1 → P2 순)

### 수정 원칙

- **P0, P1** 은 반드시 이 세션에서 수정한다.
- **P2** 는 수정이 단순하면 함께 처리, 복잡하면 로그에 TODO로 기록한다.
- **P3 / TODO** 는 코드를 건드리지 않고 로그에만 기록한다.
- 수정 전 반드시 해당 파일을 Read로 읽는다.
- 기능 동작에 영향 없는 리팩터는 하지 않는다.
- 절대 금지 규칙 (CLAUDE.md) 을 준수한다.

### 서버 수정 시 체크

- [ ] Prisma 스키마 변경 → 마이그레이션 명령 안내 (직접 실행하지 않음)
- [ ] 새 에러코드 → `server/src/common/constants/error-codes.ts` 에 추가
- [ ] 새 엔드포인트 → Swagger 데코레이터(`@ApiOperation`, `@ApiResponse`) 추가

### 클라이언트 수정 시 체크

- [ ] 인라인 스타일 금지 — `spacing[]`, `colors.*` 사용
- [ ] `<Text>` 직접 사용 금지 — `<TextBox>` 사용
- [ ] 서버 응답 → Zod 스키마 파싱 후 사용
- [ ] 뮤테이션 성공 후 관련 쿼리 `invalidateQueries` 처리

---

## Step 4. 작업 로그 작성

모든 수정이 끝난 후 `docs/test/$ARGUMENTS_test_report_log.md` 를 생성한다.

### 로그 파일 구조

```markdown
# $ARGUMENTS 테스트 작업 로그

> 테스트 리포트: `docs/test/$ARGUMENTS_test_report.md`
> 작업 일자: {오늘 날짜}
> 테스트 범위: {어떤 기능을 테스트했는지 한 줄 요약}

---

## 테스트 개요

{테스트에서 확인한 기능 목록, 테스트 환경, 특이사항}

---

## 발견된 문제 목록

| # | 구분 | 우선순위 | 위치 | 내용 | 상태 |
|---|------|----------|------|------|------|
| 1 | 🐛 버그 | P0 | server/club.service.ts:52 | recalcMannerScoreAvg aggregate 오류 | ✅ 완료 |
| 2 | ✨ 기능 추가 | P1 | server/club | 팀원 상세 조회 API 미구현 | ✅ 완료 |
| 3 | 📐 기획 변경 | P1 | server/prisma | Club name 고유값으로 변경 | ✅ 완료 |
| 4 | ⏳ TODO | P3 | server/post | 조회수 Redis INCR 전환 | ⏳ 보류 |

---

## 수정 상세

### #1 — recalcMannerScoreAvg aggregate 오류 (P0 버그)

**문제**: `clubMember.aggregate()`에 `user.mannerScore` 중첩 전달 → PrismaClientValidationError  
**수정 파일**: `server/src/features/club/club.service.ts`  
**수정 내용**: 잘못된 aggregate() 블록 제거. $queryRaw 로직으로 단일화.  

---

## 미처리 항목 (TODO)

| # | 구분 | 내용 | 이유 |
|---|------|------|------|
| 1 | ⏳ P3 | 조회수 Redis INCR | Redis 인프라 미구성 |
| 2 | ⏳ P3 | 카카오 주소 API | 외부 키 필요 |

---

## 기획 변경 사항

{이번 테스트에서 기존 기획과 달라진 정책·플로우를 정리}

| 항목 | 기존 | 변경 |
|------|------|------|
| Club name | 중복 허용 | 중복 불가 (@unique) |
| 경기 기록 어시스트 | 선택 | 필수 |

---

## 플랜 문서 업데이트

{아래 Step 5 결과 반영}
```

---

## Step 5. 플랜 문서 불일치 검토 및 수정

각 관련 도메인의 `docs/plans/{domain}/` 폴더에서 `plan.md`, `brief.md`, `cases.md` 를 읽는다.

### 불일치 점검 항목

- [ ] **API 설계**: plan.md에 없는 엔드포인트가 실제로 구현됐는가? 반대로 plan에 있지만 미구현인가?
- [ ] **스키마**: brief/plan에 명시된 필드와 실제 Prisma 스키마가 다른가?
- [ ] **에러 코드**: plan에 정의된 에러코드가 실제 `error-codes.ts`와 다른가?
- [ ] **기획 정책 변경**: 이번 테스트로 결정된 정책 변경사항이 plan/brief에 반영됐는가?
- [ ] **TODO 항목**: plan의 체크리스트 중 이번에 완료된 항목이 있는가?

### 문서 수정 규칙

- `plan.md` — 구현 완료 체크리스트 업데이트, 변경된 API/스키마 반영
- `brief.md` — 기획 정책이 변경된 경우에만 수정 (기획 결정 사항 반영)
- `cases.md` — 이번 테스트에서 새로 발견된 케이스 추가

> 불일치 항목이 없으면 "✅ 플랜 문서 최신 상태"로 표시한다.

---

## Step 6. 완료 보고

아래 형식으로 요약 출력한다:

```
## ✅ verify 완료 — $ARGUMENTS

### 처리 결과
- 수정 완료: N건 (P0: N, P1: N, P2: N)
- 보류(TODO): N건
- 플랜 문서 업데이트: {도메인명} plan.md / brief.md / cases.md

### 마이그레이션 필요
- [ ] {마이그레이션이 필요한 경우 명시, 없으면 생략}

### 다음 작업 제안
- {P2 중 처리 못한 것, 다음 테스트 전 확인해야 할 것}
```
