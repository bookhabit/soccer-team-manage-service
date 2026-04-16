import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { MercenaryAvailabilityDetailContainer } from '@/src/features/mercenary/ui/container/MercenaryAvailabilityDetailContainer';

export default function MercenaryAvailabilityDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <AsyncBoundary>
      <MercenaryAvailabilityDetailContainer availId={id} />
    </AsyncBoundary>
  );
}
