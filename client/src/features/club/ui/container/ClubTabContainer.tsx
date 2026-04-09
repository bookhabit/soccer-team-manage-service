import React from 'react';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { useMyClub } from '../../data/hooks/useClub';
import { ClubTabView } from '../view/ClubTabView';

/**
 * 클럽 탭 홈 Container.
 * useMyClub() 결과에 따라 미소속·대시보드 분기.
 */
function ClubTabInner() {
  const { data: club, isLoading, isError } = useMyClub();

  return (
    <ClubTabView
      club={club}
      isLoading={isLoading}
      isError={isError}
      onCreateClub={() => router.push('/(app)/club/create' as Href)}
      onSearchClub={() => router.push('/(app)/club/search' as Href)}
      onJoinByCode={() => router.push('/(app)/club/invite-enter' as Href)}
      onGoMembers={() => router.push(`/(app)/club/${club?.id}/members` as Href)}
      onGoBoard={() => router.push(`/(app)/club/${club?.id}/board` as Href)}
      onGoSettings={() => router.push(`/(app)/club/${club?.id}/settings` as Href)}
      onGoJoinRequests={() => router.push(`/(app)/club/${club?.id}/join-requests` as Href)}
    />
  );
}

export function ClubTabContainer() {
  return <ClubTabInner />;
}
