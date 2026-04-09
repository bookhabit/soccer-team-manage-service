import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { Skeleton, ScreenLayout, spacing } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { useClubMembers } from '../../data/hooks/useClub';
import { MemberListView } from '../view/MemberListView';

interface MemberListContainerProps {
  clubId: string;
}

function MemberListSkeleton() {
  return (
    <ScreenLayout>
      <View style={{ padding: spacing[4], gap: spacing[3] }}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
            <Skeleton width={44} height={44} borderRadius={22} />
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton width="50%" height={16} />
              <Skeleton width="30%" height={12} />
            </View>
          </View>
        ))}
      </View>
    </ScreenLayout>
  );
}

function MemberListContent({ clubId }: MemberListContainerProps) {
  const [filter, setFilter] = useState('');

  const { data, fetchNextPage, hasNextPage } = useClubMembers(clubId);

  const allMembers = data.pages.flatMap((p) => p.data);

  const filteredMembers = filter
    ? allMembers.filter(
        (m) =>
          m.name.toLowerCase().includes(filter.toLowerCase()) ||
          (m.position && m.position.toLowerCase().includes(filter.toLowerCase())),
      )
    : allMembers;

  return (
    <MemberListView
      members={filteredMembers}
      hasNextPage={hasNextPage ?? false}
      filter={filter}
      onFilterChange={setFilter}
      onLoadMore={() => fetchNextPage()}
      onSelectMember={(userId) =>
        router.push(`/(app)/club/${clubId}/members/${userId}` as Href)
      }
    />
  );
}

export function MemberListContainer({ clubId }: MemberListContainerProps) {
  return (
    <AsyncBoundary loadingFallback={<MemberListSkeleton />}>
      <MemberListContent clubId={clubId} />
    </AsyncBoundary>
  );
}
