# @feature — Full-Stack Feature Agent

기능명: **$ARGUMENTS**

`$ARGUMENTS` 기능을 처음부터 끝까지 **순서대로** 완성한다.
각 단계가 완료된 후 다음 단계로 진행한다.

> **사전 조건**: `docs/plans/$ARGUMENTS/$ARGUMENTS.brief.md` 가 존재해야 한다.  
> 없으면 "brief.md를 먼저 작성하세요" 안내 후 중단.

---

## 실행 순서

### Step 1 — @review (기획안 검토)

`docs/plans/$ARGUMENTS/$ARGUMENTS.brief.md` 를 읽고 기획안의 완성도를 검토한다.

검토 항목:
- 비즈니스 로직 완결성 (누락된 케이스)
- 엣지케이스 누락 (중복 요청, 동시성, 만료/취소, 빈 상태)
- UI/UX 요구사항 충돌
- 데이터 모델 영향도 (`server/prisma/schema.prisma` 참조)
- 보안·성능 검토
- 확인 필요한 질문 목록

READY 판정 시 Step 2로 진행. NEEDS REVISION 판정 시 중단하고 보완 사항 안내.

---

### Step 2 — @plan (구현 설계)

아래 문서를 읽고 `docs/plans/$ARGUMENTS/$ARGUMENTS.plan.md` 를 생성(덮어쓰기)한다.

참조 문서:
- `docs/client-docs/conventions/api.md`
- `docs/client-docs/conventions/code.md`
- `docs/server-docs/architecture/server_architecture.md`
- `docs/server-docs/conventions/api_standard.md`
- `docs/server-docs/conventions/error_handling_filter.md`

플랜 포함 내용:
- 기능 개요 및 사용자 시나리오 (GIVEN-WHEN-THEN)
- 클라이언트 라우트 목록
- API 설계 (Method, Endpoint, Auth)
- Data Layer 설계 (Schemas, Services, Hooks)
- UI Layer 설계 (Container, View, Components)
- 서버 Layer 설계 (Prisma 스키마, DTO, Service, Controller)
- 예외 처리 및 에러 코드
- 구현 체크리스트

---

### Step 3 — @case (테스트케이스 정의)

`docs/plans/$ARGUMENTS/$ARGUMENTS.plan.md` 와 `docs/client-docs/guides/testing_guide.md` 를 읽고  
`docs/plans/$ARGUMENTS/$ARGUMENTS.cases.md` 를 생성한다.

테스트케이스 포함 내용:
- Unit / Integration / Component / E2E 계층별 케이스
- ID 형식: `{기능대문자}-{카테고리번호}-{순번}`
- 카테고리: 01(접근/권한), 02(입력 유효성), 03(제출/요청), 04(성공), 05(실패/예외)
- 에러 상태(500, 네트워크 끊김, 빈 데이터) 케이스 필수 포함
- 경계값 및 엣지케이스 포함

> 테스트 코드는 작성하지 않는다. 개발자가 직접 수동 테스트하는 기준으로 사용.

---

### Step 4 — @logic (Data Layer + Server)

`docs/plans/$ARGUMENTS/$ARGUMENTS.plan.md` 를 기반으로 구현한다.

클라이언트 스캐폴딩:
```bash
cd client && npm run feature $ARGUMENTS
```

구현 대상:
- `data/schemas/` — Zod 스키마 및 타입
- `data/services/` — 순수 API 호출 함수 (React/Hook 사용 금지)
- `data/hooks/` — useQuery / useMutation / 쿼리키 상수

서버 스캐폴딩:
```bash
cd server
nest g module features/$ARGUMENTS
nest g service features/$ARGUMENTS
nest g controller features/$ARGUMENTS
```

구현 대상:
- Prisma 스키마 변경 + `npx prisma migrate dev`
- DTO (class-validator + class-transformer)
- Service (Prisma 쿼리, 비즈니스 로직)
- Controller (AuthGuard, RolesGuard, Swagger)
- 커스텀 예외 클래스 (DomainException)

참조: `docs/client-docs/conventions/code.md`, `docs/server-docs/conventions/database_prisma.md`

---

### Step 5 — @ui (UI Layer)

`docs/04_screen_design.md`, `docs/client-docs/conventions/code.md` 를 읽고 UI를 조립한다.

