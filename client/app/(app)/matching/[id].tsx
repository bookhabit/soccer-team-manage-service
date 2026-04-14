import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { MatchDetailContainer } from '@/src/features/matching/ui/container/MatchDetailContainer';

export default function MatchDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: '매칭 상세' }} />
      <MatchDetailContainer postId={id} />
    </>
  );
}
