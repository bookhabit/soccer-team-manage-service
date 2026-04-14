import React, { startTransition, useState } from 'react';
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: myClub } = useMyClub();
  const { data, fetchNextPage, hasNextPage, refetch } = usePosts(clubId, activeTab);

  const posts = data.pages.flatMap((p) => p.data);
  const isMember = myClub?.id === clubId;

  // startTransition: 탭 전환을 비긴급 업데이트로 처리
  // → Suspense fallback 없이 현재 UI를 유지하면서 백그라운드 fetch
  const handleTabChange = (tab: PostType | undefined) => {
    startTransition(() => setActiveTab(tab));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  return (
    <BoardView
      posts={posts}
      activeTab={activeTab}
      hasNextPage={hasNextPage ?? false}
      canWrite={isMember}
      isRefreshing={isRefreshing}
      onTabChange={handleTabChange}
      onLoadMore={() => fetchNextPage()}
      onRefresh={handleRefresh}
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
