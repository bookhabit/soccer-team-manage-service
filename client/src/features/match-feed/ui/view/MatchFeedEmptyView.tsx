import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, colors, spacing } from '@ui';
import type { MatchFeedFilter } from '../../data/schemas/matchFeed.schema';

interface MatchFeedEmptyViewProps {
  filter: MatchFeedFilter;
}

function getEmptyMessage(filter: MatchFeedFilter): string {
  if (filter.myMatches) {
    return '참가한 경기 기록이 없습니다.';
  }
  if (filter.type === 'SELF') {
    return '등록된 자체전 기록이 없습니다.';
  }
  if (filter.province) {
    return '해당 지역에 등록된 경기 결과가 없습니다.';
  }
  return '아직 등록된 경기 결과가 없습니다.';
}

export function MatchFeedEmptyView({ filter }: MatchFeedEmptyViewProps) {
  return (
    <View style={styles.container}>
      <TextBox variant="heading3" color={colors.grey300} style={styles.icon}>
        ⚽
      </TextBox>
      <TextBox variant="body2" color={colors.grey500} style={styles.message}>
        {getEmptyMessage(filter)}
      </TextBox>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[16],
    gap: spacing[3],
  },
  icon: {
    fontSize: 40,
  },
  message: {
    textAlign: 'center',
  },
});
