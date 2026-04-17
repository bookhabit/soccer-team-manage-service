import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, Skeleton, Spacing, colors, spacing } from '@ui';
import type { HeadToHeadSummary } from '../../data/schemas/headToHead.schema';

interface H2HSummaryCardProps {
  summary: HeadToHeadSummary;
}

export function H2HSummaryCard({ summary }: H2HSummaryCardProps) {
  return (
    <View style={styles.card}>
      {/* 클럽명 행 */}
      <View style={styles.clubRow}>
        <TextBox variant="body2Bold" color={colors.grey900} style={styles.clubName}>
          {summary.myClubName}
        </TextBox>
        <TextBox variant="body2" color={colors.grey400}>
          vs
        </TextBox>
        <TextBox variant="body2Bold" color={colors.grey700} style={styles.clubNameRight}>
          {summary.opponentClubName}
        </TextBox>
      </View>

      <Spacing size={3} />

      {/* 승무패 */}
      <View style={styles.recordRow}>
        <View style={styles.recordItem}>
          <TextBox variant="heading3" color={colors.blue500}>
            {summary.wins}
          </TextBox>
          <TextBox variant="caption" color={colors.blue500}>
            승
          </TextBox>
        </View>
        <View style={styles.divider} />
        <View style={styles.recordItem}>
          <TextBox variant="heading3" color={colors.grey500}>
            {summary.draws}
          </TextBox>
          <TextBox variant="caption" color={colors.grey500}>
            무
          </TextBox>
        </View>
        <View style={styles.divider} />
        <View style={styles.recordItem}>
          <TextBox variant="heading3" color={colors.red500}>
            {summary.losses}
          </TextBox>
          <TextBox variant="caption" color={colors.red500}>
            패
          </TextBox>
        </View>
      </View>

      <Spacing size={2} />

      {/* 득실점 */}
      <TextBox variant="caption" color={colors.grey500}>
        득점 {summary.goalsFor}골 · 실점 {summary.goalsAgainst}골
      </TextBox>
    </View>
  );
}

export function H2HSummarySkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.clubRow}>
        <Skeleton width={80} height={18} borderRadius={4} />
        <Skeleton width={24} height={14} borderRadius={4} />
        <Skeleton width={80} height={18} borderRadius={4} />
      </View>
      <Spacing size={3} />
      <View style={styles.recordRow}>
        <Skeleton width={48} height={40} borderRadius={6} />
        <Skeleton width={1} height={32} borderRadius={1} />
        <Skeleton width={48} height={40} borderRadius={6} />
        <Skeleton width={1} height={32} borderRadius={1} />
        <Skeleton width={48} height={40} borderRadius={6} />
      </View>
      <Spacing size={2} />
      <Skeleton width={120} height={14} borderRadius={4} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
    alignItems: 'center',
  },
  clubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  clubName: {
    flex: 1,
    textAlign: 'right',
  },
  clubNameRight: {
    flex: 1,
    textAlign: 'left',
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[5],
  },
  recordItem: {
    alignItems: 'center',
    gap: 2,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: colors.grey200,
  },
});
