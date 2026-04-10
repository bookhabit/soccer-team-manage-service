import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { MatchRecordListContainer } from '@/src/features/match/ui/container';

/**
 * 클럽 경기 기록 목록 — 지난 경기 목록.
 */
export default function MatchRecordListScreen() {
  const { clubId } = useLocalSearchParams<{ clubId: string }>();
  return <MatchRecordListContainer clubId={clubId} />;
}
