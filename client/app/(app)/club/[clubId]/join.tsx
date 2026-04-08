import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { JoinRequestContainer } from '@/src/features/club/ui/container/JoinRequestContainer';

export default function JoinScreen() {
  const { clubId } = useLocalSearchParams<{ clubId: string }>();
  return <JoinRequestContainer clubId={clubId} />;
}
