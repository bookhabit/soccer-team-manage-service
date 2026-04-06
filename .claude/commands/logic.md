# @logic — Logic Agent (Data Layer + Server)

기능명: **$ARGUMENTS**

## 참조 문서 (반드시 읽을 것)
- `docs/plans/$ARGUMENTS.plan.md` — 구현 명세
- `docs/plans/$ARGUMENTS.cases.md` — 테스트케이스 (구현 기준)
- `docs/client-docs/conventions/api.md` — API 레이어 구조 및 4-state 처리
- `docs/client-docs/conventions/code.md` — 레이어 책임, 절대 금지 규칙
- `docs/server-docs/architecture/server_architecture.md` — NestJS 모듈 구조
- `docs/server-docs/conventions/api_standard.md` — 응답 envelope, HTTP 표준
- `docs/server-docs/conventions/database_prisma.md` — Prisma 쿼리 전략
- `docs/server-docs/conventions/error_handling_filter.md` — 에러 코드 및 예외 클래스

## 역할
플랜을 기반으로 **Data Layer(클라이언트)** 와 **Server Layer** 를 구현한다.

---

## Step 1. 클라이언트 스캐폴딩

```bash
cd client && npm run feature $ARGUMENTS
```

생성된 폴더 구조를 확인한다:
```
client/src/features/$ARGUMENTS/
├── ui/container/
├── ui/view/
├── ui/components/
└── data/hooks/
    data/schemas/
    data/services/
```

---

## Step 2. 클라이언트 Data Layer 구현 순서

### 1) Schemas (`data/schemas/$ARGUMENTS.schema.ts`)
- Zod로 API 응답 스키마 및 폼 입력 스키마 정의
- `z.infer<>` 로 타입 추출
- **모든 서버 응답은 Zod 파싱 필수**

### 2) Services (`data/services/$ARGUMENTS.service.ts`)
- 순수 TypeScript 함수 (React/Hook 사용 금지)
- `createApiClient()` 인스턴스 사용
- 반환 전 Zod 스키마로 응답 파싱

### 3) Hooks (`data/hooks/use$ARGUMENTS.ts`)
- `useQuery` / `useMutation` 래핑
- queryKey 배열 상단에 상수로 정의
- 로딩·에러·빈 데이터 상태를 hook에서 분리하여 반환

---

## Step 3. 서버 Layer 구현

```bash
cd server
nest g module features/$ARGUMENTS
nest g service features/$ARGUMENTS
nest g controller features/$ARGUMENTS
```

구현 순서:
1. **DTO** (`dto/create-$ARGUMENTS.dto.ts`, `dto/update-$ARGUMENTS.dto.ts`) — class-validator 데코레이터
2. **Service** — 비즈니스 로직, Prisma 쿼리 (N+1 방지, select 필드 최소화)
3. **Controller** — 라우트, Guard 적용, Swagger 데코레이터
4. **Exception** — 도메인 에러코드 기반 커스텀 예외

---

## 절대 금지 규칙
- 컴포넌트 내 직접 fetch 금지
- Service 내 Hook 사용 금지
- Zod 없는 서버 응답 사용 금지
- Prisma 날(raw) 쿼리에 사용자 입력 직접 삽입 금지

구현 완료 후 체크리스트를 출력한다.
