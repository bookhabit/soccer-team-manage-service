import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { MatchPostDetailContainer } from '@/src/features/matching/ui/container/MatchPostDetailContainer';

export default function MatchPostDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: '매칭 상세' }} />
      <MatchPostDetailContainer postId={id} />
    </>
  );
}
