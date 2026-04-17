import React, { useState } from 'react';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { useMatchFeed } from '../../data/hooks/useMatchFeed';
import { useMyClub } from '@/src/features/club/data/hooks/useClub';
import { MatchFeedView } from '../view/MatchFeedView';
import { MatchFeedLoadingView } from '../view/MatchFeedLoadingView';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import type { MatchFeedFilter } from '../../data/schemas/matchFeed.schema';

function MatchFeedInner() {
  const [filter, setFilter] = useState<MatchFeedFilter>({});

  const { data: club } = useMyClub();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useMatchFeed(filter);

  const items = data.pages.flatMap((p) => p.items);
  const isClubMember = !!club;

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleItemPress = (matchId: string) => {
    router.push(`/(app)/match-feed/${matchId}` as Href);
  };

  return (
    <MatchFeedView
      items={items}
      filter={filter}
      hasNextPage={!!hasNextPage}
      isLoadingMore={isFetchingNextPage}
      isClubMember={isClubMember}
      onFilterChange={setFilter}
      onLoadMore={handleLoadMore}
      onItemPress={handleItemPress}
    />
  );
}

export function MatchFeedContainer() {
  return (
    <AsyncBoundary loadingFallback={<MatchFeedLoadingView />}>
      <MatchFeedInner />
    </AsyncBoundary>
  );
}
