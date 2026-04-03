# 아이콘 시스템 자동화

> **원칙**: 피그마에서 SVG를 익스포트하면 스크립트가 `react-native-svg` 기반의 TSX 컴포넌트로 자동 변환한다.

---

## 1. 디렉토리 구조

```tsx
packages/ui/
├── scripts/
│   ├── transform-svg.js     # SVG → React Native TSX 변환 스크립트
│   └── generate-index.js    # generated/index.ts 자동 생성
└── src/icons/
    ├── svg/                 # 소스 SVG 파일 (카테고리별 관리)
    │   ├── action/          # Plus, Edit, Delete 등
    │   ├── navigation/      # Home, Search, Profile 등
    │   └── status/          # CheckCircle, Alert 등
    ├── generated/           # 자동 생성된 네이티브 컴포넌트 (수동 편집 금지)
    │   ├── HomeIcon.tsx
    │   └── index.ts
    └── types.ts             # IconProps (size, color, strokeWidth) 정의
```

---

## 2. 아이콘 추가 워크플로우

### 1단계: 피그마 익스포트

피그마 아이콘 프레임 선택 → **Export as SVG** → `src/icons/svg/{카테고리}/` 폴더에 저장합니다.

- **파일명 규칙**: `kebab-case.svg` (예: `soccer-ball.svg`)

### 2단계: 파이프라인 실행

터미널에서 아래 명령어를 실행하여 네이티브 컴포넌트를 생성합니다.

### 3단계: 변환 규칙 (Native Optimized)

- **파일명 → 컴포넌트명**: `kebab-case.svg` → `PascalCaseIcon`
- **속성 변환**: SVG의 `stroke-width` 등은 JSX의 `strokeWidth`로 자동 변환됩니다.
- **컬러 처리**: 하드코딩된 색상은 제거하고, 부모 `Svg` 태그의 `stroke` 또는 `fill` 프롭에 `color` 값을 주입하도록 구성합니다.

---

## 3. 생성되는 컴포넌트 구조 (React Native)

스크립트에 의해 생성되는 표준 아이콘 컴포넌트 예시입니다.

```tsx
import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { IconProps } from '../types';

export function SoccerBallIcon({
  size = 24,
  color = '#191f28', // 기본값: grey900
  strokeWidth = 1.8,
  style,
}: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {/* 변환된 SVG 경로 데이터 */}
      <Path d="..." />
    </Svg>
  );
}
```

---

## 4. 사용 방법

```tsx
import { SoccerBallIcon, ChevronRightIcon } from '@fc-flow/ui';
import { colors } from '@/shared/constants/colors';

// 1. 기본 사용 (24px, 기본 컬러)
<SoccerBallIcon />

// 2. 크기 및 브랜드 컬러 지정
<SoccerBallIcon size={32} color={colors.green500} />

// 3. 선 굵기 조정 및 스타일 적용
<ChevronRightIcon strokeWidth={2.5} style={{ marginLeft: 8 }} />
```

---

## 5. 아이콘 관리 주의사항

1. **수동 편집 금지**: `src/icons/generated/` 폴더 내부 파일은 파이프라인 실행 시 매번 덮어씌워지므로 직접 수정하지 마세요.
2. **고유한 파일명**: 카테고리가 다르더라도 파일명이 같으면 마지막 파일이 덮어쓰게 되므로, 모든 SVG 파일명은 고유하게 유지해야 합니다.
3. **터치 영역 확보**: 아이콘만 단독으로 클릭 버튼 역할을 할 경우, 최소 **44x44px** 이상의 터치 영역을 확보하도록 감싸는 `Pressable`에 패딩을 줍니다.
