import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { MercenaryPostDetailContainer } from '@/src/features/mercenary/ui/container/MercenaryPostDetailContainer';

export default function MercenaryPostDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <AsyncBoundary>
      <MercenaryPostDetailContainer postId={id} />
    </AsyncBoundary>
  );
}
