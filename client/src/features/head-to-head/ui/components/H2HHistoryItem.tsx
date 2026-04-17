import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, Skeleton, Spacing, colors, spacing } from '@ui';
import type { HeadToHeadHistoryItem, HeadToHeadResult } from '../../data/schemas/headToHead.schema';

interface H2HHistoryItemProps {
  item: HeadToHeadHistoryItem;
}

const RESULT_LABEL: Record<HeadToHeadResult, string> = {
  WIN: '승',
  DRAW: '무',
  LOSS: '패',
};

const RESULT_COLOR: Record<HeadToHeadResult, string> = {
  WIN: colors.blue500,
  DRAW: colors.grey500,
  LOSS: colors.red500,
};

const RESULT_BG: Record<HeadToHeadResult, string> = {
  WIN: colors.blue50,
  DRAW: colors.grey100,
  LOSS: '#fff0f0',
};

function formatShortDate(isoString: string): string {
  const d = new Date(isoString);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export function H2HHistoryItem({ item }: H2HHistoryItemProps) {
  return (
    <View style={styles.row}>
      {/* 날짜 */}
      <TextBox variant="caption" color={colors.grey500} style={styles.date}>
        {formatShortDate(item.date)}
      </TextBox>

      {/* 스코어 */}
      <View style={styles.scoreArea}>
        <TextBox variant="body2Bold" color={colors.grey900}>
          {item.myScore}
        </TextBox>
        <TextBox variant="body2" color={colors.grey400}>
          :
        </TextBox>
        <TextBox variant="body2Bold" color={colors.grey700}>
          {item.opponentScore}
        </TextBox>
      </View>

      {/* 결과 뱃지 */}
      <View style={[styles.badge, { backgroundColor: RESULT_BG[item.result] }]}>
        <TextBox variant="captionBold" color={RESULT_COLOR[item.result]}>
          {RESULT_LABEL[item.result]}
        </TextBox>
      </View>
    </View>
  );
}

export function H2HHistoryItemSkeleton() {
  return (
    <View style={styles.row}>
      <Skeleton width={72} height={14} borderRadius={4} />
      <View style={styles.scoreArea}>
        <Skeleton width={48} height={16} borderRadius={4} />
      </View>
      <Skeleton width={28} height={22} borderRadius={6} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  date: {
    width: 80,
  },
  scoreArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  badge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
    borderRadius: 6,
    minWidth: 28,
    alignItems: 'center',
  },
});
