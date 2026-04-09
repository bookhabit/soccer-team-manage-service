# 디자인 시스템 및 UI 코드 규칙

> **TODO**
>
> - [ ] 디자인 시스템 구현
> - [ ] 디자인 시스템 구현 후 개발용 디자인 시스템 페이지 구현
> - [ ] 다시 문서 정리

---

> **위치**: `src/shared/ui/`
>
> **원칙**: 모든 개별 앱은 직접적인 스타일링을 지양하고 공통 UI 컴포넌트를 사용한다.

---

## 1. Foundation (Design Tokens)

React Native의 `StyleSheet`에서 바로 사용할 수 있도록 객체 형태로 제공합니다.

### Colors (FC Flow Brand)

축구장과 에너지를 상징하는 컬러 스케일을 사용합니다.

- **Primary (Grass Green)**: `colors.green500` (#28a745) - 메인 액션
- **Secondary (Deep Blue)**: `colors.blue600` (#0056b3) - 보조 정보
- **Grey Scale**: `grey100`(배경), `grey400`(플레이스홀더), `grey900`(기본 텍스트)
- **Semantic**: `colors.error`(삭제/경고), `colors.success`(완료), `colors.white`(카드/텍스트)

### Typography

네이티브의 `lineHeight`와 `letterSpacing`이 포함된 객체입니다.

| **토큰**    | **Size** | **Weight**    | **용도**                  |
| ----------- | -------- | ------------- | ------------------------- |
| `H1`        | 24px     | 700 (Bold)    | 스크린 타이틀, 큰 강조    |
| `H2`        | 20px     | 700 (Bold)    | 섹션 타이틀, 카드 제목    |
| `Body1`     | 16px     | 400 (Regular) | 기본 본문 텍스트          |
| `Body1Bold` | 16px     | 600 (Semi)    | 강조 본문, 리스트 제목    |
| `Caption`   | 12px     | 400 (Regular) | 폼 에러 메시지, 부가 설명 |

> ⚠️ **RN 주의사항**: 웹과 달리 `typography` 객체는 `Text` 컴포넌트의 `style` 속성에 **스프레드 연산자**로 직접 주입합니다.
>
> `<Text style={{ ...typography.H1, color: colors.grey900 }}>팀 목록</Text>`

---

## 2. Layout 컴포넌트 (Native Core)

### AppScreen (Layout Base)

안전 영역(Safe Area)과 스크롤 뷰를 포함한 기본 레이아웃입니다.

- **Header**: 타이틀, 뒤로가기, 우측 액션 버튼 지원
- **Scrollable**: 내용이 길어질 경우 자동 스크롤 여부 설정

### Stack / Row (Flex)

`Flex` 대신 더 직관적인 `Stack`(수직)과 `Row`(수평) 컴포넌트를 사용합니다.

```tsx
<Stack gap={4} padding={16}>
  <Row justify="space-between" align="center">
    <Text>참석 인원</Text>
    <Badge label="12명" />
  </Row>
</Stack>
```

### Gap (Spacing)

네이티브는 `marginCollapse`가 없으므로 전용 간격 컴포넌트를 권장합니다.

- `<Gap size={16} />` (수직)
- `<Gap size={8} horizontal />` (수평)

---

## 3. General 컴포넌트

### FlowButton

네이티브의 `Pressable`을 활용하여 터치 피드백이 포함된 버튼입니다.

- **Variant**: `solid`(기본), `outline`(보조), `ghost`(텍스트만), `danger`(삭제)
- **Size**: `lg`(56px - 하단 고정), `md`(48px - 일반), `sm`(36px - 인라인)

### FlowInput

`react-hook-form`과 연동되며 라벨과 에러 메시지를 포함합니다.

```tsx
<FlowInput
  label="팀 이름"
  placeholder="팀명을 입력하세요"
  error={errors.teamName?.message}
  {...register("teamName")}
/>
```

---

## 4. Feedback 컴포넌트

### GlobalOverlay (Toast/Modal)

- **Toast**: `success`, `error` 알림 (애니메이션 포함)
- **BottomSheet**: 네이티브 특유의 하단 슬라이드 메뉴 (포지션 선택 등)
- **Skeleton**: 로딩 시 보여줄 스켈레톤 UI (선수 카드, 경기 목록용)

---

## 5. Icons

`react-native-svg` 기반의 아이콘 시스템입니다.

- **주요 아이콘**: `SoccerBall`, `Calendar`, `MapPin`, `User`, `Users`, `Bell`, `Settings`
- **동작 아이콘**: `ArrowLeft`, `ChevronRight`, `Plus`, `X`, `Check`

---

## 6. 사용 및 코드 작성 규칙 (UI Standard)

### ✅ 권장 사항 (Best Practices)

1. **컴포넌트 우선**: `View`나 `Text`를 직접 쓰고 인라인 스타일을 입히는 대신 `@fc-flow/ui`의 컴포넌트를 먼저 찾습니다.
2. **간격 일관성**: 모든 여백은 `Gap` 컴포넌트나 미리 정의된 `spacing` 토큰(4의 배수)을 사용합니다.
3. **폼 통합**: 모든 입력 필드는 `FlowInput`을 사용하여 에러 메시지 노출 방식을 통일합니다.

### ❌ 금지 사항 (Anti-Patterns)

1. **하드코딩된 수치**: `fontSize: 17` 같은 임의의 수치 사용을 금지하고 `typography` 토큰을 사용합니다.
2. **직접적인 색상 지정**: `color: '#ff0000'` 대신 `colors.error`를 사용합니다.
3. **플랫폼 분기 로직 남발**: 컴포넌트 내부에서 `Platform.OS === 'ios'` 분기를 직접 치지 말고, 필요한 경우 UI 라이브러리 수준에서 흡수합니다.
