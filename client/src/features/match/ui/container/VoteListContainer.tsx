import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { Skeleton, ScreenLayout, Spacing, spacing } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { useMyClub } from '@/src/features/club/data/hooks/useClub';
import { useMatches } from '../../data/hooks/useMatch';
import { VoteListView } from '../view/VoteListView';

type FilterTab = 'upcoming' | 'past';

function VoteListSkeleton() {
  return (
    <ScreenLayout>
      <View style={styles.skeleton}>
        <Skeleton width="100%" height={120} borderRadius={12} />
        <Spacing size={3} />
        <Skeleton width="100%" height={120} borderRadius={12} />
        <Spacing size={3} />
        <Skeleton width="100%" height={120} borderRadius={12} />
      </View>
    </ScreenLayout>
  );
}

function VoteListContent() {
  const [activeTab, setActiveTab] = useState<FilterTab>('upcoming');
  const { data: club } = useMyClub();

  const clubId = club?.id ?? '';
  const { data, fetchNextPage, hasNextPage } = useMatches(clubId);

  const matches = data.pages.flatMap((p) => p.items);
  const totalMembers = club?.currentMemberCount ?? 0;
  const isCaptainOrVice =
    club?.myRole === 'CAPTAIN' || club?.myRole === 'VICE_CAPTAIN';

  return (
    <VoteListView
      matches={matches}
      activeTab={activeTab}
      totalMembers={totalMembers}
      hasNextPage={hasNextPage ?? false}
      isCaptainOrVice={isCaptainOrVice}
      onTabChange={setActiveTab}
      onMatchPress={(matchId) =>
        router.push(`/(app)/vote/${matchId}` as Href)
      }
      onCreateMatch={() => router.push('/(app)/vote/create' as Href)}
      onLoadMore={() => fetchNextPage()}
    />
  );
}

export function VoteListContainer() {
  return (
    <AsyncBoundary loadingFallback={<VoteListSkeleton />}>
      <VoteListContent />
    </AsyncBoundary>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    padding: spacing[4],
    paddingTop: spacing[6],
  },
});
