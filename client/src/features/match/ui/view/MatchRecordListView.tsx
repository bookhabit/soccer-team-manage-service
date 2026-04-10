import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { TextBox, ScreenLayout, Spacing, colors, spacing } from '@ui';
import { MatchRecordCard } from '../components/MatchRecordCard';
import type { MatchSummary } from '../../data/schemas/match.schema';

interface RecordStats {
  win: number;
  draw: number;
  loss: number;
}

interface MatchRecordListViewProps {
  matches: MatchSummary[];
  stats: RecordStats;
  hasNextPage: boolean;
  onMatchPress: (matchId: string) => void;
  onLoadMore: () => void;
}

export function MatchRecordListView({
  matches,
  stats,
  hasNextPage,
  onMatchPress,
  onLoadMore,
}: MatchRecordListViewProps) {
  return (
    <ScreenLayout>
      {/* 전적 요약 배너 */}
      <View style={styles.statsBanner}>
        <StatBox label="승" value={stats.win} color={colors.blue500} />
        <View style={styles.statsDivider} />
        <StatBox label="무" value={stats.draw} color={colors.grey500} />
        <View style={styles.statsDivider} />
        <StatBox label="패" value={stats.loss} color={colors.red500} />
      </View>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <Spacing size={3} />}
        renderItem={({ item }) => (
          <MatchRecordCard match={item} onPress={() => onMatchPress(item.id)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <TextBox variant="body2" color={colors.grey400}>경기 기록이 없습니다.</TextBox>
          </View>
        }
        onEndReached={hasNextPage ? onLoadMore : undefined}
        onEndReachedThreshold={0.3}
      />
    </ScreenLayout>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.statBox}>
      <TextBox variant="heading2" color={color}>{value}</TextBox>
      <TextBox variant="caption" color={colors.grey500}>{label}</TextBox>
    </View>
  );
}

const styles = StyleSheet.create({
  statsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: spacing[4],
    backgroundColor: colors.grey50,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  statBox: {
    alignItems: 'center',
    gap: 2,
  },
  statsDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.grey200,
  },
  list: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing[10],
  },
});
