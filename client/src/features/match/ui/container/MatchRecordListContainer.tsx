import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { Skeleton, ScreenLayout, Spacing, spacing } from '@ui';
import { useMatches } from '../../data/hooks/useMatch';
import { MatchRecordListView } from '../view/MatchRecordListView';

interface MatchRecordListContainerProps {
  clubId: string;
}

function MatchRecordListSkeleton() {
  return (
    <ScreenLayout>
      <View style={styles.skeleton}>
        <Skeleton width="100%" height={80} borderRadius={12} />
        <Spacing size={3} />
        <Skeleton width="100%" height={96} borderRadius={12} />
        <Spacing size={3} />
        <Skeleton width="100%" height={96} borderRadius={12} />
      </View>
    </ScreenLayout>
  );
}

export function MatchRecordListContainer({ clubId }: MatchRecordListContainerProps) {
  const { data, fetchNextPage, hasNextPage, isPending } = useMatches(clubId);

  if (isPending) return <MatchRecordListSkeleton />;

  const allMatches = data?.pages.flatMap((p) => p.items) ?? [];
  const pastMatches = allMatches.filter(
    (m) => new Date(m.endAt).getTime() < Date.now() && m.isRecordSubmitted,
  );

  const stats = pastMatches.reduce(
    (acc, m) => {
      if (m.homeScore == null || m.awayScore == null) return acc;
      if (m.homeScore > m.awayScore) acc.win++;
      else if (m.homeScore < m.awayScore) acc.loss++;
      else acc.draw++;
      return acc;
    },
    { win: 0, draw: 0, loss: 0 },
  );

  return (
    <MatchRecordListView
      matches={pastMatches}
      stats={stats}
      hasNextPage={hasNextPage ?? false}
      onMatchPress={(matchId) => router.push(`/(app)/vote/${matchId}/detail` as Href)}
      onLoadMore={() => fetchNextPage()}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    padding: spacing[4],
  },
});
