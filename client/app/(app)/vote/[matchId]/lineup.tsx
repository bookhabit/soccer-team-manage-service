import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { LineupContainer } from '@/src/features/match/ui/container';

/**
 * 포지션 배정 (관리자 전용).
 */
export default function LineupScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  return <LineupContainer matchId={matchId} />;
}
