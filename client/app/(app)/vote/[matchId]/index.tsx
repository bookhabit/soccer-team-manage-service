import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { MatchProgressContainer } from '@/src/features/match/ui/container';

/**
 * 경기 상세 — 투표 현황 + BEFORE/DURING/AFTER 상태 분기.
 */
export default function MatchProgressScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  return <MatchProgressContainer matchId={matchId} />;
}
