import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '@ui/foundation/colors';
import TextBox from '../TextBox';
import type { ButtonProps } from './Button.types';

const variantStyles = {
  primary: { bg: colors.blue500, text: '#ffffff', pressedBg: colors.blue700 },
  secondary: { bg: colors.grey100, text: colors.grey900, pressedBg: colors.grey200 },
  ghost: { bg: 'transparent', text: colors.blue500, pressedBg: colors.blue50 },
  danger: { bg: colors.error, text: '#ffffff', pressedBg: colors.error },
} as const;

const sizeStyles = {
  small: { height: 36, fontSize: 14, fontWeight: '600' as const, paddingHorizontal: 14 },
  medium: { height: 48, fontSize: 16, fontWeight: '600' as const, paddingHorizontal: 20 },
  large: { height: 56, fontSize: 16, fontWeight: '600' as const, paddingHorizontal: 28 },
};

export function Button({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  children,
  onPress,
}: ButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { backgroundColor: v.bg, height: s.height, paddingHorizontal: s.paddingHorizontal },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <TextBox
          style={[styles.text, { color: v.text, fontSize: s.fontSize, fontWeight: s.fontWeight }]}
        >
          {children}
        </TextBox>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    textAlign: 'center',
  },
});
