import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton, ScreenLayout, Spacing, spacing } from '@ui';
import { useMatchFeedDetail } from '../../data/hooks/useMatchFeed';
import { MatchFeedDetailView } from '../view/MatchFeedDetailView';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';

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

  return (
    <MatchFeedDetailView
      detail={detail}
      onGoOpponentRecord={undefined}
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
