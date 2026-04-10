import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, colors, spacing } from '@ui';

interface AttendanceSummaryProps {
  attendCount: number;
  absentCount: number;
  undecidedCount?: number;
  total: number;
}

export function AttendanceSummary({
  attendCount,
  absentCount,
  undecidedCount = 0,
  total,
}: AttendanceSummaryProps) {
  const attendPct = total > 0 ? (attendCount / total) * 100 : 0;
  const absentPct = total > 0 ? (absentCount / total) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.counts}>
        <TextBox variant="caption" color={colors.green600}>참석 {attendCount}</TextBox>
        <TextBox variant="caption" color={colors.grey400}>·</TextBox>
        <TextBox variant="caption" color={colors.red500}>불참 {absentCount}</TextBox>
        {undecidedCount > 0 ? (
          <>
            <TextBox variant="caption" color={colors.grey400}>·</TextBox>
            <TextBox variant="caption" color={colors.grey500}>미정 {undecidedCount}</TextBox>
          </>
        ) : null}
      </View>
      <View style={styles.bar}>
        <View style={[styles.segment, { flex: attendPct, backgroundColor: colors.green400 }]} />
        <View style={[styles.segment, { flex: absentPct, backgroundColor: colors.red400 }]} />
        <View
          style={[
            styles.segment,
            { flex: Math.max(100 - attendPct - absentPct, 0), backgroundColor: colors.grey200 },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[1],
  },
  counts: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  bar: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: colors.grey200,
  },
  segment: {
    height: 4,
  },
});
