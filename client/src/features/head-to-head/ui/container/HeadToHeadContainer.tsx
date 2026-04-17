import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenLayout, Skeleton, Spacing, spacing } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { useHeadToHead } from '../../data/hooks/useHeadToHead';
import { HeadToHeadView } from '../view/HeadToHeadView';
import { H2HSummarySkeleton, H2HHistoryItemSkeleton } from '../components';

interface HeadToHeadContainerProps {
  clubId: string;
  opponentClubId: string;
}

function HeadToHeadSkeleton() {
  return (
    <ScreenLayout>
      <H2HSummarySkeleton />
      <View style={styles.skeletonList}>
        <H2HHistoryItemSkeleton />
        <H2HHistoryItemSkeleton />
        <H2HHistoryItemSkeleton />
      </View>
    </ScreenLayout>
  );
}

function HeadToHeadContent({ clubId, opponentClubId }: HeadToHeadContainerProps) {
  const { summary, history, hasNextPage, fetchNextPage } = useHeadToHead(
    clubId,
    opponentClubId,
  );

  return (
    <HeadToHeadView
      summary={summary}
      history={history}
      hasNextPage={hasNextPage}
      onLoadMore={fetchNextPage}
    />
  );
}

export function HeadToHeadContainer({ clubId, opponentClubId }: HeadToHeadContainerProps) {
  return (
    <AsyncBoundary loadingFallback={<HeadToHeadSkeleton />}>
      <HeadToHeadContent clubId={clubId} opponentClubId={opponentClubId} />
    </AsyncBoundary>
  );
}

const styles = StyleSheet.create({
  skeletonList: {
    paddingTop: spacing[2],
  },
});
