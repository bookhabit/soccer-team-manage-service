import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import type { Href } from 'expo-router';
import { MatchHistoryContainer } from '@/src/features/match/ui/container/MatchHistoryContainer';

export default function MatchHistoryScreen() {
  const { clubId } = useLocalSearchParams<{ clubId: string }>();

  return (
    <MatchHistoryContainer
      clubId={clubId}
      onMatchPress={(matchId) => router.push(`/(app)/vote/${matchId}/detail` as Href)}
    />
  );
}
