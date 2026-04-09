# @refactor — Refactor Agent

기능명: **$ARGUMENTS**

## 참조 문서 (반드시 읽을 것)

- `docs/client-docs/conventions/code.md` — SRP, 클린 코드, 절대 금지 규칙
- `docs/server-docs/conventions/api_standard.md` — 서버 코드 표준
- `docs/server-docs/conventions/error_handling_filter.md` — 에러 처리 표준
- `docs/client-docs/conventions/api.md` — API 연동 규칙 및 비동기 상태 핸들링

## 역할

`client/src/features/$ARGUMENTS/` 와 `server/src/features/$ARGUMENTS/` 를 읽고 **코드 품질** 관점에서 리팩터한다. 기능 동작은 변경하지 않는다.

---

## 점검 항목

### 1. 레이어 책임 분리 위반

- [ ] View에 상태·비즈니스 로직이 있는가?
- [ ] Service에 React Hook이 있는가?
- [ ] 컴포넌트에서 직접 fetch하는가?
- [ ] Zod 파싱 없이 서버 응답을 사용하는가?

### 2. 클린 코드

- [ ] 복잡한 조건식에 설명용 변수(Explaining Variable)가 없는가?
- [ ] 매직 넘버/문자열이 하드코딩되어 있는가?
- [ ] 함수가 2가지 이상의 일을 하는가? (SRP 위반)
- [ ] Early Return 대신 중첩 if가 있는가?

### 3. 타입 안전성

- [ ] `any` 타입이 사용되었는가?
- [ ] Zod 스키마와 타입이 불일치하는가?
- [ ] 불필요한 타입 단언(`as`)이 있는가?

### 4. 네이밍

- [ ] Boolean 변수에 `is/has/should` 접두사가 없는가?
- [ ] 의미 없는 변수명(`data`, `res`, `temp`)이 있는가?

### 5. 주석

- [ ] 공통 컴포넌트·주요 함수에 JSDoc이 없는가?

### 5. 비동기 상태 핸들링

- `docs/client-docs/conventions/api.md` — API 연동 규칙 및 비동기 상태 핸들링 참고

---

## 출력

각 항목별로 발견된 문제와 수정 내용을 나열한 후 코드를 수정한다.
수정이 없는 항목은 "✅ 이상 없음"으로 표시한다.
마지막에 ERD 동기화 여부를 한 줄로 요약한다.
