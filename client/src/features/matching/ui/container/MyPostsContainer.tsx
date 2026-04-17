import React from 'react';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { useMyMatchPosts } from '../../data/hooks/useMatchPosts';
import { MyPostsView, MyPostsSkeleton } from '../view/MyPostsView';

/**
 * 내 팀 매칭 게시글 목록 Container.
 * 초기 로딩만 스켈레톤 표시, 탭 재진입 시 캐시 데이터 즉시 표시.
 */
export function MyPostsContainer() {
  const { data, isPending } = useMyMatchPosts();

  if (isPending) return <MyPostsSkeleton />;

  const posts = data?.items ?? [];

  return (
    <MyPostsView
      posts={posts}
      onPostPress={(id) => router.push(`/(app)/matching/${id}` as Href)}
    />
  );
}
