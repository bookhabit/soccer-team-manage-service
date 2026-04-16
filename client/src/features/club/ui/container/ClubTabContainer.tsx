import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { Skeleton, Spacing, ScreenLayout, spacing } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { EmptyBoundary } from '@/src/shared/ui/server-state-handling/EmptyBoundary';
import { useMyClub } from '../../data/hooks/useClub';
import { ClubTabView } from '../view/ClubTabView';
import { NoClubView } from '../components/NoClubView';

function ClubTabSkeleton() {
  return (
    <ScreenLayout>
      <View style={{ padding: spacing[4] }}>
        <Skeleton width="100%" height={120} borderRadius={16} />
        <Spacing size={3} />
        <Skeleton width="100%" height={80} borderRadius={16} />
        <Spacing size={3} />
        <Skeleton width="100%" height={80} borderRadius={16} />
      </View>
    </ScreenLayout>
  );
}

function ClubTabContent() {
  const { data: club } = useMyClub();

  return (
    <EmptyBoundary
      data={club}
      fallback={
        <NoClubView
          onCreateClub={() => router.push('/(app)/club/create' as Href)}
          onSearchClub={() => router.push('/(app)/club/search' as Href)}
          onJoinByCode={() => router.push('/(app)/club/invite-enter' as Href)}
        />
      }
    >
      <ClubTabView
        club={club!}
        onGoMembers={() => router.push(`/(app)/club/${club?.id}/members` as Href)}
        onGoBoard={() => router.push(`/(app)/club/${club?.id}/board` as Href)}
        onGoSettings={() => router.push(`/(app)/club/${club?.id}/settings` as Href)}
        onGoJoinRequests={() => router.push(`/(app)/club/${club?.id}/join-requests` as Href)}
        onGoMatches={() => router.push(`/(app)/club/${club?.id}/matches` as Href)}
      />
    </EmptyBoundary>
  );
}

export function ClubTabContainer() {
  return (
    <AsyncBoundary loadingFallback={<ClubTabSkeleton />}>
      <ClubTabContent />
    </AsyncBoundary>
  );
}
