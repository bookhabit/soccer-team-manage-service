import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { MemberDetailContainer } from '@/src/features/club/ui/container/MemberDetailContainer';

export default function MemberDetailScreen() {
  const { clubId, memberId } = useLocalSearchParams<{ clubId: string; memberId: string }>();
  return <MemberDetailContainer clubId={clubId} userId={memberId} />;
}
