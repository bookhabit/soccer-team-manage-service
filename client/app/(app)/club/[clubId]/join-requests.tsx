import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { JoinRequestsManageContainer } from '@/src/features/club/ui/container/JoinRequestsManageContainer';

export default function JoinRequestsScreen() {
  const { clubId } = useLocalSearchParams<{ clubId: string }>();
  return <JoinRequestsManageContainer clubId={clubId} />;
}
