import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { RecordContainer } from '@/src/features/match/ui/container';

/**
 * 경기 기록 입력 (관리자 전용, 경기 후 활성화).
 */
export default function RecordScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  return <RecordContainer matchId={matchId} />;
}
