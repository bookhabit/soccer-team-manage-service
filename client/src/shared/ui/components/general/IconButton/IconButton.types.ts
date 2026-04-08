import type { ReactNode } from 'react';

export type IconButtonVariant = 'ghost' | 'subtle';
export type IconButtonSize = 'small' | 'medium' | 'large';

export type IconButtonProps = {
  /** 렌더링할 아이콘 요소 */
  icon: ReactNode;
  onPress?: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  /** 스크린 리더 접근성 레이블 (필수) */
  accessibilityLabel: string;
};
