import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { ApplicationListContainer } from '@/src/features/mercenary/ui/container/ApplicationListContainer';

export default function ApplicationListPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <AsyncBoundary>
      <ApplicationListContainer postId={id} />
    </AsyncBoundary>
  );
}
