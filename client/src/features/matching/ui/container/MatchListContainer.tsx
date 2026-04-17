import React, { useState, useCallback } from 'react';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { useMatchPosts } from '../../data/hooks/useMatchPosts';
import type { MatchPostFilters } from '../../data/schemas/matchPost.schema';
import { MatchListView, MatchListSkeleton } from '../view/MatchListView';

type FilterState = Omit<MatchPostFilters, 'cursor' | 'limit' | 'dateFrom' | 'dateTo'>;

function MatchListContent({ filters, onFilterChange }: { filters: FilterState; onFilterChange: (f: Partial<MatchPostFilters>) => void }) {
  const { data, fetchNextPage, isFetchingNextPage, isPending } = useMatchPosts(filters);

  if (isPending) return <MatchListSkeleton />;

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

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
 * 전체 매칭 목록 Container. 필터 상태를 관리한다.
 * keepPreviousData로 필터 변경 시 기존 목록을 유지하며 백그라운드 갱신.
 */
export function MatchListContainer() {
  const [filters, setFilters] = useState<FilterState>({});

  const handleFilterChange = useCallback((next: Partial<MatchPostFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  return <MatchListContent filters={filters} onFilterChange={handleFilterChange} />;
}
