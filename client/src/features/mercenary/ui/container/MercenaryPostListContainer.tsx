import React from 'react';
import { router } from 'expo-router';
import { useMercenaryPosts } from '../../data/hooks/useMercenaryPosts';
import { MercenaryPostListView } from '../view/MercenaryPostListView';

export function MercenaryPostListContainer() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useMercenaryPosts();
  const posts = data.pages.flatMap((p) => p.items);

  return (
    <MercenaryPostListView
      posts={posts}
      onPostPress={(id) => router.push(`/(app)/mercenary/post/${id}` as any)}
      onCreatePress={() => router.push('/(app)/mercenary/post/create' as any)}
      onLoadMore={() => fetchNextPage()}
      hasNextPage={!!hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
}
