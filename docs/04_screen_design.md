# 04. 디자인 시스템 가이드

> **이 문서의 목적**
> - `client/src/shared/ui`에 구현된 디자인 시스템의 모든 토큰·컴포넌트 사용법을 기술한다.
> - 새 화면·컴포넌트 작성 시 이 문서를 최우선 기준으로 삼는다.
> - 라이브 미리보기: 앱 내 `/(dev)/design-system` 화면에서 모든 컴포넌트를 직접 확인할 수 있다.

---

## 목차

1. [임포트 규칙](#1-임포트-규칙)
2. [Foundation — Colors](#2-foundation--colors)
3. [Foundation — Typography](#3-foundation--typography)
4. [Foundation — Spacing](#4-foundation--spacing)
5. [General 컴포넌트](#5-general-컴포넌트)
   - TextBox / Button / TextField / TextArea / SplitTextField / Select / Checkbox / Switch / Input / ListRow / DfImage
6. [Layout 컴포넌트](#6-layout-컴포넌트)
   - Flex / Box / Grid / Spacing / SafeAreaWrapper / BottomCTA
7. [Feedback 컴포넌트](#7-feedback-컴포넌트)
   - Skeleton / Toast / Modal / Drawer / Dialog
8. [아이콘](#8-아이콘)
9. [핵심 규칙 요약](#9-핵심-규칙-요약)

---

## 1. 임포트 규칙

모든 디자인 시스템 토큰·컴포넌트는 `@ui` 앨리어스 하나에서 가져온다.

```ts
import {
  colors, typography, spacing,          // Foundation 토큰
  TextBox, Button, TextField,           // General
  Flex, Box, Spacing,                   // Layout
  Skeleton, Modal, useToast,            // Feedback
  HomeIcon, ProfileIcon,               // Icons
} from '@ui';
```

> **절대 금지**: React Native의 `<Text>`를 화면/컴포넌트에서 직접 사용하지 않는다. 반드시 `<TextBox>`를 사용한다.

---

## 2. Foundation — Colors

### 색상 토큰

```ts
import { colors } from '@ui';
```

#### Semantic (의미 기반 — 우선 사용)

| 토큰 | 값 | 용도 |
|---|---|---|
| `colors.primary` | `#3182f6` | 주요 액션, 링크 |
| `colors.success` | `#03b26c` | 성공, 완료 |
| `colors.warning` | `#fe9800` | 경고 |
| `colors.error` | `#f04452` | 오류, 삭제 |
| `colors.background` | `#ffffff` | 카드·모달 배경 |
| `colors.greyBackground` | `#f2f4f6` | 앱 기본 배경 |

#### Grey Scale

| 토큰 | 값 | 주요 용도 |
|---|---|---|
| `colors.grey50` | `#f9fafb` | 섹션 헤더 배경 |
| `colors.grey100` | `#f2f4f6` | 구분선, 비활성 배경 |
| `colors.grey200` | `#e5e8eb` | 테두리, 스켈레톤 |
| `colors.grey300` | `#d1d6db` | 비활성 아이콘 |
| `colors.grey400` | `#b0b8c1` | 플레이스홀더 |
| `colors.grey500` | `#8b95a1` | 보조 텍스트 |
| `colors.grey600` | `#6b7684` | 설명 텍스트 |
| `colors.grey700` | `#4e5968` | 라벨 텍스트 |
| `colors.grey800` | `#333d4b` | 일반 텍스트 |
| `colors.grey900` | `#191f28` | 제목, 강조 텍스트 |

#### 기타 팔레트 (blue, red, orange, yellow, green, teal, purple)

각 색상은 50~900 스케일로 제공된다. 예: `colors.blue500`, `colors.green300`.

#### 사용 예

```tsx
// ✅ semantic 토큰 우선
<TextBox color={colors.error}>에러 메시지</TextBox>
<View style={{ backgroundColor: colors.background }} />

// ✅ 팔레트 직접 참조 (의미 없는 색조 표현 시)
<View style={{ backgroundColor: colors.blue50 }} />
```

---

## 3. Foundation — Typography

### 타이포그래피 토큰

```ts
import { typography, type TypographyToken } from '@ui';
```

| 토큰 | fontSize | fontWeight | lineHeight | 용도 |
|---|---|---|---|---|
| `heading1` | 22px | 700 | 31 | 페이지 제목 |
| `heading2` | 20px | 700 | 29 | 섹션 제목 |
| `heading3` | 18px | 700 | 27 | 카드·모달 제목 |
| `body1` | 16px | 400 | 24 | 일반 본문 |
| `body1Bold` | 16px | 600 | 24 | 강조 본문 |
| `body2` | 14px | 400 | 21 | 보조 본문, 설명 |
| `body2Bold` | 14px | 600 | 21 | 라벨, 입력 필드 제목 |
| `caption` | 12px | 400 | 18 | 보조 설명, 에러 메시지 |
| `captionBold` | 12px | 600 | 18 | 뱃지, 메타 정보 |
| `label` | 13px | 500 | 20 | 폼 라벨 |

#### 폰트 패밀리 매핑

| 토큰 그룹 | 폰트 |
|---|---|
| heading1 ~ heading3 | BMJUA |
| body1, body1Bold, body2, body2Bold, label | Pretendard |
| caption, captionBold | Roboto |

> **주의**: `typography` 객체를 `StyleSheet`에 직접 스프레드(`...typography.body2`)하지 않는다.  
> 폰트 패밀리가 누락되므로 반드시 `<TextBox variant="body2">`를 사용한다.

---

## 4. Foundation — Spacing

4px 베이스 시스템이다. `spacing[n]` = `n × 4px`.

```ts
import { spacing } from '@ui';
```

| 토큰 | px | 사용 예 |
|---|---|---|
| `spacing[1]` | 4px | 아이콘 내부 패딩 |
| `spacing[2]` | 8px | 인접 요소 간격 |
| `spacing[3]` | 12px | 소형 간격 |
| `spacing[4]` | 16px | 표준 패딩 |
| `spacing[5]` | 20px | 섹션 내 간격 |
| `spacing[6]` | 24px | 화면 가로 패딩 |
| `spacing[8]` | 32px | 섹션 간격 |
| `spacing[10]` | 40px | 대형 여백 |

```tsx
// ✅ spacing 토큰 사용
<View style={{ padding: spacing[4], gap: spacing[2] }} />

// ❌ 하드코딩 금지
<View style={{ padding: 16, gap: 8 }} />
```

---

## 5. General 컴포넌트

### TextBox

React Native `<Text>`의 완전 대체품. 모든 화면에서 `<Text>` 대신 이것을 사용한다.

```tsx
import { TextBox } from '@ui';

<TextBox variant="heading2" color={colors.grey900}>제목</TextBox>
<TextBox variant="body2" color={colors.grey500} numberOfLines={2}>설명 텍스트</TextBox>
<TextBox variant="caption" color={colors.error}>에러 메시지</TextBox>

// style prop으로 추가 스타일 적용 (margin, textAlign 등)
<TextBox variant="body1" style={{ textAlign: 'center', marginBottom: spacing[4] }}>
  중앙 정렬
</TextBox>
```

**Props**

| prop | type | default | 설명 |
|---|---|---|---|
| `variant` | `TypographyToken` | `'body1'` | 타이포그래피 토큰 |
| `color` | `string` | — | 텍스트 색상 |
| `style` | `StyleProp<TextStyle>` | — | 추가 스타일 (variant 이후 적용) |
| `...TextProps` | — | — | RN Text 모든 prop 지원 |

---

### Button

```tsx
import { Button } from '@ui';

<Button variant="primary" size="large" fullWidth onPress={handleSubmit}>
  저장
</Button>
<Button variant="secondary" size="medium" disabled onPress={() => {}}>
  취소
</Button>
<Button variant="danger" size="medium" loading={isPending} onPress={handleDelete}>
  삭제
</Button>
```

**Props**

| prop | type | default | 설명 |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | 버튼 스타일 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 높이: 36/48/56px |
| `fullWidth` | `boolean` | `false` | 너비 100% |
| `loading` | `boolean` | `false` | 로딩 스피너 표시, 비활성화 |
| `disabled` | `boolean` | `false` | 비활성화 (opacity 0.4) |
| `onPress` | `() => void` | — | 탭 핸들러 |

**variant 색상**

| variant | 배경 | 텍스트 | 용도 |
|---|---|---|---|
| `primary` | blue500 | white | 주요 액션 |
| `secondary` | grey100 | grey900 | 보조 액션 |
| `ghost` | transparent | blue500 | 텍스트 버튼 |
| `danger` | error | white | 삭제·파괴적 액션 |

---

### TextField

```tsx
import { TextField } from '@ui';

<TextField
  title="이메일"
  placeholder="example@email.com"
  keyboardType="email-address"
  autoCapitalize="none"
  value={email}
  onChangeText={setEmail}
  errorMessage={errors.email?.message}
  description="팀원에게 공개됩니다"
  clearButton
  onClear={() => setEmail('')}
  maxLength={50}
/>
```

**Props** (RN `TextInputProps` 확장)

| prop | type | 설명 |
|---|---|---|
| `title` | `string` | 입력 필드 위 라벨 |
| `description` | `string` | 입력 필드 아래 보조 설명 |
| `errorMessage` | `string` | 에러 메시지 (표시 시 description 숨김) |
| `clearButton` | `boolean` | 우측 X 버튼 표시 (값 있을 때) |
| `onClear` | `() => void` | X 버튼 핸들러 |
| `fullWidth` | `boolean` | 너비 100% (기본 true) |
| `maxLength` | `number` | 글자수 제한 + 카운터 표시 |

---

### TextArea

여러 줄 입력. `TextField`와 동일한 props 구조.

```tsx
import { TextArea } from '@ui';

<TextArea
  title="자기소개"
  placeholder="팀원들에게 자신을 소개해보세요"
  value={bio}
  onChangeText={setBio}
  maxLength={200}
  errorMessage={errors.bio?.message}
/>
```

---

### SplitTextField

인증번호 등 분리 입력 UI.

```tsx
import { SplitTextField } from '@ui';

<SplitTextField
  length={6}
  value={code}
  onChange={setCode}
  errorMessage="인증번호가 올바르지 않습니다"
/>
```

**Props**

| prop | type | 설명 |
|---|---|---|
| `length` | `number` | 칸 수 |
| `value` | `string` | 현재 값 |
| `onChange` | `(v: string) => void` | 변경 핸들러 |
| `errorMessage` | `string` | 에러 메시지 |

---

### Select

바텀 시트 형태의 드롭다운 선택.

```tsx
import { Select } from '@ui';

<Select
  label="포지션"
  placeholder="포지션을 선택하세요"
  options={[
    { value: 'FW', label: '공격수 (FW)' },
    { value: 'MF', label: '미드필더 (MF)' },
    { value: 'DF', label: '수비수 (DF)' },
    { value: 'GK', label: '골키퍼 (GK)' },
  ]}
  value={position}
  onChange={setPosition}
  errorMessage={errors.position?.message}
/>
```

**Props**

| prop | type | 설명 |
|---|---|---|
| `label` | `string` | 필드 라벨 + 바텀 시트 제목 |
| `placeholder` | `string` | 미선택 시 표시 텍스트 |
| `options` | `{ value, label, disabled? }[]` | 선택지 목록 |
| `value` | `string` | 현재 선택된 value |
| `onChange` | `(v: string) => void` | 선택 핸들러 |
| `errorMessage` | `string` | 에러 메시지 |
| `disabled` | `boolean` | 비활성화 |
| `fullWidth` | `boolean` | 너비 100% (기본 true) |

---

### Checkbox

```tsx
import { Checkbox } from '@ui';

<Checkbox label="이용약관에 동의합니다" checked={agreed} onChange={setAgreed} />
<Checkbox label="비활성화" checked disabled />
<Checkbox label="불확정 상태" checked={false} indeterminate />
```

**Props**

| prop | type | 설명 |
|---|---|---|
| `label` | `string` | 체크박스 우측 라벨 |
| `checked` | `boolean` | 체크 여부 |
| `indeterminate` | `boolean` | 부분 선택 상태 |
| `onChange` | `(v: boolean) => void` | 변경 핸들러 |
| `disabled` | `boolean` | 비활성화 |

---

### Switch

```tsx
import { Switch } from '@ui';

<Switch label="알림 수신" checked={notify} onChange={setNotify} />
```

**Props**

| prop | type | 설명 |
|---|---|---|
| `label` | `string` | 스위치 우측 라벨 |
| `checked` | `boolean` | 켜짐 여부 |
| `onChange` | `(v: boolean) => void` | 변경 핸들러 |
| `disabled` | `boolean` | 비활성화 |

---

### ListRow

목록형 행 컴포넌트. `onClick` 있으면 `TouchableOpacity`, 없으면 `View`.

```tsx
import { ListRow } from '@ui';

<ListRow
  left={<ProfileIcon size={20} color={colors.blue500} />}
  title="홍길동"
  description="미드필더 · 레벨 4"
  right={<ChevronRightIcon size={16} color={colors.grey400} />}
  onClick={() => router.push('/profile/1')}
/>
```

**Props**

| prop | type | 설명 |
|---|---|---|
| `title` | `string` | 메인 텍스트 |
| `description` | `string` | 서브 텍스트 |
| `left` | `ReactNode` | 좌측 슬롯 (아이콘·이미지) |
| `right` | `ReactNode` | 우측 슬롯 (아이콘·뱃지) |
| `onClick` | `() => void` | 탭 핸들러 |

---

### DfImage

로컬 `File` 객체와 서버 URL을 모두 처리하는 이미지 컴포넌트.

```tsx
import { DfImage, AvatarImage, ThumbnailImage, CoverImage } from '@ui';

// 서버 URL
<ThumbnailImage source={{ uri: 'https://cdn.example.com/photo.jpg' }} />

// 로컬 파일 (업로드 전 미리보기)
const [file, setFile] = useState<File | null>(null);
<AvatarImage source={file} />

// 에러 시 자동 폴백 표시, 로딩 중 shimmer 표시
<CoverImage source={{ uri: url }} errorComponent={<MyFallback />} />

// 커스텀 비율
<DfImage source={{ uri: url }} aspectRatio={4 / 3} />
```

**DfImage Props**

| prop | type | default | 설명 |
|---|---|---|---|
| `source` | `ExpoImageSource \| File \| null` | — | 이미지 소스 |
| `aspectRatio` | `number` | — | 종횡비 (미지정 시 `minHeight: 200`) |
| `showPlaceholder` | `boolean` | `true` | 로딩 중 shimmer 표시 |
| `errorComponent` | `ReactNode` | 기본 에러 UI | 에러 시 표시 컴포넌트 |
| `containerStyle` | `ViewStyle` | — | 컨테이너 스타일 |
| `thumbnailSource` | `string` | — | Progressive loading용 저해상도 URL |
| `...ExpoImageProps` | — | — | expo-image 모든 prop 지원 |

**프리셋 컴포넌트**

| 컴포넌트 | 기본 형태 | 기본 aspectRatio | contentFit |
|---|---|---|---|
| `AvatarImage` | 원형 48×48 | — | cover |
| `ThumbnailImage` | 전체 너비, 둥근 모서리 | 16/9 | cover |
| `CoverImage` | 전체 너비, 직각 모서리 | 2/1 | cover |

---

## 6. Layout 컴포넌트

### Flex

Flexbox 레이아웃 헬퍼. **`gap`은 spacing 단위 숫자** (내부에서 ×4 변환).

```tsx
import { Flex } from '@ui';

// 가로 배열, 중앙 정렬, 간격 8px(=spacing[2])
<Flex direction="row" align="center" gap={2}>
  <ProfileIcon size={20} color={colors.grey500} />
  <TextBox variant="body2">홍길동</TextBox>
</Flex>

// 세로 배열, 간격 16px(=spacing[4])
<Flex direction="column" gap={4}>
  <TextField title="이름" value={name} onChangeText={setName} />
  <TextField title="이메일" value={email} onChangeText={setEmail} />
</Flex>
```

**Props**

| prop | type | default | 설명 |
|---|---|---|---|
| `direction` | `FlexStyle['flexDirection']` | `'row'` | 방향 |
| `align` | `FlexStyle['alignItems']` | `'stretch'` | 교차축 정렬 |
| `justify` | `FlexStyle['justifyContent']` | `'flex-start'` | 주축 정렬 |
| `gap` | `number` | `0` | 간격 (spacing 단위, ×4 변환) |
| `wrap` | `FlexStyle['flexWrap']` | `'nowrap'` | 줄 바꿈 |
| `flex` | `number` | — | flex 값 |

---

### Box

padding·margin·borderRadius를 **spacing 단위**로 적용하는 View 래퍼.

```tsx
import { Box } from '@ui';

<Box padding={4} paddingX={6} borderRadius={12} backgroundColor={colors.grey50}>
  <TextBox variant="body2">내용</TextBox>
</Box>
```

**Props** — `padding`, `paddingX`, `paddingY`, `margin` 모두 spacing 단위 숫자 (×4 변환).

---

### Grid

균등 열 그리드. **`gap`은 spacing 단위 숫자**.

```tsx
import { Grid } from '@ui';

<Grid columns={3} gap={2}>
  <PlayerCard />
  <PlayerCard />
  <PlayerCard />
</Grid>
```

**Props**

| prop | type | default |
|---|---|---|
| `columns` | `number` | `2` |
| `gap` | `number` | `0` |

---

### Spacing

인라인 여백 블록.

```tsx
import { Spacing } from '@ui';

<TextField ... />
<Spacing size={4} />          {/* 세로 16px */}
<Button ...>저장</Button>

<Flex direction="row">
  <TextBox>이름</TextBox>
  <Spacing size={2} direction="horizontal" />  {/* 가로 8px */}
  <TextBox>홍길동</TextBox>
</Flex>
```

**Props**: `size: number` (spacing 단위), `direction: 'vertical' | 'horizontal'` (기본 vertical).

---

### SafeAreaWrapper

SafeAreaView 래퍼.

```tsx
import { SafeAreaWrapper } from '@ui';

<SafeAreaWrapper edges={['top', 'bottom']}>
  {/* 화면 내용 */}
</SafeAreaWrapper>
```

**Props**: `edges?: Edge[]` — 기본 `['top', 'bottom']`.

---

### BottomCTA

화면 하단 고정 CTA 버튼 영역.

```tsx
import { BottomCTASingle, BottomCTADouble, FixedBottomCTA } from '@ui';

// 단일 버튼 (safeArea: iOS 홈 인디케이터 여백 자동 처리)
<BottomCTASingle label="다음" onClick={handleNext} safeArea />

// 이중 버튼
<BottomCTADouble
  primaryLabel="신청"
  secondaryLabel="취소"
  onPrimary={handleApply}
  onSecondary={handleCancel}
  primaryDisabled={!isValid}
/>

// 커스텀 내용 (자유 배치)
<FixedBottomCTA safeArea>
  <Button variant="primary" size="large" fullWidth onPress={handleSubmit}>
    저장하기
  </Button>
</FixedBottomCTA>
```

**BottomCTASingle Props**

| prop | type | default |
|---|---|---|
| `label` | `string` | — |
| `onClick` | `() => void` | — |
| `disabled` | `boolean` | `false` |
| `loading` | `boolean` | `false` |
| `safeArea` | `boolean` | `false` |

---

## 7. Feedback 컴포넌트

### Skeleton

로딩 플레이스홀더. shimmer 애니메이션 내장.

```tsx
import { Skeleton } from '@ui';

// 텍스트 라인
<Skeleton width="60%" height={16} />
<Skeleton width="100%" height={16} />

// 이미지 플레이스홀더
<Skeleton width="100%" height={120} borderRadius={12} />

// 아바타
<Skeleton width={48} height={48} borderRadius={24} />
```

**Props**

| prop | type | default |
|---|---|---|
| `width` | `number \| string` | `'100%'` |
| `height` | `number` | `16` |
| `borderRadius` | `number` | `6` |

---

### Toast

전역 토스트 알림.

**설정**: 앱 루트에 `<ToastProvider>` 래핑 필요.

```tsx
// _layout.tsx
import { ToastProvider } from '@ui';

export default function RootLayout() {
  return (
    <ToastProvider>
      <Stack />
    </ToastProvider>
  );
}
```

**사용**:

```tsx
import { useToast } from '@ui';

function MyComponent() {
  const { toast } = useToast();

  return (
    <Button onPress={() => toast.success('저장되었습니다')}>저장</Button>
  );
}
```

**toast 메서드**

| 메서드 | 색상 도트 | 사용 상황 |
|---|---|---|
| `toast.success(msg, duration?)` | 초록 | 성공, 완료 |
| `toast.error(msg, duration?)` | 빨강 | 에러, 실패 |
| `toast.warning(msg, duration?)` | 주황 | 경고 |
| `toast.info(msg, duration?)` | 파랑 | 일반 알림 |

- `duration` 기본값: 3000ms. `0`이면 자동 닫힘 없음.

---

### Modal

중앙 팝업 모달.

```tsx
import { Modal } from '@ui';

const [isOpen, setIsOpen] = useState(false);

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="선수 정보">
  <TextBox variant="body2" color={colors.grey700}>모달 내용</TextBox>
  <Spacing size={4} />
  <Button variant="primary" size="medium" fullWidth onPress={() => setIsOpen(false)}>
    확인
  </Button>
</Modal>
```

**Props**

| prop | type | 설명 |
|---|---|---|
| `isOpen` | `boolean` | 표시 여부 |
| `onClose` | `() => void` | 닫기 핸들러 (배경 탭·X 버튼) |
| `title` | `string` | 헤더 제목 (생략 시 헤더 미표시) |
| `children` | `ReactNode` | 모달 내용 |

---

### Drawer

하단 슬라이드 업 드로어.

```tsx
import { Drawer } from '@ui';

<Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="필터">
  <Select label="지역" options={regionOptions} value={region} onChange={setRegion} />
  <Spacing size={4} />
  <Button variant="primary" size="large" fullWidth onPress={applyFilter}>
    적용
  </Button>
</Drawer>
```

**Props**: `Modal`과 동일 (`isOpen`, `onClose`, `title`, `children`).

---

### AlertDialog / ConfirmDialog

시스템 수준 확인 다이얼로그. Button 조합이 필요한 중요 액션에만 사용한다.

```tsx
import { AlertDialog, ConfirmDialog } from '@ui';

// 단순 알림 (확인 버튼 1개)
<AlertDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="저장 완료"
  description="변경 사항이 저장되었습니다."
  confirmLabel="확인"
/>

// 확인/취소 (일반)
<ConfirmDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleConfirm}
  onCancel={() => setIsOpen(false)}
  title="팀 탈퇴"
  description="정말 팀을 탈퇴하시겠습니까?"
/>

// 파괴적 액션 (확인 버튼이 danger 색상)
<ConfirmDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="계정 삭제"
  description="계정을 삭제하면 모든 데이터가 사라집니다."
  confirmLabel="삭제"
  destructive
/>
```

**ConfirmDialog Props**

| prop | type | default | 설명 |
|---|---|---|---|
| `isOpen` | `boolean` | — | 표시 여부 |
| `onClose` | `() => void` | — | 다이얼로그 닫기 |
| `onConfirm` | `() => void` | — | 확인 버튼 핸들러 |
| `onCancel` | `() => void` | — | 취소 버튼 핸들러 (미지정 시 onClose) |
| `title` | `string` | — | 제목 |
| `description` | `string` | — | 설명 |
| `confirmLabel` | `string` | `'확인'` | 확인 버튼 텍스트 |
| `cancelLabel` | `string` | `'취소'` | 취소 버튼 텍스트 |
| `destructive` | `boolean` | `false` | true이면 확인 버튼이 danger 스타일 |

---

## 8. 아이콘

SVG 기반 아이콘. 모두 `@ui`에서 Named Export.

```tsx
import { HomeIcon, ProfileIcon, ChevronRightIcon } from '@ui';

<HomeIcon size={24} color={colors.grey700} />
<ProfileIcon size={20} color={colors.blue500} strokeWidth={2} />
```

**공통 Props**: `size: number`, `color: string`, `strokeWidth?: number`.

**현재 아이콘 목록**

| 아이콘 | 컴포넌트명 |
|---|---|
| 홈 | `HomeIcon` |
| 프로필 | `ProfileIcon` |
| 검색 | `SearchIcon` |
| 설정 | `SettingsIcon` |
| 알림 | `NotificationIcon` |
| 메뉴 | `MenuIcon` |
| 히스토리 | `HistoryIcon` |
| 위쪽 화살표 | `ChevronUpIcon` |
| 아래쪽 화살표 | `ChevronDownIcon` |
| 왼쪽 화살표 | `ChevronLeftIcon` |
| 오른쪽 화살표 | `ChevronRightIcon` |
| 왼쪽 이동 | `ArrowLeftIcon` |
| 오른쪽 이동 | `ArrowRightIcon` |
| 닫기 | `CloseIcon` |
| 체크 | `CheckIcon` |
| 이미지 | `ImageIcon` |

> 새 아이콘 추가: `client/scripts/build-icons.js` 참고.

---

## 9. 핵심 규칙 요약

| 규칙 | 올바른 예 | 잘못된 예 |
|---|---|---|
| 텍스트는 TextBox | `<TextBox variant="body2">` | `<Text style={...}>` |
| 임포트는 @ui 단일 경로 | `import { Button } from '@ui'` | `import Button from '../../ui/...'` |
| 간격은 spacing 토큰 | `padding: spacing[4]` | `padding: 16` |
| 색상은 colors 토큰 | `color: colors.error` | `color: '#f04452'` |
| typography는 TextBox variant | `<TextBox variant="body2Bold">` | `style={{ ...typography.body2Bold }}` |
| 이미지는 DfImage 계열 | `<ThumbnailImage source={...}>` | `<Image source={...}>` |
| CTA는 BottomCTA 컴포넌트 | `<BottomCTASingle label="저장" />` | 직접 View+Button 조합 |

> **라이브 확인**: 앱 실행 후 홈 화면 → `🎨 Design System` 버튼에서 모든 컴포넌트를 실기기/시뮬레이터로 확인할 수 있다.
