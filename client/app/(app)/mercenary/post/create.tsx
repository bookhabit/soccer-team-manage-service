import React from 'react';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { MercenaryPostCreateContainer } from '@/src/features/mercenary/ui/container/MercenaryPostCreateContainer';

export default function MercenaryPostCreatePage() {
  return (
    <AsyncBoundary>
      <MercenaryPostCreateContainer />
    </AsyncBoundary>
  );
}
