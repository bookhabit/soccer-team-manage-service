import React from 'react';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { useMyApplications } from '../../data/hooks/useMatchApplications';
import { MyApplicationsView, MyApplicationsSkeleton } from '../view/MyApplicationsView';

function MyApplicationsContent() {
  const { data } = useMyApplications();
  const applications = data?.items ?? [];

  return (
    <MyApplicationsView
      applications={applications}
      onPostPress={(postId) => router.push(`/(app)/matching/${postId}` as Href)}
    />
  );
}

/**
 * 내 신청 목록 Container.
 */
export function MyApplicationsContainer() {
  return (
    <AsyncBoundary loadingFallback={<MyApplicationsSkeleton />}>
      <MyApplicationsContent />
    </AsyncBoundary>
  );
}
