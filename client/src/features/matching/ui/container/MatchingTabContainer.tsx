import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { ScreenLayout, colors, spacing } from '@ui';
import { Ionicons } from '@expo/vector-icons';
import { MatchingTabView, type MatchingTab } from '../view/MatchingTabView';
import { MatchListContainer } from './MatchListContainer';
import { MyPostsContainer } from './MyPostsContainer';
import { MyApplicationsContainer } from './MyApplicationsContainer';

/**
 * 매칭 탭 루트 Container.
 * 3개 세그먼트 탭 상태를 관리하며 각 탭에 해당 Container를 주입한다.
 */
export function MatchingTabContainer() {
  const [selectedTab, setSelectedTab] = useState<MatchingTab>('all');

  return (
    <ScreenLayout
      topSlot={
        <View style={styles.header}>
          <View style={styles.headerTitle} />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(app)/matching/create' as Href)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={24} color={colors.grey900} />
          </TouchableOpacity>
        </View>
      }
    >
      <MatchingTabView
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        listContent={<MatchListContainer />}
        myPostsContent={<MyPostsContainer />}
        myApplicationsContent={<MyApplicationsContainer />}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  headerTitle: { flex: 1 },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.grey100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
