import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { ScreenLayout, colors } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { MercenaryPostListContainer } from './MercenaryPostListContainer';
import { MercenaryAvailabilityListContainer } from './MercenaryAvailabilityListContainer';

const PostsScene = () => (
  <AsyncBoundary>
    <MercenaryPostListContainer />
  </AsyncBoundary>
);

const AvailabilitiesScene = () => (
  <AsyncBoundary>
    <MercenaryAvailabilityListContainer />
  </AsyncBoundary>
);

const renderScene = SceneMap({
  posts: PostsScene,
  availabilities: AvailabilitiesScene,
});

const ROUTES = [
  { key: 'posts', title: '용병 구함' },
  { key: 'availabilities', title: '용병 가능' },
];

export function MercenaryTabContainer() {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);

  return (
    <ScreenLayout>
      <TabView
        style={{ flex: 1 }}
        navigationState={{ index, routes: ROUTES }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            style={{
              backgroundColor: colors.background,
              borderBottomWidth: 1,
              borderBottomColor: colors.grey100,
              elevation: 0,
              shadowOpacity: 0,
            }}
            indicatorStyle={{ backgroundColor: colors.primary, height: 2 }}
            activeColor={colors.primary}
            inactiveColor={colors.grey500}
            tabStyle={{ paddingVertical: 4 }}
            pressColor={colors.blue50}
          />
        )}
      />
    </ScreenLayout>
  );
}
