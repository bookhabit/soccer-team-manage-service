import React, { useState } from 'react';
import { SafeAreaWrapper } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { MercenaryTabView, type MercenaryTab } from '../view/MercenaryTabView';
import { MercenaryPostListContainer } from './MercenaryPostListContainer';
import { MercenaryAvailabilityListContainer } from './MercenaryAvailabilityListContainer';

export function MercenaryTabContainer() {
  const [selectedTab, setSelectedTab] = useState<MercenaryTab>('posts');

  return (
    <SafeAreaWrapper edges={['top']}>
      <MercenaryTabView
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        postsContent={
          <AsyncBoundary>
            <MercenaryPostListContainer />
          </AsyncBoundary>
        }
        availabilitiesContent={
          <AsyncBoundary>
            <MercenaryAvailabilityListContainer />
          </AsyncBoundary>
        }
      />
    </SafeAreaWrapper>
  );
}
