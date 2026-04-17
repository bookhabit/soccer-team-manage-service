import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { Skeleton, ScreenLayout, Spacing, spacing } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { EmptyBoundary } from '@/src/shared/ui/server-state-handling/EmptyBoundary';
import { useMyClub } from '@/src/features/club/data/hooks/useClub';
import { NoClubView } from '@/src/features/club/ui/components/NoClubView';
import type { ClubDetail } from '@/src/features/club/data/schemas/club.schema';
import { useMatches } from '../../data/hooks/useMatch';
import { VoteListView } from '../view/VoteListView';

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

function VoteListInner({ club }: { club: ClubDetail }) {
  const { data, fetchNextPage, hasNextPage, isPending } = useMatches(club.id);

  if (isPending) return <VoteListSkeleton />;

  const matches = data?.pages.flatMap((p) => p.items) ?? [];
  const isCaptainOrVice = club.myRole === 'CAPTAIN' || club.myRole === 'VICE_CAPTAIN';

  return (
    <VoteListView
      matches={matches}
      totalMembers={club.currentMemberCount}
      hasNextPage={hasNextPage ?? false}
      isCaptainOrVice={isCaptainOrVice}
      onMatchPress={(matchId) => router.push(`/(app)/vote/${matchId}` as Href)}
      onCreateMatch={() => router.push('/(app)/vote/create' as Href)}
      onLoadMore={() => fetchNextPage()}
    />
  );
}

function VoteListContent() {
  const { data: club } = useMyClub();

  return (
    <EmptyBoundary
      data={club}
      fallback={
        <NoClubView
          onCreateClub={() => router.push('/(app)/club/create' as Href)}
          onSearchClub={() => router.push('/(app)/club/search' as Href)}
          onJoinByCode={() => router.push('/(app)/club/invite-enter' as Href)}
        />
      }
    >
      <VoteListInner club={club!} />
    </EmptyBoundary>
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
