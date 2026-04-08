import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { DissolveVoteContainer } from '@/src/features/club/ui/container/DissolveVoteContainer';

export default function DissolveScreen() {
  const { clubId } = useLocalSearchParams<{ clubId: string }>();
  return <DissolveVoteContainer clubId={clubId} />;
}
