import React, { useState } from 'react';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { useClubSearch } from '../../data/hooks/useClub';
import { ClubSearchView } from '../view/ClubSearchView';

/**
 * 클럽 검색 Container.
 * 검색어 상태를 관리하고 useClubSearch() 결과를 View에 주입.
 */
export function ClubSearchContainer() {
  const [query, setQuery] = useState('');

  const { data, isLoading, fetchNextPage, hasNextPage } = useClubSearch({
    name: query || undefined,
  });

  const clubs = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <ClubSearchView
      query={query}
      clubs={clubs}
      isLoading={isLoading}
      hasNextPage={hasNextPage ?? false}
      onQueryChange={setQuery}
      onLoadMore={() => fetchNextPage()}
      onSelectClub={(clubId) => router.push(`/(app)/club/${clubId}/join` as Href)}
    />
  );
}
