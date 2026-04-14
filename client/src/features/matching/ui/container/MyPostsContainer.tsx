import React from 'react';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { EmptyBoundary } from '@/src/shared/ui/server-state-handling/EmptyBoundary';
import { useMyMatchPosts } from '../../data/hooks/useMatchPosts';
import { MyPostsView, MyPostsSkeleton } from '../view/MyPostsView';

function MyPostsContent() {
  const { data } = useMyMatchPosts();
  const posts = data?.items ?? [];

  return (
    <EmptyBoundary
      data={posts.length > 0 ? posts : null}
      fallback={<MyPostsView posts={[]} onPostPress={() => {}} />}
    >
      <MyPostsView
        posts={posts}
        onPostPress={(id) => router.push(`/(app)/matching/${id}` as Href)}
      />
    </EmptyBoundary>
  );
}

/**
 * 내 팀 매칭 게시글 목록 Container.
 */
export function MyPostsContainer() {
  return (
    <AsyncBoundary loadingFallback={<MyPostsSkeleton />}>
      <MyPostsContent />
    </AsyncBoundary>
  );
}
