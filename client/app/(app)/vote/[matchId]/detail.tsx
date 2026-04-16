import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ClubMatchDetailContainer } from '@/src/features/match/ui/container';

/**
 * 경기 상세 4탭 — 기록·댓글·영상·상대팀 평가.
 */
export default function ClubMatchDetailScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  return <ClubMatchDetailContainer matchId={matchId} />;
}
