import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, colors, spacing } from '@ui';

interface ClubStatsBarProps {
  matchCount: number;
  winCount: number;
  drawCount: number;
  lossCount: number;
}

/**
 * 클럽 대시보드에서 전적(경기수·승·무·패·승률)을 요약 표시하는 컴포넌트.
 */
export function ClubStatsBar({ matchCount, winCount, drawCount, lossCount }: ClubStatsBarProps) {
  const winRate = matchCount > 0 ? Math.round((winCount / matchCount) * 100) : 0;

  return (
    <View style={styles.bar}>
      <StatItem label="경기" value={matchCount} />
      <Divider />
      <StatItem label="승" value={winCount} highlight />
      <Divider />
      <StatItem label="무" value={drawCount} />
      <Divider />
      <StatItem label="패" value={lossCount} />
      <Divider />
      <StatItem label="승률" value={`${winRate}%`} />
    </View>
  );
}

function StatItem({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <View style={styles.statItem}>
      <TextBox variant="body1Bold" color={highlight ? colors.blue500 : colors.grey900}>
        {value}
      </TextBox>
      <TextBox variant="caption" color={colors.grey500}>{label}</TextBox>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing[4],
    borderWidth: 1,
    borderColor: colors.grey200,
    borderRadius: 16,
    backgroundColor: colors.background,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: colors.grey200,
  },
});
