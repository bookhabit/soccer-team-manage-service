# 테스트 케이스 및 테스트 코드 규칙

이 문서는 **FC Flow** 프로젝트의 소프트웨어 품질을 보장하기 위한 테스트 전략, 도구 스택 및 테스트 케이스 작성 표준을 정의합니다.

---

## 1️⃣ 테스트 전략 및 도구 스택

서비스의 안정성을 위해 피라미드 테스트 전략을 채택하며, 각 계층에 적합한 도구를 사용합니다.

### ✅ 테스트 계층 모델

| **계층** | **대상** | **도구 스택** |
| --- | --- | --- |
| **Unit Test** | 순수 함수, 데이터 변환 유틸, 계산 로직 | **Vitest** |
| **Integration** | React Query + API 연동 로직 (MSW 활용) | **Vitest**, **MSW** |
| **Component** | 사용자 인터랙션 및 UI 렌더링 | **React Native Testing Library** |
| **E2E Test** | 핵심 사용자 플로우 (로그인 ~ 경기 기록) | **Detox** (Native 환경 추천) |

---

## 2️⃣ 테스트케이스 ID 규격

모든 테스트케이스는 추적 가능성을 위해 아래와 같은 ID 규칙을 따릅니다.

```tsx
{기능}-{카테고리}-{번호}

- 기능 예시: AUTH(인증), TEAM(팀), MATCH(경기), USER(사용자)
- 카테고리: 01(접근), 02(입력 유효성), 03(제출), 04(성공), 05(실패)
```

---

## 3️⃣ 주요 테스트 케이스 예시 (핵심 플로우)

### [AUTH] 로그인 및 인증

- **AUTH-02-001**: 이메일 형식에 맞지 않는 값 입력 시 오류 메시지 표시
- **AUTH-03-003**: 로그인 요청 진행 중 버튼 중복 클릭 시 중복 요청 방지
- **AUTH-04-001**: 로그인 성공 시 메인 대시보드로 이동

### [TEAM] 팀 관리 (CRUD)

- **TEAM-01-001**: 이미 팀에 소속된 사용자의 팀 생성 접근 차단
- **TEAM-01-002**: 중복된 팀 이름 입력 시 인라인 오류 메시지 표시
- **TEAM-03-001**: 팀장이 가입 신청 목록에서 '수락' 클릭 시 팀원 목록 자동 추가

---

## 4️⃣ 테스트 코드 작성 패턴

### 🧪 Unit Test (유틸리티 함수)

비즈니스 로직 유틸리티는 **90% 이상의 커버리지**를 목표로 합니다.

```tsx
import { describe, it, expect } from 'vitest';
import { validateTeamName } from './team.utils';

describe('validateTeamName', () => {
  it('중복된 팀 이름이거나 특수문자가 포함되면 false를 반환한다', () => {
    expect(validateTeamName('기존팀명')).toBe(false);
    expect(validateTeamName('팀명@#!')).toBe(false);
  });
});
```

### 🧪 Component Test (MSW 연동)

실제 API를 호출하는 대신 MSW로 인터셉트하여 UI 인터랙션을 검증합니다.

```tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';

it('팀 가입 버튼 클릭 시 로딩 상태가 표시된다', async () => {
  server.use(
    http.post('/api/teams/:id/join', () => HttpResponse.json({ success: true }))
  );

  render(<TeamDetailScreen />);
  fireEvent.press(screen.getByText('가입 신청'));
  
  expect(screen.getByTestId('loading-spinner')).toBeTruthy();
});
```

---

## 5️⃣ 품질 체크리스트 (PR 제출 전)

- [ ]  **핵심 사용자 플로우**에 대한 E2E 테스트가 존재하는가?
- [ ]  유효성 검사 등 **비즈니스 로직**의 유닛 테스트 커버리지가 충분한가?
- [ ]  **에러 상태(500, 네트워크 단절)**에 대한 Fallback UI 테스트가 포함되었는가?
- [ ]  테스트 코드가 단순한 스냅샷 비교가 아닌 **사용자 인터랙션** 위주로 작성되었는가?