구현 대상:
- `ui/components/` — 도메인 전용 소형 컴포넌트
- `ui/view/` — 4-state(로딩/에러/빈/정상) 레이아웃, Empty 컴포넌트
- `ui/container/` — hooks 연결, AsyncBoundary + EmptyBoundary
- `app/(app)/$ARGUMENTS/` — expo-router 라우트 파일

디자인 규칙:
- `<Text>` 금지 → `<TextBox variant="...">` 사용
- 인라인 스타일 금지 → `spacing[*]`, `colors.*` 토큰 사용
- `import from '../../ui'` 금지 → `import { ... } from '@ui'`
- `<Image>` 금지 → `<DfImage>` / `<ThumbnailImage>` / `<AvatarImage>`

---

### Step 6 — @refactor (코드 품질 점검)

`docs/client-docs/conventions/code.md`, `docs/server-docs/conventions/api_standard.md` 기준으로 코드 품질을 점검한다.

점검 항목:
- 레이어 책임 위반 (Service에 Hook, View에 상태 로직 등)
- 설명용 변수 부재 (인라인 삼항 중첩)
- 매직 넘버·하드코딩
- SRP 위반 (함수가 두 가지 이상의 일)
- Early Return 미적용
- 타입 안전성 (any 사용, Zod 파싱 누락)
- JSDoc 누락

**ERD 동기화**: `server/prisma/schema.prisma` 변경이 있으면 `docs/erd.md` 를 재생성한다.  
(Mermaid erDiagram 형식, PK/FK/UK 표시, Enum 표, 모델 요약 표 포함)

---

### Step 7 — @performance (성능 최적화)

`docs/client-docs/guides/performance_guide.md` 기준으로 성능 문제를 점검한다.

점검 항목:
- 불필요한 리렌더링 (useCallback, useMemo 누락)
- 리스트 가상화 (FlatList keyExtractor, getItemLayout)
- Query 캐싱 전략 (staleTime, gcTime)
- 이미지 최적화 (DfImage lazy loading)

---

### Step 8 — @security (보안 점검)

`docs/client-docs/security/security.md`, `docs/server-docs/security/` 기준으로 보안 취약점을 점검한다.

점검 항목:
- XSS (사용자 입력 직접 렌더링)
- 민감정보 노출 (연락처, 토큰 로그 출력)
- 토큰 관리 (액세스토큰 메모리 보관 여부)
- DTO 검증 누락 (whitelist, forbidNonWhitelisted)
- SQL Injection (Prisma 파라미터 바인딩 여부)
- Guard 누락 (@UseGuards(AuthGuard) 전 엔드포인트)
- Rate Limiting (연락처 조회 등 민감 API)

---

### Step 9 — @seed (테스트 데이터 생성)

`docs/plans/$ARGUMENTS/$ARGUMENTS.plan.md` 와 `server/prisma/schema.prisma` 를 읽고  
개발 환경에서 기능을 수동 테스트할 수 있는 시드 데이터를 생성한다.

생성 대상:
- 각 상태(정상, 예외, 빈 데이터)를 커버하는 대표 시나리오 데이터
- `server/prisma/seed/` 또는 별도 seed 스크립트

---

## 완료 후 출력

```
✅ $ARGUMENTS 기능 구현 완료

📄 산출물 (docs/plans/$ARGUMENTS/)
  - $ARGUMENTS.brief.md  (기획안 — 개발자 작성)
  - $ARGUMENTS.plan.md   (구현 설계)
  - $ARGUMENTS.cases.md  (테스트 케이스)

📁 클라이언트 (client/src/features/$ARGUMENTS/)
  - data/schemas/, data/services/, data/hooks/
  - ui/components/, ui/view/, ui/container/
  - app/(app)/$ARGUMENTS/ (라우트)

📁 서버 (server/src/features/$ARGUMENTS/)
  - dto/, module, service, controller

🔍 점검 결과
  - Refactor: {수정 건수}건
  - Performance: {수정 건수}건
  - Security: {수정 건수}건

📊 ERD
  - docs/erd.md {동기화됨 | 변경 없음}

📋 다음 단계
  - /verify $ARGUMENTS → docs/plans/$ARGUMENTS/$ARGUMENTS.cases.md 기반 수동 테스트
```
