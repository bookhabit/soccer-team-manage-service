import React from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl, StyleSheet, useWindowDimensions } from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import { TextBox, Spacing, ScreenLayout, colors, spacing } from '@ui';
import { EmptyBoundary } from '@/src/shared/ui/server-state-handling/EmptyBoundary';
import { PostListItem } from '../components/PostListItem';
import type { PostListItem as PostListItemType, PostType } from '../../data/schemas/post.schema';

const ROUTES = [
  { key: 'all', title: '전체' },
  { key: 'NOTICE', title: '공지' },
  { key: 'GENERAL', title: '일반' },
  { key: 'INQUIRY', title: '문의' },
];

interface BoardViewProps {
  posts: PostListItemType[];
  activeTab: PostType | undefined;
  hasNextPage: boolean;
  canWrite: boolean;
  isRefreshing: boolean;
  onTabChange: (tab: PostType | undefined) => void;
  onLoadMore: () => void;
  onRefresh: () => void;
  onSelectPost: (postId: string) => void;
  onWrite: () => void;
}

/**
 * 클럽 게시판 View — 탭(전체·공지·일반·문의) + 게시글 목록.
 */
export function BoardView({
  posts,
  activeTab,
  hasNextPage,
  canWrite,
  isRefreshing,
  onTabChange,
  onLoadMore,
  onRefresh,
  onSelectPost,
  onWrite,
}: BoardViewProps) {
  const layout = useWindowDimensions();
  const tabIndex = ROUTES.findIndex((r) => r.key === (activeTab ?? 'all'));

  const handleIndexChange = (i: number) => {
    const key = ROUTES[i]?.key;
    onTabChange(key === 'all' ? undefined : (key as PostType));
  };

  const renderScene = () => (
    <EmptyBoundary
      data={posts}
      fallback={
        <View style={styles.emptyWrapper}>
          <TextBox variant="body2" color={colors.grey400}>게시글이 없습니다.</TextBox>
        </View>
      }
    >
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostListItem post={item} onPress={() => onSelectPost(item.id)} />
        )}
        onEndReached={hasNextPage ? onLoadMore : undefined}
        onEndReachedThreshold={0.5}
        ItemSeparatorComponent={() => <Spacing size={0} />}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      />
    </EmptyBoundary>
  );

  return (
    <ScreenLayout>
      <TabView
        style={{ flex: 1 }}
        navigationState={{ index: tabIndex, routes: ROUTES }}
        renderScene={renderScene}
        onIndexChange={handleIndexChange}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <View style={styles.tabBarWrapper}>
            <View style={{ flex: 1 }}>
              <TabBar
                {...props}
                style={{
                  backgroundColor: colors.background,
                  elevation: 0,
                  shadowOpacity: 0,
                }}
                indicatorStyle={{ backgroundColor: colors.blue500, height: 2 }}
                activeColor={colors.blue500}
                inactiveColor={colors.grey500}
                tabStyle={{ paddingVertical: spacing[1] }}
                pressColor={colors.blue50}
              />
            </View>
            {canWrite ? (
              <TouchableOpacity style={styles.writeBtn} onPress={onWrite}>
                <TextBox variant="body2Bold" color={colors.blue500}>글쓰기</TextBox>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  writeBtn: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
