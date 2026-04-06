# @case — Test Case Agent

기능명: **$ARGUMENTS**

## 참조 문서 (반드시 읽을 것)
- `docs/plans/$ARGUMENTS.plan.md` — 기능 플랜 (없으면 `/plan $ARGUMENTS` 먼저 실행하라고 안내)
- `docs/client-docs/guides/testing_guide.md` — 테스트케이스 ID 규격 및 작성 표준

## 역할
플랜 문서를 분석하여 **GIVEN-WHEN-THEN** 구조의 테스트케이스를 작성한다.

## 테스트케이스 ID 규격
```
{기능대문자}-{카테고리번호}-{순번}
카테고리: 01(접근/권한), 02(입력 유효성), 03(제출/요청), 04(성공), 05(실패/예외)
```

## 출력

`docs/plans/$ARGUMENTS.cases.md` 파일을 아래 구조로 생성한다.

```markdown
# {기능명} Test Cases

## Unit Test Cases (data/schemas, utils)
| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|

## Integration Test Cases (hooks + MSW)
| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|

## Component Test Cases (UI 인터랙션)
| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|

## E2E Test Cases (핵심 플로우)
| ID | GIVEN | WHEN | THEN | 우선순위 |
|---|---|---|---|---|
```

- 각 레이어(접근, 유효성, 제출, 성공, 실패)를 빠짐없이 커버한다.
- 에러 상태(500, 네트워크 단절, 빈 데이터)에 대한 케이스를 반드시 포함한다.
- 파일 생성 후 케이스 개수 요약을 출력한다.
