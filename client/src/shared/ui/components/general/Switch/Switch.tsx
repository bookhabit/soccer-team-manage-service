import React from 'react';
import { View, Switch as RNSwitch, StyleSheet } from 'react-native';
import { colors } from '@ui/foundation/colors';
import type { SwitchProps } from './Switch.types';
import TextBox from '../TextBox';

export function Switch({ label, checked = false, onChange, disabled }: SwitchProps) {
  return (
    <View style={[styles.wrapper, disabled && styles.disabled]}>
      <RNSwitch
        value={checked}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: colors.grey300, true: colors.blue500 }}
        thumbColor="#ffffff"
        ios_backgroundColor={colors.grey300}
      />
      {label !== undefined && <TextBox variant="body2" color={colors.grey800}>{label}</TextBox>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  disabled: { opacity: 0.4 },
});
