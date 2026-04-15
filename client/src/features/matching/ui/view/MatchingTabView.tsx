import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { TextBox, colors, spacing } from '@ui';

export type MatchingTab = 'all' | 'my' | 'applied';

interface MatchingTabViewProps {
  selectedTab: MatchingTab;
  onTabChange: (tab: MatchingTab) => void;
  listContent: React.ReactNode;
  myPostsContent: React.ReactNode;
  myApplicationsContent: React.ReactNode;
}

const TABS: { key: MatchingTab; label: string }[] = [
  { key: 'all', label: '전체 매칭' },
  { key: 'my', label: '내 게시글' },
  { key: 'applied', label: '내 신청' },
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
  return (
    <View style={styles.container}>
      {/* 세그먼트 탭 */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = selectedTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.7}
            >
              <TextBox
                variant="body2Bold"
                color={isActive ? colors.blue500 : colors.grey500}
              >
                {tab.label}
              </TextBox>
              {isActive && <View style={styles.indicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 콘텐츠 — display:none으로 마운트 유지 (탭 전환 시 스켈레톤 방지) */}
      <View style={[styles.content, selectedTab !== 'all' && styles.hidden]}>
        {listContent}
      </View>
      <View style={[styles.content, selectedTab !== 'my' && styles.hidden]}>
        {myPostsContent}
      </View>
      <View style={[styles.content, selectedTab !== 'applied' && styles.hidden]}>
        {myApplicationsContent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    position: 'relative',
  },
  tabItemActive: {},
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: spacing[4],
    right: spacing[4],
    height: 2,
    backgroundColor: colors.blue500,
    borderRadius: 1,
  },
  content: { flex: 1 },
  hidden: { display: 'none' },
});
