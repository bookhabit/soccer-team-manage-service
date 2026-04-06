import React, { useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { colors } from '@ui/foundation/colors';
import { typography } from '@ui/foundation/typography';
import type { SplitTextFieldProps } from './TextField.types';

export function SplitTextField({ length, value, onChange, errorMessage }: SplitTextFieldProps) {
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const chars = value.split('');
    chars[index] = text.slice(-1);
    const newValue = chars.join('');
    onChange(newValue.slice(0, length));
    if (text && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(r) => {
            inputs.current[i] = r;
          }}
          style={[styles.cell, errorMessage ? styles.cellError : null]}
          value={value[i] ?? ''}
          onChangeText={(t) => handleChange(t, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          maxLength={1}
          keyboardType="number-pad"
          textAlign="center"
          placeholderTextColor={colors.grey400}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 8 },
  cell: {
    ...typography.body1Bold,
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: colors.grey200,
    borderRadius: 10,
    color: colors.grey900,
    backgroundColor: colors.background,
  },
  cellError: { borderColor: colors.error },
});
