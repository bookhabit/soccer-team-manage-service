import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import { colors, spacing } from '@ui';

export type MatchingTab = 'all' | 'my' | 'applied';

interface MatchingTabViewProps {
  selectedTab: MatchingTab;
  onTabChange: (tab: MatchingTab) => void;
  listContent: React.ReactNode;
  myPostsContent: React.ReactNode;
  myApplicationsContent: React.ReactNode;
}

const ROUTES = [
  { key: 'all', title: '전체 매칭' },
  { key: 'my', title: '내 게시글' },
  { key: 'applied', title: '내 신청' },
];

/**
 * 매칭 탭 루트 뷰. 3개 세그먼트 탭을 관리하고 콘텐츠를 분기한다.
 */
export function MatchingTabView({
  selectedTab,
  onTabChange,
  listContent,
  myPostsContent,
  myApplicationsContent,
}: MatchingTabViewProps) {
  const layout = useWindowDimensions();
  const index = ROUTES.findIndex((r) => r.key === selectedTab);

  const handleIndexChange = (i: number) => {
    onTabChange(ROUTES[i]?.key as MatchingTab);
  };

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case 'all':
        return <View style={styles.scene}>{listContent}</View>;
      case 'my':
        return <View style={styles.scene}>{myPostsContent}</View>;
      case 'applied':
        return <View style={styles.scene}>{myApplicationsContent}</View>;
      default:
        return null;
    }
  };

  return (
    <TabView
      style={{ flex: 1 }}
      navigationState={{ index, routes: ROUTES }}
      renderScene={renderScene}
      onIndexChange={handleIndexChange}
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
          indicatorStyle={{ backgroundColor: colors.blue500, height: 2 }}
          activeColor={colors.blue500}
          inactiveColor={colors.grey500}
          tabStyle={{ paddingVertical: spacing[1] }}
          pressColor={colors.blue50}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  scene: { flex: 1 },
});
