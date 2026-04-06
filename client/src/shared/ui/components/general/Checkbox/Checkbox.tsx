import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@ui/foundation/colors';

import type { CheckboxProps } from './Checkbox.types';
import { CheckIcon } from '@ui/icons';
import TextBox from '../TextBox';

export function Checkbox({
  label,
  checked = false,
  indeterminate = false,
  onChange,
  disabled,
}: CheckboxProps) {
  const isActive = checked || indeterminate;

  return (
    <TouchableOpacity
      style={[styles.wrapper, disabled && styles.disabled]}
      onPress={() => !disabled && onChange?.(!checked)}
      activeOpacity={0.7}
    >
      <View style={[styles.box, isActive && styles.boxActive]}>
        {indeterminate ? (
          <View style={styles.indeterminateLine} />
        ) : checked ? (
          <CheckIcon size={12} color="#ffffff" strokeWidth={3} />
        ) : null}
      </View>
      {label !== undefined && <TextBox variant="body2" color={colors.grey800}>{label}</TextBox>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  disabled: { opacity: 0.4 },
  box: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.grey300,
    borderRadius: 5,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: { backgroundColor: colors.blue500, borderColor: colors.blue500 },
  indeterminateLine: {
    width: 10,
    height: 2,
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },
});
