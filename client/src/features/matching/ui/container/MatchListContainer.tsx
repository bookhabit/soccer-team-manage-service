import React, { useState, useCallback } from 'react';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { useMatchPosts } from '../../data/hooks/useMatchPosts';
import type { MatchPostFilters } from '../../data/schemas/matchPost.schema';
import { MatchListView, MatchListSkeleton } from '../view/MatchListView';

type FilterState = Omit<MatchPostFilters, 'cursor' | 'limit' | 'dateFrom' | 'dateTo'>;

function MatchListContent({ filters, onFilterChange }: { filters: FilterState; onFilterChange: (f: Partial<MatchPostFilters>) => void }) {
  const { data, fetchNextPage, isFetchingNextPage } = useMatchPosts(filters);
  const posts = data.pages.flatMap((page) => page.items);

  return (
    <MatchListView
      posts={posts}
      filters={filters}
      onFilterChange={onFilterChange}
      onPostPress={(id) => router.push(`/(app)/matching/${id}` as Href)}
      onLoadMore={() => fetchNextPage()}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
}

/**
 * 전체 매칭 목록 Container. 필터 상태를 관리하고 AsyncBoundary로 감싼다.
 */
export function MatchListContainer() {
  const [filters, setFilters] = useState<FilterState>({});

  const handleFilterChange = useCallback((next: Partial<MatchPostFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  return (
    <AsyncBoundary loadingFallback={<MatchListSkeleton />}>
      <MatchListContent filters={filters} onFilterChange={handleFilterChange} />
    </AsyncBoundary>
  );
}
