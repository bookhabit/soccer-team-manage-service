import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@ui/foundation/colors';
import type { IconButtonProps } from './IconButton.types';

const variantStyles = {
  ghost: { bg: 'transparent', pressedBg: colors.grey100 },
  subtle: { bg: colors.grey100, pressedBg: colors.grey200 },
} as const;

/** 터치 영역 크기 (px) */
const sizeStyles = {
  small: { size: 32, borderRadius: 8 },
  medium: { size: 40, borderRadius: 10 },
  large: { size: 48, borderRadius: 12 },
} as const;

/**
 * 아이콘 하나만 담는 정사각형 버튼.
 * 텍스트 없이 아이콘 액션이 필요한 곳에 사용한다.
 * 접근성을 위해 `accessibilityLabel`을 반드시 전달해야 한다.
 */
export function IconButton({
  icon,
  onPress,
  variant = 'ghost',
  size = 'medium',
  disabled = false,
  accessibilityLabel,
}: IconButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          width: s.size,
          height: s.size,
          borderRadius: s.borderRadius,
          backgroundColor: v.bg,
        },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {icon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
