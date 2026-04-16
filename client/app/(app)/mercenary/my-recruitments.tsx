import React from 'react';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { MyRecruitmentsContainer } from '@/src/features/mercenary/ui/container/MyRecruitmentsContainer';

export default function MyRecruitmentsPage() {
  return (
    <AsyncBoundary>
      <MyRecruitmentsContainer />
    </AsyncBoundary>
  );
}
