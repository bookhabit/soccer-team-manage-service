import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { ScreenLayout, TextBox, Spacing, Skeleton, colors, spacing } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { useMatches } from '../../data/hooks/useMatch';
import { MatchCard } from '../components/MatchCard';
import { computeMatchStatus } from '../../data/schemas/match.schema';

interface Props {
  clubId: string;
  totalMembers?: number;
  onMatchPress: (matchId: string) => void;
}

function MatchHistoryInner({ clubId, totalMembers = 0, onMatchPress }: Props) {
  const { data, fetchNextPage, hasNextPage } = useMatches(clubId);

  const pastMatches = data.pages
    .flatMap((p) => p.items)
    .filter((m) => computeMatchStatus(m.startAt, m.endAt) === 'AFTER');

  return (
    <ScreenLayout>
      <FlatList
        data={pastMatches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <TextBox variant="heading3" color={colors.grey900} style={styles.title}>
            경기 기록
          </TextBox>
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
              종료된 경기가 없습니다.
            </TextBox>
          </View>
        }
        onEndReached={hasNextPage ? () => fetchNextPage() : undefined}
        onEndReachedThreshold={0.3}
      />
    </ScreenLayout>
  );
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
  return (
    <AsyncBoundary loadingFallback={<MatchHistorySkeleton />}>
      <MatchHistoryInner
        clubId={clubId}
        totalMembers={totalMembers}
        onMatchPress={onMatchPress}
      />
    </AsyncBoundary>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  title: {
    marginBottom: spacing[4],
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
