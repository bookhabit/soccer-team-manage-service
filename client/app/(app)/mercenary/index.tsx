import React from 'react';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { MercenaryTabContainer } from '@/src/features/mercenary/ui/container/MercenaryTabContainer';

export default function MercenaryPage() {
  return (
    <AsyncBoundary>
      <MercenaryTabContainer />
    </AsyncBoundary>
  );
}
