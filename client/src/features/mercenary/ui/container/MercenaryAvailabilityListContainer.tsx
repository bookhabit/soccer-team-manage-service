import React from 'react';
import { router } from 'expo-router';
import { useMercenaryAvailabilities } from '../../data/hooks/useMercenaryAvailabilities';
import { MercenaryAvailabilityListView } from '../view/MercenaryAvailabilityListView';

export function MercenaryAvailabilityListContainer() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useMercenaryAvailabilities();
  const items = data.pages.flatMap((p) => p.items);

  return (
    <MercenaryAvailabilityListView
      items={items}
      onItemPress={(id) => router.push(`/(app)/mercenary/availability/${id}` as any)}
      onCreatePress={() => router.push('/(app)/mercenary/availability/create' as any)}
      onLoadMore={() => fetchNextPage()}
      hasNextPage={!!hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
}
