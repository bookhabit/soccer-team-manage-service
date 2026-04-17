import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { MatchFeedDetailContainer } from '@/src/features/match-feed/ui/container/MatchFeedDetailContainer';

export default function MatchFeedDetailScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  return (
    <>
      <Stack.Screen options={{ title: '경기 결과' }} />
      <MatchFeedDetailContainer matchId={matchId} />
    </>
  );
}
