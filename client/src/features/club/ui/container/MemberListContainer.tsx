import React, { useState } from 'react';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { useClubMembers } from '../../data/hooks/useClub';
import { MemberListView } from '../view/MemberListView';

interface MemberListContainerProps {
  clubId: string;
}

/**
 * 팀원 목록 Container.
 * 무한 스크롤 + 필터 상태 관리.
 */
export function MemberListContainer({ clubId }: MemberListContainerProps) {
  const [filter, setFilter] = useState('');

  const { data, isLoading, fetchNextPage, hasNextPage } = useClubMembers(clubId);

  const allMembers = data?.pages.flatMap((p) => p.data) ?? [];

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
      isLoading={isLoading}
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
