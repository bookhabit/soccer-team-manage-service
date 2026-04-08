import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { MemberListContainer } from '@/src/features/club/ui/container/MemberListContainer';

export default function MembersScreen() {
  const { clubId } = useLocalSearchParams<{ clubId: string }>();
  return <MemberListContainer clubId={clubId} />;
}
