import React, { useState } from 'react';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { useMatchFeed } from '../../data/hooks/useMatchFeed';
import { useMyClub } from '@/src/features/club/data/hooks/useClub';
import { MatchFeedView } from '../view/MatchFeedView';
import { MatchFeedLoadingView } from '../view/MatchFeedLoadingView';
import type { MatchFeedFilter } from '../../data/schemas/matchFeed.schema';

export function MatchFeedContainer() {
  const [filter, setFilter] = useState<MatchFeedFilter>({});

  const { data: club } = useMyClub();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = useMatchFeed(filter);

  if (isPending) return <MatchFeedLoadingView />;

  const items = data?.pages.flatMap((p) => p.items) ?? [];
  const isClubMember = !!club;

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
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
      onItemPress={(matchId) => router.push(`/(app)/match-feed/${matchId}` as Href)}
    />
  );
}
