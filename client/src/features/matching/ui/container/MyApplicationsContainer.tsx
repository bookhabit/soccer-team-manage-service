import React from 'react';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { useMyApplications } from '../../data/hooks/useMatchApplications';
import { MyApplicationsView, MyApplicationsSkeleton } from '../view/MyApplicationsView';

/**
 * 내 신청 목록 Container.
 * 초기 로딩만 스켈레톤 표시, 탭 재진입 시 캐시 데이터 즉시 표시.
 */
export function MyApplicationsContainer() {
  const { data, isPending } = useMyApplications();

  if (isPending) return <MyApplicationsSkeleton />;

  const applications = data?.items ?? [];

  return (
    <MyApplicationsView
      applications={applications}
      onPostPress={(postId) => router.push(`/(app)/matching/${postId}` as Href)}
    />
  );
}
