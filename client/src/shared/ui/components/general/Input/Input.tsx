import React, { useState } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { colors } from '@ui/foundation/colors';
import { typography } from '@ui/foundation/typography';
import type { InputProps } from './Input.types';

export function Input({ style, ...rest }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <TextInput
      style={[styles.input, isFocused && styles.focused, style]}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      placeholderTextColor={colors.grey400}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    ...typography.body1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: colors.grey200,
    borderRadius: 10,
    backgroundColor: colors.background,
    color: colors.grey900,
  },
  focused: { borderColor: colors.blue500 },
});
