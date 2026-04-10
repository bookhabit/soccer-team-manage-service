import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { MatchDetailContainer } from '@/src/features/match/ui/container';

/**
 * 경기 상세 — 투표 현황 + BEFORE/DURING/AFTER 상태 분기.
 */
export default function MatchDetailScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  return <MatchDetailContainer matchId={matchId} />;
}
