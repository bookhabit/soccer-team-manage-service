import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { TextBox, colors, spacing } from '@ui';

export type MercenaryTab = 'posts' | 'availabilities';

interface Props {
  selectedTab: MercenaryTab;
  onTabChange: (tab: MercenaryTab) => void;
  postsContent: React.ReactNode;
  availabilitiesContent: React.ReactNode;
}

const TABS: { key: MercenaryTab; label: string }[] = [
  { key: 'posts', label: '용병 구함' },
  { key: 'availabilities', label: '용병 가능' },
];

export function MercenaryTabView({ selectedTab, onTabChange, postsContent, availabilitiesContent }: Props) {
  return (
    <View style={styles.container}>
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

      {/* display:none으로 마운트 유지 */}
      <View style={[styles.content, selectedTab !== 'posts' && styles.hidden]}>
        {postsContent}
      </View>
      <View style={[styles.content, selectedTab !== 'availabilities' && styles.hidden]}>
        {availabilitiesContent}
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
