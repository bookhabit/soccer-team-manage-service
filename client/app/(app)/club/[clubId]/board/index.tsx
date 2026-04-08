import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { BoardContainer } from '@/src/features/club/ui/container/BoardContainer';

export default function BoardScreen() {
  const { clubId } = useLocalSearchParams<{ clubId: string }>();
  return <BoardContainer clubId={clubId} />;
}
