# @ui — UI Agent

기능명: **$ARGUMENTS**

## 참조 문서 (반드시 읽을 것)
- `docs/plans/$ARGUMENTS.plan.md` — 화면 설계
- `docs/04_screen_design.md` — 디자인 시스템 가이드 (컴포넌트 API, 토큰 규칙)
- `docs/client-docs/conventions/code.md` — Container / View / Components 책임 정의
- `client/src/features/$ARGUMENTS/data/` — 구현된 hooks 확인 후 연결

## 역할
Data Layer 위에 **UI Layer** 를 조립한다.

---

## 절대 규칙
- `<Text>` 직접 사용 금지 → `<TextBox variant="...">` 사용
- 인라인 색상/폰트 하드코딩 금지 → `colors.*`, `spacing[n]` 토큰 사용
- `import { ... } from '@ui'` 단일 경로만 허용
- View에 상태·로직 금지 — props만 받아 렌더링

---

## 구현 순서

### 1) Components (`ui/components/`)
- 이 기능 전용 소형 UI 조각
- props 기반 순수 컴포넌트, 외부 상태 의존 없음

### 2) View (`ui/view/$ARGUMENTSView.tsx`)
- 전체 레이아웃 구성
- props로만 데이터 수신, 자체 상태 최소화
- 4-state 분기: 로딩(`<Skeleton>`), 에러(`ErrorFallback`), 빈 데이터, 정상

### 3) Container (`ui/container/$ARGUMENTSContainer.tsx`)
- `data/hooks/`에서 데이터 가져와 View에 주입
- 핸들러 함수 조립 (onPress, onSubmit 등)
- `<Suspense>` + `QueryErrorBoundary` 적용

---

## 컴포넌트 선택 가이드
| 상황 | 사용 컴포넌트 |
|---|---|
| 버튼 | `<Button variant="primary\|secondary\|ghost\|danger">` |
| 텍스트 입력 | `<TextField title="..." errorMessage={...}>` |
| 목록 행 | `<ListRow left={} title="" right={}>` |
| 이미지 | `<ThumbnailImage\|AvatarImage\|CoverImage source={}>` |
| 하단 CTA | `<BottomCTASingle\|BottomCTADouble safeArea>` |
| 모달 | `<Modal isOpen={} onClose={}>` |
| 드로어 | `<Drawer isOpen={} onClose={}>` |
| 다이얼로그 | `<AlertDialog\|ConfirmDialog destructive?>` |
| 로딩 | `<Skeleton width height borderRadius>` |
| 토스트 | `useToast() → toast.success\|error\|warning\|info` |
| 간격 | `<Spacing size={n}>` or `gap={n}` in `<Flex>` |

구현 완료 후 구현된 컴포넌트 트리를 요약한다.
