# @test — Test Code Agent

기능명: **$ARGUMENTS**

## 참조 문서 (반드시 읽을 것)
- `docs/plans/$ARGUMENTS.cases.md` — 테스트케이스 ID 및 시나리오
- `docs/client-docs/guides/testing_guide.md` — 도구 스택, 패턴, 품질 체크리스트

## 역할
`cases.md`의 테스트케이스를 실제 테스트 코드로 변환한다.

---

## 테스트 파일 위치
```
client/src/features/$ARGUMENTS/
├── data/schemas/__tests__/$ARGUMENTS.schema.test.ts   (Unit)
├── data/hooks/__tests__/$ARGUMENTS.hooks.test.ts      (Integration + MSW)
└── ui/__tests__/$ARGUMENTS.component.test.tsx         (Component)
```

---

## 계층별 작성 규칙

### Unit Test (Vitest) — Schema / 유틸 함수
- `describe` → `it` 구조
- 경계값, 유효·무효 입력 모두 커버
- 커버리지 목표: **90% 이상**

### Integration Test (Vitest + MSW) — Hooks
```tsx
// MSW 핸들러로 API 인터셉트
server.use(http.post('/api/$ARGUMENTS', () => HttpResponse.json({...})));
```
- 성공 응답, 에러 응답(4xx, 5xx), 네트워크 단절 케이스 포함

### Component Test (React Native Testing Library)
```tsx
render(<$ARGUMENTSContainer />);
fireEvent.press(screen.getByText('...'));
expect(screen.getByTestId('...')).toBeTruthy();
```
- 스냅샷 비교 대신 **사용자 인터랙션 위주** 검증
- 로딩 상태, 에러 상태, 빈 데이터 상태 렌더링 검증 필수

---

## 품질 체크리스트
- [ ] cases.md의 모든 케이스가 테스트 코드로 매핑되었는가?
- [ ] 에러 상태(500, 네트워크 단절)에 대한 Fallback UI 테스트가 포함되었는가?
- [ ] 단순 스냅샷이 아닌 인터랙션 위주로 작성되었는가?
- [ ] Unit 커버리지가 충분한가?

테스트 파일 생성 후 케이스 ID ↔ 테스트 함수 매핑 표를 출력한다.
