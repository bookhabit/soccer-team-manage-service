# 커밋 컨벤션

## 기본 형식

```
<type>(<scope>): <subject>

[body]

[footer]
```

## Type 목록

| Type       | 설명                                      | 예시                                                   |
| ---------- | ----------------------------------------- | ------------------------------------------------------ |
| `feat`     | 새로운 기능 추가                          | `feat(orderbook): 호가창 실시간 WebSocket 연결 구현`   |
| `fix`      | 버그 수정                                 | `fix(funnel): 뒤로가기 시 입력값 초기화되는 문제 수정` |
| `refactor` | 기능 변화 없는 코드 개선                  | `refactor(loan): 심사 로직을 커스텀 훅으로 분리`       |
| `style`    | 코드 포맷팅, 세미콜론 등 (로직 변경 없음) | `style: prettier 적용`                                 |
| `test`     | 테스트 코드 추가/수정                     | `test(orderbook): 호가 계산 유틸 단위 테스트 추가`     |
| `docs`     | 문서 작성/수정                            | `docs: 커밋 컨벤션 정리`                               |
| `chore`    | 빌드 설정, 패키지 설치 등                 | `chore: eslint 설정 추가`                              |
| `perf`     | 성능 개선                                 | `perf(orderbook): throttle 적용으로 리렌더 최소화`     |
| `ci`       | CI/CD 설정 변경                           | `ci: GitHub Actions 정적 분석 워크플로우 추가`         |
| `revert`   | 이전 커밋 되돌리기                        | `revert: feat(funnel): 계좌 개설 3단계 추가`           |

## Scope 목록

```
team          - 팀 관련 기능
match         - 경기 관련 기능
vote          - 경기 참석 투표 기능
record        - 경기 기록 기능
mercenary     - 용병 매칭 기능
auth          - 인증/인가
notification  - 알림
profile       - 사용자 프로필
ui            - 공통 디자인 시스템 (packages/ui)
shared        - 공통 타입/스키마 (packages/shared)
config        - 루트 설정 (tsconfig, eslint, prettier 등)
```

## 규칙

- **subject**: 명령형 현재형으로 작성 (`추가했다` ✕ → `추가` ✓)
- **subject 길이**: 72자 이내
- **body**: 무엇을(What)보다 왜(Why)를 설명
- **footer**: `BREAKING CHANGE:` 또는 이슈 참조 (`Closes #123`)

## 실제 예시

### feat - 새 기능

```
feat(match): 경기 생성 시 구장 위치 지도 선택 구현

구장 주소 직접 입력 대신 지도 API를 연동하여
핀을 찍는 방식으로 정확한 좌표 저장이 가능하도록 처리.
```

### refactor - 관심사 분리

```
refactor(vote): 경기 참석 투표 뷰와 상태 로직 분리

기존 VotePage에 뷰와 투표 상태가 혼재하여 확장성이 낮았음.
useVoteState 훅을 추출하고 3-state 전환 로직을 컴포넌트 외부로 이동.
```

### perf - 성능 최적화

```
perf(match): 경기 목록 FlashList 적용으로 리렌더 최소화

FlatList 사용 시 스크롤 도중 Blank 현상 발생.
FlashList + estimatedItemSize 적용 후 FPS 안정화 확인 (Flashlight 검증).
```

### fix - 버그 수정

```
fix(vote): 투표 후 새로고침 시 상태 초기화되는 문제 수정

Zustand store가 메모리에만 저장되어 앱 재진입 시 미투표 상태로 복귀.
persist 미들웨어로 교체하여 AsyncStorage에 상태 유지.

Closes #42
```

### chore - 설정

```
chore(config): ESLint flat config 및 Prettier 초기 설정

- ESLint 10 flat config 도입 (eslint.config.mjs)
- react-hooks, @typescript-eslint 규칙 적용
- Prettier 포맷 통일 (singleQuote, trailingComma: all)
```

## PR 전략

```
# 기능 단위로 브랜치 분리
feat/team-create
feat/match-vote
refactor/vote-hooks-separation
fix/mercenary-optimistic-update

# PR 제목 = 커밋 타입과 동일하게
feat(match): 경기 생성 및 경기 참석 투표 구현
```

## 나쁜 예시 (금지)

```bash
# ✕ 의미없는 커밋
git commit -m "수정"
git commit -m "fix bug"
git commit -m "wip"
git commit -m "asdf"

# ✕ 여러 관심사 혼합
git commit -m "feat: 경기 생성 구현 및 버그 수정 및 스타일 변경"
```
