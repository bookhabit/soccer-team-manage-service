import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import TextBox from '../TextBox';
import { colors } from '../../../foundation/colors';
import { spacing } from '../../../foundation/spacing';

export interface ChipProps {
  label: string;
  active?: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function Chip({ label, active = false, onPress, disabled = false }: ChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive, disabled && styles.chipDisabled]}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={disabled}
    >
      <TextBox variant="captionBold" color={active ? colors.primary : colors.grey600}>
        {label}
      </TextBox>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.grey200,
    backgroundColor: colors.background,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.blue50,
  },
  chipDisabled: {
    opacity: 0.5,
  },
});
