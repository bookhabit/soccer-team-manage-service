import React, { useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { ScreenLayout, TextBox, Spacing, Skeleton, colors, spacing } from '@ui';
import { useMatches } from '../../data/hooks/useMatch';
import { MatchCard } from '../components/MatchCard';
import { MatchHistoryFilterBar } from '../components/MatchHistoryFilterBar';
import { computeMatchStatus } from '../../data/schemas/match.schema';
import type { MatchHistoryFilter } from '../../data/schemas/match.schema';

interface Props {
  clubId: string;
  totalMembers?: number;
  onMatchPress: (matchId: string) => void;
}

function MatchHistorySkeleton() {
  return (
    <ScreenLayout>
      <View style={styles.skeleton}>
        <Skeleton width="40%" height={28} borderRadius={6} />
        <Spacing size={4} />
        <Skeleton width="100%" height={130} borderRadius={12} />
        <Spacing size={3} />
        <Skeleton width="100%" height={130} borderRadius={12} />
        <Spacing size={3} />
        <Skeleton width="100%" height={130} borderRadius={12} />
      </View>
    </ScreenLayout>
  );
}

export function MatchHistoryContainer({ clubId, totalMembers = 0, onMatchPress }: Props) {
  const [filter, setFilter] = useState<MatchHistoryFilter>({});
  const { data, fetchNextPage, hasNextPage, isPending } = useMatches(clubId, filter);

  if (isPending) return <MatchHistorySkeleton />;

  const pastMatches = (data?.pages.flatMap((p) => p.items) ?? []).filter(
    (m) => computeMatchStatus(m.startAt, m.endAt) === 'AFTER',
  );

  return (
    <ScreenLayout>
      <FlatList
        data={pastMatches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <TextBox variant="heading3" color={colors.grey900} style={styles.title}>
              경기 기록
            </TextBox>
            <MatchHistoryFilterBar filter={filter} onChange={setFilter} />
            <Spacing size={3} />
          </>
        }
        ItemSeparatorComponent={() => <Spacing size={3} />}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            totalMembers={totalMembers}
            onPress={() => onMatchPress(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <TextBox variant="body2" color={colors.grey400}>
              {filter.type || filter.myMatches
                ? '조건에 맞는 경기가 없습니다.'
                : '종료된 경기가 없습니다.'}
            </TextBox>
          </View>
        }
        onEndReached={hasNextPage ? () => fetchNextPage() : undefined}
        onEndReachedThreshold={0.3}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: spacing[10],
  },
  title: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    marginBottom: spacing[3],
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing[16],
  },
  skeleton: {
    padding: spacing[4],
    paddingTop: spacing[6],
  },
});
