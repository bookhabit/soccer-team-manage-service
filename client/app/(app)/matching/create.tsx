import React from 'react';
import { Stack } from 'expo-router';
import { MatchCreateContainer } from '@/src/features/matching/ui/container/MatchCreateContainer';

export default function MatchCreatePage() {
  return (
    <>
      <Stack.Screen options={{ title: '매칭 등록' }} />
      <MatchCreateContainer />
    </>
  );
}
