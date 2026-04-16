import React from 'react';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { MercenaryAvailabilityCreateContainer } from '@/src/features/mercenary/ui/container/MercenaryAvailabilityCreateContainer';

export default function MercenaryAvailabilityCreatePage() {
  return (
    <AsyncBoundary>
      <MercenaryAvailabilityCreateContainer />
    </AsyncBoundary>
  );
}
