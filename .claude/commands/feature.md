# @feature — Full-Stack Feature Agent

기능명: **$ARGUMENTS**

`$ARGUMENTS` 기능을 처음부터 끝까지 **순서대로** 완성한다.
각 단계가 완료된 후 다음 단계로 진행한다.

---

## 실행 순서

### Step 1 — @plan
`docs/01_concept.md`, `docs/client-docs/conventions/api.md`, `docs/client-docs/conventions/code.md`, `docs/server-docs/architecture/server_architecture.md`, `docs/server-docs/conventions/api_standard.md`, `docs/server-docs/conventions/error_handling_filter.md` 를 읽고 `docs/plans/$ARGUMENTS.plan.md` 를 생성한다.

플랜 포함 내용:
- 기능 개요 및 사용자 시나리오 (GIVEN-WHEN-THEN)
- 클라이언트 라우트 목록
- API 설계 (Method, Endpoint, Auth)
- Data Layer 설계 (Schemas, Services, Hooks)
- UI Layer 설계 (Container, View, Components)
- 서버 Layer 설계 (DTO, Service, Controller)
- 예외 처리 목록

---

### Step 2 — @case
`docs/plans/$ARGUMENTS.plan.md` 와 `docs/client-docs/guides/testing_guide.md` 를 읽고 `docs/plans/$ARGUMENTS.cases.md` 를 생성한다.

테스트케이스 포함 내용:
- Unit / Integration / Component / E2E 계층별 케이스
- ID 형식: `{기능대문자}-{카테고리번호}-{순번}`
- 에러 상태(500, 네트워크 단절, 빈 데이터) 케이스 필수 포함

---

### Step 3 — @logic (Data Layer + Server)
`docs/plans/$ARGUMENTS.plan.md` 를 기반으로 구현한다.

클라이언트:
```bash
cd client && npm run feature $ARGUMENTS
```
- `data/schemas/` — Zod 스키마 및 타입
- `data/services/` — 순수 API 호출 함수
- `data/hooks/` — useQuery / useMutation

서버:
```bash
cd server
nest g module features/$ARGUMENTS
nest g service features/$ARGUMENTS
nest g controller features/$ARGUMENTS
```
- DTO (class-validator)
- Service (Prisma 쿼리)
- Controller (Guard, Swagger)
- 커스텀 예외 클래스

참조: `docs/client-docs/conventions/code.md`, `docs/server-docs/conventions/database_prisma.md`

---

### Step 4 — @ui (UI Layer)
`docs/04_screen_design.md`, `docs/client-docs/conventions/code.md` 를 읽고 UI를 조립한다.

- `ui/components/` — 도메인 전용 소형 컴포넌트
- `ui/view/` — 4-state(로딩/에러/빈/정상) 레이아웃
- `ui/container/` — hooks 연결, Suspense + ErrorBoundary

규칙: `<Text>` 대신 `<TextBox>`, `colors.*` 토큰, `@ui` 단일 임포트

---

### Step 5 — @test (Test Code)
`docs/plans/$ARGUMENTS.cases.md` 와 `docs/client-docs/guides/testing_guide.md` 를 읽고 테스트 코드를 작성한다.

- `data/schemas/__tests__/` — Unit (Vitest)
- `data/hooks/__tests__/` — Integration (Vitest + MSW)
- `ui/__tests__/` — Component (React Native Testing Library)

---

### Step 6 — @refactor
`docs/client-docs/conventions/code.md`, `docs/server-docs/conventions/api_standard.md` 기준으로 코드 품질을 점검한다.

점검: 레이어 책임 위반 / 설명용 변수 / 매직 넘버 / SRP / Early Return / 타입 안전성 / JSDoc

**ERD 동기화**: `server/prisma/schema.prisma` 와 `docs/erd.md` 를 비교하여 스키마 변경이 있으면 `docs/erd.md` 를 재생성한다. (Mermaid erDiagram 형식, PK/FK/UK 표시, Enum 표, 모델 요약 표 포함)

---

### Step 7 — @performance
`docs/client-docs/guides/performance_guide.md` 기준으로 성능 문제를 점검한다.

점검: 불필요한 리렌더링 / 리스트 가상화 / Query 캐싱 / 이미지 최적화

---

### Step 8 — @security
`docs/client-docs/security/security.md`, `docs/server-docs/security/` 기준으로 보안 취약점을 점검한다.

점검: XSS / 민감정보 노출 / 토큰 관리 / DTO 검증 / SQL Injection / Guard 누락 / Rate Limiting

---

## 완료 후 출력

```
✅ $ARGUMENTS 기능 구현 완료

📄 산출물
  - docs/plans/$ARGUMENTS.plan.md
  - docs/plans/$ARGUMENTS.cases.md

📁 클라이언트 (client/src/features/$ARGUMENTS/)
  - data/schemas/, data/services/, data/hooks/
  - ui/components/, ui/view/, ui/container/
  - 테스트 파일

📁 서버 (server/src/features/$ARGUMENTS/)
  - dto/, module, service, controller

🔍 점검 결과
  - Refactor: {수정 건수}건
  - Performance: {수정 건수}건
  - Security: {수정 건수}건

📊 ERD
  - docs/erd.md {동기화됨 | 변경 없음}
```
