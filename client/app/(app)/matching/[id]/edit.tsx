import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { MatchEditContainer } from '@/src/features/matching/ui/container/MatchEditContainer';

export default function MatchEditPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: '매칭 수정' }} />
      <MatchEditContainer postId={id} />
    </>
  );
}
