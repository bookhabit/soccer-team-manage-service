# 13. 디자인 시스템 (`@mono/ui`)

> 패키지 위치: `packages/ui/src/`
> 모든 앱에서 `import { ... } from '@mono/ui'`로 사용

---

## 목차

1. [Foundation (토큰)](#1-foundation-토큰)
2. [Layout 컴포넌트](#2-layout-컴포넌트)
3. [General 컴포넌트](#3-general-컴포넌트)
4. [Feedback 컴포넌트](#4-feedback-컴포넌트)
5. [Icons](#5-icons)
6. [사용 규칙](#6-사용-규칙)

---

## 1. Foundation (토큰)

### Colors

```ts
import { colors } from "@mono/ui";

// Grey 스케일 (텍스트, 배경, 테두리)
colors.grey50; // #f9fafb — 카드 배경
colors.grey100; // #f2f4f6 — 구분선, secondary 버튼 배경
colors.grey200; // #e5e8eb — 입력 테두리
colors.grey400; // #b0b8c1 — placeholder
colors.grey500; // #8b95a1 — 보조 텍스트
colors.grey700; // #4e5968 — 레이블
colors.grey900; // #191f28 — 기본 텍스트

// Blue (primary 액션)
colors.blue50; // #e8f3ff — hover 배경
colors.blue300; // #64a8ff — disabled 상태
colors.blue500; // #3182f6 — 기본 primary 버튼
colors.blue600; // #2272eb — hover
colors.blue700; // #1b64da — active

// Semantic
colors.background; // 앱 배경
colors.error; // 에러 텍스트, 에러 테두리 (red500)
colors.success; // 성공
colors.warning; // 경고
```

### Typography

```ts
import { typography } from "@mono/ui";

// CSS 문자열 — Emotion css`` 템플릿에서만 사용
// React style={} 에는 사용 불가 (스프레드 불가)
```

| 토큰          | 크기 | 굵기 | 용도              |
| ------------- | ---- | ---- | ----------------- |
| `heading1`    | 22px | 700  | 페이지 타이틀     |
| `heading2`    | 20px | 700  | 섹션 타이틀       |
| `heading3`    | 18px | 700  | 카드 타이틀       |
| `body1`       | 16px | 400  | 기본 본문         |
| `body1Bold`   | 16px | 600  | 강조 본문         |
| `body2`       | 14px | 400  | 보조 본문         |
| `body2Bold`   | 14px | 600  | 버튼 텍스트       |
| `caption`     | 12px | 400  | 에러 메시지, 설명 |
| `captionBold` | 12px | 600  | 레이블            |

> ⚠️ **React `style={}`에 `...typography.heading1` 스프레드 불가** — 값이 CSS 문자열이기 때문.
> `'use client'` 파일에서는 Emotion `css` prop을 사용하거나, 폰트 값을 직접 지정:
>
> ```tsx
> // ✅
> style={{ fontSize: 22, fontWeight: 700, lineHeight: '31px' }}
> // ❌
> style={{ ...typography.heading1 }}
> ```

### Spacing

```ts
import { spacing } from "@mono/ui";

spacing[1]; // '4px'
spacing[2]; // '8px'
spacing[4]; // '16px'
spacing[5]; // '20px'
spacing[6]; // '24px'
spacing[8]; // '32px'
spacing[10]; // '40px'
// 규칙: spacing[n] = n * 4px
```

---

## 2. Layout 컴포넌트

### MobileLayout

모바일 앱 기본 레이아웃. `'use client'` 필수.

```tsx
import { MobileLayout } from '@mono/ui';

// 헤더만
<MobileLayout header={{ title: '페이지 제목' }}>
  {children}
</MobileLayout>

// 뒤로가기 버튼
<MobileLayout header={{ title: '상세', onBack: () => router.back() }}>
  {children}
</MobileLayout>

// 헤더 + 하단 탭바
<MobileLayout
  header={{ title: '홈', rightSlot: <SettingsIcon /> }}
  tabs={{
    tabs: [
      { key: 'home',    label: '홈',    icon: <HomeIcon /> },
      { key: 'profile', label: '프로필', icon: <ProfileIcon /> },
    ],
    activeKey: 'home',
    onChange: (key) => router.push(`/${key}`),
  }}
>
  {children}
</MobileLayout>
```

> ⚠️ RSC(서버 컴포넌트) 페이지에서 직접 렌더링 가능하지만,
> 내부에서 `'use client'` 경계를 만들어 hydration됨.
> `useRouter` 같은 훅이 필요한 경우 별도 `'use client'` Container로 분리.

### Flex

```tsx
import { Flex } from "@mono/ui";

<Flex direction="column" gap={4} align="center" justify="space-between">
  ...
</Flex>;

// gap은 spacing 단위 (gap={4} = 16px)
// direction: 'row' | 'column' | 'row-reverse' | 'column-reverse'
// align: CSS alignItems 값
// justify: CSS justifyContent 값
```

### Spacing

```tsx
import { Spacing } from '@mono/ui';

// 수직 간격 (기본)
<Spacing size={4} />            // 16px 높이

// 수평 간격
<Spacing size={2} direction="horizontal" />  // 8px 너비
```

### BottomCTA

하단 고정 CTA 버튼 영역.

```tsx
import { BottomCTASingle, BottomCTADouble, FixedBottomCTA } from '@mono/ui';

// 단일 버튼
<BottomCTASingle
  label="다음"
  onClick={handleNext}
  loading={isPending}
  safeArea  // iPhone 하단 safe area 자동 처리
/>

// 취소 + 확인 버튼
<BottomCTADouble
  secondaryLabel="취소"
  primaryLabel="확인"
  onSecondary={handleCancel}
  onPrimary={handleConfirm}
/>

// 커스텀 내용 고정
<FixedBottomCTA safeArea>
  <Button fullWidth>직접 구성</Button>
</FixedBottomCTA>

// 하단 레이아웃과 함께 사용
<ScreenLayout
  bottomSlot={
    <BottomCTASingle label="가입 신청" onClick={onSubmit} loading={isPending} safeArea />
  }
>
```

### TopTabNavigator (react-native-tab-view)

상단 탭 네비게이터. **앱 내 모든 top tab은 `react-native-tab-view`의 `TabView` + `TabBar`로 구현한다.**
커스텀 `TouchableOpacity` 탭 바 또는 `display: none` 분기 패턴 사용 금지.

#### 기본 패턴

```tsx
import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import { colors, spacing } from '@ui';

const ROUTES = [
  { key: 'tab1', title: '탭1' },
  { key: 'tab2', title: '탭2' },
];

export function MyTabView() {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case 'tab1': return <Tab1Scene />;
      case 'tab2': return <Tab2Scene />;
      default: return null;
    }
  };

  return (
    <TabView
      style={{ flex: 1 }}
      navigationState={{ index, routes: ROUTES }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          style={{
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.grey100,
            elevation: 0,
            shadowOpacity: 0,
          }}
          indicatorStyle={{ backgroundColor: colors.blue500, height: 2 }}
          activeColor={colors.blue500}
          inactiveColor={colors.grey500}
          tabStyle={{ paddingVertical: spacing[1] }}
          pressColor={colors.blue50}
        />
      )}
    />
  );
}
```

#### 외부에서 탭을 제어하는 경우 (controlled)

컨테이너에서 `activeTab` 상태를 관리할 때는 `index`를 prop에서 유도한다.

```tsx
const ROUTES = [
  { key: 'all', title: '전체' },
  { key: 'NOTICE', title: '공지' },
];

// index를 직접 계산 — 로컬 state 불필요
const index = ROUTES.findIndex((r) => r.key === (activeTab ?? 'all'));

const handleIndexChange = (i: number) => {
  const key = ROUTES[i]?.key;
  onTabChange(key === 'all' ? undefined : key);
};
```

#### 탭 바에 액션 버튼이 필요한 경우 (글쓰기 등)

`renderTabBar`를 래퍼 `View`로 감싸고 `TabBar`는 `flex: 1`로 지정한다.

```tsx
renderTabBar={(props) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.grey100 }}>
    <View style={{ flex: 1 }}>
      <TabBar {...props} style={{ elevation: 0, shadowOpacity: 0 }} ... />
    </View>
    <TouchableOpacity onPress={onWrite} style={{ paddingHorizontal: spacing[4], paddingVertical: spacing[3] }}>
      <TextBox variant="body2Bold" color={colors.blue500}>글쓰기</TextBox>
    </TouchableOpacity>
  </View>
)}
```

#### 탭 수가 많아 가로 스크롤이 필요한 경우

```tsx
<TabBar {...props} scrollEnabled tabStyle={{ width: 'auto', paddingHorizontal: spacing[4] }} ... />
```

#### 주의사항

| 상황 | 방법 |
|------|------|
| 탭 전환 시 데이터 유지 | `lazy={false}` (기본값) — 모든 scene이 마운트 유지 |
| 탭 처음 방문 시만 렌더 | `lazy={true}` + `renderLazyPlaceholder` 제공 |
| 동적 routes (탭 수 가변) | `routes`를 컴포넌트 렌더 시 계산, `index`가 범위를 넘지 않게 주의 |
| `as const` routes | TabView가 mutable 배열을 기대하므로 `as const` 사용 금지 |

### Box / Grid

```tsx
import { Box, Grid } from '@mono/ui';

<Box padding={4} margin={2}>...</Box>

<Grid columns={2} gap={3}>
  <div>카드 1</div>
  <div>카드 2</div>
</Grid>
```

---

## 3. General 컴포넌트

### Button

```tsx
import { Button } from '@mono/ui';

// variant: 'primary' | 'secondary' | 'ghost' | 'danger'
// size: 'small' | 'medium' | 'large'

<Button variant="primary" size="large" fullWidth onClick={handleSubmit}>
  제출
</Button>

<Button variant="secondary" size="medium" loading={isPending}>
  저장 중...
</Button>

<Button variant="ghost" size="small">
  취소
</Button>

<Button variant="danger" onClick={handleDelete}>
  삭제
</Button>

// HTML button 속성 모두 사용 가능
<Button type="submit" disabled={!isValid}>제출</Button>
```

| variant     | 배경    | 용도            |
| ----------- | ------- | --------------- |
| `primary`   | blue500 | 주요 액션       |
| `secondary` | grey100 | 보조 액션, 취소 |
| `ghost`     | 투명    | 인라인 액션     |
| `danger`    | error   | 삭제, 위험 액션 |

| size     | 높이 | 용도              |
| -------- | ---- | ----------------- |
| `small`  | 36px | 인라인, 태그      |
| `medium` | 48px | 일반 액션         |
| `large`  | 56px | 폼 제출, 하단 CTA |

### TextField

react-hook-form과 바로 연동 가능. `InputHTMLAttributes`를 모두 상속.

```tsx
import { TextField } from '@mono/ui';

// 기본
<TextField
  title="이메일"
  type="email"
  placeholder="example@email.com"
  errorMessage={errors.email?.message}
  {...register('email')}
/>

// 비밀번호
<TextField
  title="비밀번호"
  type="password"
  placeholder="8자 이상"
  errorMessage={errors.password?.message}
  {...register('password')}
/>

// 글자 수 카운터 + clear 버튼 (controlled 모드)
<TextField
  title="닉네임"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  maxLength={20}
  clearButton
  onClear={() => setValue('')}
  description="팀원에게 표시되는 이름"
/>
```

> ⚠️ `exactOptionalPropertyTypes: true` 환경에서 `errorMessage={undefined}` 전달 시 TS 에러 발생.
> `errorMessage?: string | undefined`로 타입이 선언되어 있으므로 `errors.field?.message` 형태로 사용.

### Input

낮은 수준의 기본 입력 — Label, 에러 메시지 없음. 커스텀 필드 조립 시 사용.

```tsx
import { Input } from "@mono/ui";

<Input type="search" placeholder="검색어 입력" onChange={handleSearch} />;
```

### Select

```tsx
import { Select } from "@mono/ui";

<Select
  title="포지션"
  options={[
    { value: "FW", label: "공격수" },
    { value: "MF", label: "미드필더" },
    { value: "DF", label: "수비수" },
    { value: "GK", label: "골키퍼" },
  ]}
  value={position}
  onChange={(e) => setPosition(e.target.value)}
  errorMessage={errors.position?.message}
/>;
```

### DateInputField

날짜 선택 필드. Android는 네이티브 DatePicker, iOS는 하단 시트(스피너) 방식으로 열린다.
**날짜 입력이 필요한 모든 폼에서 `TextField` 대신 반드시 이 컴포넌트를 사용한다.**

```tsx
import { DateInputField } from '@ui';

// react-hook-form Controller와 연동
<Controller
  control={control}
  name="matchDate"
  render={({ field }) => (
    <DateInputField
      label="경기 날짜 *"
      value={field.value ?? ''}       // 'YYYY-MM-DD' 형식
      onChange={field.onChange}
      error={errors.matchDate?.message}
      minimumDate={new Date()}         // 오늘 이전 날짜 비활성화 (선택)
    />
  )}
/>
```

| prop          | 타입                   | 필수 | 설명                                |
| ------------- | ---------------------- | ---- | ----------------------------------- |
| `label`       | `string`               | ✅   | 입력 필드 레이블                    |
| `value`       | `string`               | ✅   | 현재 날짜값 (`'YYYY-MM-DD'`)        |
| `onChange`    | `(v: string) => void`  | ✅   | 날짜 선택 시 콜백                   |
| `error`       | `string`               | —    | 에러 메시지 (있으면 빨간 테두리)    |
| `minimumDate` | `Date`                 | —    | 이 날짜 이전 선택 불가              |

### TimeInputField

시간 선택 필드. Android는 네이티브 TimePicker(24시간), iOS는 하단 시트(스피너) 방식.
**시간 입력이 필요한 모든 폼에서 `TextField` 대신 반드시 이 컴포넌트를 사용한다.**

```tsx
import { TimeInputField } from '@ui';

// react-hook-form Controller와 연동
<Controller
  control={control}
  name="startTime"
  render={({ field }) => (
    <TimeInputField
      label="시작 시간 *"
      value={field.value ?? ''}       // 'HH:mm' 형식
      onChange={field.onChange}
      error={errors.startTime?.message}
    />
  )}
/>
```

| prop       | 타입                   | 필수 | 설명                             |
| ---------- | ---------------------- | ---- | -------------------------------- |
| `label`    | `string`               | ✅   | 입력 필드 레이블                 |
| `value`    | `string`               | ✅   | 현재 시간값 (`'HH:mm'`)          |
| `onChange` | `(v: string) => void`  | ✅   | 시간 선택 시 콜백                |
| `error`    | `string`               | —    | 에러 메시지 (있으면 빨간 테두리) |

> ⚠️ **날짜/시간 입력에 `<TextField placeholder="YYYY-MM-DD">` 형태 사용 금지.**
> 사용자가 직접 타이핑하면 형식 오류가 발생하므로 반드시 picker 컴포넌트를 사용한다.

### Checkbox / Switch

```tsx
import { Checkbox, Switch } from '@mono/ui';

<Checkbox
  label="약관에 동의합니다"
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
/>

<Switch
  checked={isPublic}
  onChange={(e) => setIsPublic(e.target.checked)}
/>
```

### ListRow

리스트 항목 레이아웃.

```tsx
import { ListRow } from "@mono/ui";

<ListRow
  left={<ProfileIcon />}
  title="홍길동"
  description="미드필더 · 레벨 4"
  right={<ChevronRightIcon />}
  onClick={handlePress}
/>;
```

---

## 4. Feedback 컴포넌트

### Toast

```tsx
import { ToastProvider, ToastContainer, useToast } from "@mono/ui";

// 1. 앱 루트에 Provider + Container 등록
export default function RootLayout({ children }) {
  return (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  );
}

// 2. 컴포넌트에서 사용
function MyComponent() {
  const { show } = useToast();

  return (
    <Button
      onClick={() => show({ message: "저장되었습니다", type: "success" })}
    >
      저장
    </Button>
  );
}

// type: 'success' | 'error' | 'warning' | 'info'
```

### Modal / Drawer

```tsx
import { Modal, Drawer, useModal } from "@mono/ui";

// useModal 훅으로 제어
function MyComponent() {
  const modal = useModal();

  return (
    <>
      <Button onClick={modal.open}>열기</Button>
      <Modal isOpen={modal.isOpen} onClose={modal.close} title="제목">
        모달 내용
      </Modal>
    </>
  );
}

// Drawer (하단 슬라이드)
<Drawer isOpen={isOpen} onClose={close} title="필터">
  필터 내용
</Drawer>;
```

### AlertDialog / ConfirmDialog

```tsx
import { AlertDialog, ConfirmDialog } from '@mono/ui';

<AlertDialog
  isOpen={isOpen}
  onClose={close}
  title="알림"
  message="저장되었습니다."
/>

<ConfirmDialog
  isOpen={isOpen}
  onClose={close}
  onConfirm={handleDelete}
  title="삭제 확인"
  message="정말 삭제하시겠습니까?"
  confirmLabel="삭제"
  cancelLabel="취소"
/>
```

### Skeleton

로딩 플레이스홀더.

```tsx
import { Skeleton } from '@mono/ui';

// 텍스트 줄
<Skeleton width="60%" height={16} />

// 카드
<Skeleton width="100%" height={120} borderRadius={12} />

// 아바타
<Skeleton width={40} height={40} borderRadius="50%" />
```

---

## 5. Icons

54개 아이콘. SVG 파이프라인으로 자동 생성.

```tsx
import {
  HomeIcon, ProfileIcon, SearchIcon, PlusIcon, CloseIcon,
  ChevronRightIcon, ArrowLeftIcon, SettingsIcon, NotificationIcon,
  // ...
} from '@mono/ui';

// 기본 (24px, currentColor)
<HomeIcon />

// 크기/색상 커스텀
<ChevronRightIcon size={16} color={colors.grey400} />
<PlusIcon size={20} color={colors.blue500} />
```

| 카테고리   | 아이콘                                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------------------------- |
| navigation | Home, Profile, Search, Settings, Notification, Menu, History                                                          |
| action     | Plus, Minus, Close, Edit, Delete, Copy, Share, Filter, Refresh, Upload, Download, Check, MoreHorizontal, MoreVertical |
| chevron    | ChevronUp/Down/Left/Right, ArrowLeft/Right                                                                            |
| status     | AlertCircle, AlertTriangle, CheckCircle, InfoCircle, XCircle, Eye, EyeOff, Lock                                       |
| finance    | Wallet, Bank, Card, Coin, Transfer, Exchange, ChartBar, ChartLine, StockUp, StockDown, Receipt                        |
| media      | Calendar, Camera, Document, Clipboard, Image, Mail, Phone                                                             |

---

## 6. 사용 규칙

### ✅ 해야 할 것

```tsx
// 1. 컴포넌트 우선 — Foundation 토큰을 직접 쓰지 말고 컴포넌트 사용
<Button variant="primary" size="large" fullWidth>제출</Button>  // ✅
<button style={{ background: colors.blue500 }}>제출</button>    // ❌

// 2. TextField로 폼 필드 구성
<TextField title="이메일" errorMessage={errors.email?.message} {...register('email')} />  // ✅
<input style={{ border: `1px solid ${colors.grey200}` }} />                              // ❌

// 3. MobileLayout으로 페이지 구조 잡기
<MobileLayout header={{ title: '페이지' }}>{children}</MobileLayout>  // ✅
<div style={{ maxWidth: 480, margin: '0 auto' }}>{children}</div>     // ❌ (MobileLayout이 있을 때)

// 4. Spacing 컴포넌트로 여백 처리
<Spacing size={4} />         // ✅
<div style={{ height: 16 }} />  // ❌
```

### ❌ 하지 말 것

```tsx
// 이미 있는 컴포넌트를 재구현
const MyButton = styled.button`...`;  // ❌ Button 사용

// typography를 style={}에 스프레드
style={{ ...typography.heading1 }}   // ❌ 컴파일 에러 (CSS 문자열)

// @mono/ui 컴포넌트를 bypassing
<input className="my-input" />       // ❌ TextField 사용
```

### RSC(서버 컴포넌트)에서 사용 시

```tsx
// ✅ RSC에서 클라이언트 컴포넌트 렌더링 가능
// page.tsx (RSC)
export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <LoginFormContainer /> {/* 'use client' 컴포넌트 */}
    </main>
  );
}

// ❌ RSC 자체에서 Emotion css prop 사용 불가
// ❌ RSC에서 typography/colors를 style={}에 스프레드 불가 (CSS 문자열)
// ✅ RSC에서 colors.grey900 같은 헥스값은 style={}에 직접 사용 가능
```
