import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { Skeleton, ScreenLayout, spacing } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { usePosts } from '../../data/hooks/usePost';
import { useMyClub } from '../../data/hooks/useClub';
import { BoardView } from '../view/BoardView';
import type { PostType } from '../../data/schemas/post.schema';

interface BoardContainerProps {
  clubId: string;
}

function BoardSkeleton() {
  return (
    <ScreenLayout>
      <View style={{ height: 44, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }} />
      <View style={{ padding: spacing[4], gap: spacing[3] }}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} width="100%" height={72} borderRadius={8} />
        ))}
      </View>
    </ScreenLayout>
  );
}

function BoardInner({ clubId }: BoardContainerProps) {
  const [activeTab, setActiveTab] = useState<PostType | undefined>(undefined);
  const { data: myClub } = useMyClub();
  const { data, fetchNextPage, hasNextPage } = usePosts(clubId, activeTab);

  const posts = data.pages.flatMap((p) => p.data);
  const isMember = myClub?.id === clubId;

  return (
    <BoardView
      posts={posts}
      activeTab={activeTab}
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

export function BoardContainer({ clubId }: BoardContainerProps) {
  return (
    <AsyncBoundary loadingFallback={<BoardSkeleton />}>
      <BoardInner clubId={clubId} />
    </AsyncBoundary>
  );
}
