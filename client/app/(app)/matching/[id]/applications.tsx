import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScreenLayout } from '@ui';
import { ApplicationListContainer } from '@/src/features/matching/ui/container/ApplicationListContainer';

export default function ApplicationListPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: '신청 목록' }} />
      <ScreenLayout>
        <ApplicationListContainer postId={id} />
      </ScreenLayout>
    </>
  );
}
