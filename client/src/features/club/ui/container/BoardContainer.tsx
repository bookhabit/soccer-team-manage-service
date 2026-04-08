import React, { useState } from 'react';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { usePosts } from '../../data/hooks/usePost';
import { useMyClub } from '../../data/hooks/useClub';
import { BoardView } from '../view/BoardView';
import type { PostType } from '../../data/schemas/post.schema';

interface BoardContainerProps {
  clubId: string;
}

/**
 * 클럽 게시판 Container.
 * 탭 필터 상태 관리 + 무한 스크롤.
 */
export function BoardContainer({ clubId }: BoardContainerProps) {
  const [activeTab, setActiveTab] = useState<PostType | undefined>(undefined);
  const { data: myClub } = useMyClub();

  const { data, isLoading, fetchNextPage, hasNextPage } = usePosts(clubId, activeTab);

  const posts = data?.pages.flatMap((p) => p.data) ?? [];
  const isMember = myClub?.id === clubId;

  return (
    <BoardView
      posts={posts}
      activeTab={activeTab}
      isLoading={isLoading}
      hasNextPage={hasNextPage ?? false}
      canWrite={isMember}
      onTabChange={setActiveTab}
      onLoadMore={() => fetchNextPage()}
      onSelectPost={(postId) =>
        router.push(`/(app)/club/${clubId}/board/${postId}` as Href)
      }
      onWrite={() => router.push(`/(app)/club/${clubId}/board/write` as Href)}
    />
  );
}
