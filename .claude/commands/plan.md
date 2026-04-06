# @plan — Architect Plan Agent

기능명: **$ARGUMENTS**

아래 문서들을 읽고 `$ARGUMENTS` 기능의 개발 계획을 작성한다.

## 참조 문서 (반드시 읽을 것)
- `docs/01_concept.md` — 서비스 개요 및 도메인
- `docs/client-docs/conventions/api.md` — API 레이어 구조
- `docs/client-docs/conventions/code.md` — 레이어 책임 및 디렉토리 구조
- `docs/server-docs/architecture/server_architecture.md` — NestJS 모듈 구조
- `docs/server-docs/conventions/api_standard.md` — REST API 표준
- `docs/server-docs/conventions/error_handling_filter.md` — 에러 코드 표준

## 출력

`docs/plans/$ARGUMENTS.plan.md` 파일을 아래 구조로 생성한다.

```markdown
# {기능명} Plan

## 1. 기능 개요
- 목적:
- 핵심 사용자 시나리오 (GIVEN-WHEN-THEN 형식):

## 2. 클라이언트 라우트
| 경로 | 설명 | 내비게이션 타입 |
|---|---|---|

## 3. API 설계
| Method | Endpoint | 설명 | Auth |
|---|---|---|---|

## 4. 데이터 레이어 설계 (client/src/features/{name}/data/)
### Schemas (Zod)
- 정의할 스키마 목록과 주요 필드

### Services
- 작성할 서비스 함수 목록

### Hooks
- useQuery / useMutation 목록

## 5. UI 레이어 설계 (client/src/features/{name}/ui/)
### Container
- 조립할 상태 및 핸들러

### View / Components
- 화면 목록 및 주요 UI 요소

## 6. 서버 레이어 설계 (server/src/features/{name}/)
### DTO
### Service 메서드
### Controller 엔드포인트

## 7. 예외 처리
- 에러 케이스 목록 (클라이언트 / 서버)

## 8. 구현 체크리스트
- [ ] ...
```

파일 생성 후 "플랜 완료: `docs/plans/$ARGUMENTS.plan.md`" 라고 요약한다.
