import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton, ScreenLayout, Spacing, spacing } from '@ui';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { useMatchFeedDetail } from '../../data/hooks/useMatchFeed';
import { MatchFeedDetailView } from '../view/MatchFeedDetailView';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { useMyClub } from '@/src/features/club/data/hooks/useClub';

interface MatchFeedDetailContainerProps {
  matchId: string;
}

function MatchFeedDetailSkeleton() {
  return (
    <ScreenLayout>
      <View style={styles.skeleton}>
        <Skeleton width="60%" height={24} borderRadius={6} />
        <Spacing size={2} />
        <Skeleton width="40%" height={16} borderRadius={6} />
        <Spacing size={4} />
        <Skeleton width="100%" height={80} borderRadius={12} />
        <Spacing size={3} />
        <Skeleton width="100%" height={120} borderRadius={12} />
      </View>
    </ScreenLayout>
  );
}

function MatchFeedDetailInner({ matchId }: MatchFeedDetailContainerProps) {
  const { data: detail } = useMatchFeedDetail(matchId);
  const { data: myClub } = useMyClub();

  const canGoH2H = detail.clubId === myClub?.id && detail.opponentClubId !== null;
  const onGoOpponentRecord = canGoH2H
    ? () =>
        router.push(
          `/(app)/club/${detail.clubId}/head-to-head/${detail.opponentClubId}` as Href,
        )
    : undefined;

  return (
    <MatchFeedDetailView
      detail={detail}
      onGoOpponentRecord={onGoOpponentRecord}
    />
  );
}

export function MatchFeedDetailContainer({ matchId }: MatchFeedDetailContainerProps) {
  return (
    <AsyncBoundary loadingFallback={<MatchFeedDetailSkeleton />}>
      <MatchFeedDetailInner matchId={matchId} />
    </AsyncBoundary>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    padding: spacing[4],
  },
});
