import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { HeadToHeadContainer } from '@/src/features/head-to-head/ui/container';

export default function HeadToHeadScreen() {
  const { clubId, opponentClubId } = useLocalSearchParams<{
    clubId: string;
    opponentClubId: string;
  }>();

  return (
    <>
      <Stack.Screen options={{ title: '상대 전적' }} />
      <HeadToHeadContainer clubId={clubId} opponentClubId={opponentClubId} />
    </>
  );
}
