import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, colors, spacing } from '@ui';
import type { AttendanceResponse } from '../../data/schemas/match.schema';

interface AttendanceChipProps {
  response: AttendanceResponse | null;
}

const CONFIG: Record<
  AttendanceResponse | 'NONE',
  { label: string; bgColor: string; textColor: string }
> = {
  ATTEND: { label: '참석', bgColor: colors.green50, textColor: colors.green600 },
  ABSENT: { label: '불참', bgColor: colors.red50, textColor: colors.red600 },
  UNDECIDED: { label: '미정', bgColor: colors.grey100, textColor: colors.grey600 },
  NONE: { label: '미응답', bgColor: colors.grey100, textColor: colors.grey400 },
};

export function AttendanceChip({ response }: AttendanceChipProps) {
  const key = response ?? 'NONE';
  const { label, bgColor, textColor } = CONFIG[key];

  return (
    <View style={[styles.chip, { backgroundColor: bgColor }]}>
      <TextBox variant="captionBold" color={textColor}>{label}</TextBox>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
});
