import React from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { TextBox, Spacing, Skeleton, ScreenLayout, colors, spacing } from '@ui';
import { PostListItem } from '../components/PostListItem';
import type { PostListItem as PostListItemType, PostType } from '../../data/schemas/post.schema';

const TABS: { key: PostType | undefined; label: string }[] = [
  { key: undefined, label: '전체' },
  { key: 'NOTICE', label: '공지' },
  { key: 'GENERAL', label: '일반' },
  { key: 'INQUIRY', label: '문의' },
];

interface BoardViewProps {
  posts: PostListItemType[];
  activeTab: PostType | undefined;
  isLoading: boolean;
  hasNextPage: boolean;
  canWrite: boolean;
  onTabChange: (tab: PostType | undefined) => void;
  onLoadMore: () => void;
  onSelectPost: (postId: string) => void;
  onWrite: () => void;
}

/**
 * 클럽 게시판 View — 탭(전체·공지·일반·문의) + 게시글 목록.
 */
export function BoardView({
  posts,
  activeTab,
  isLoading,
  hasNextPage,
  canWrite,
  onTabChange,
  onLoadMore,
  onSelectPost,
  onWrite,
}: BoardViewProps) {
  return (
    <ScreenLayout>
      {/* 탭 */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={String(tab.key)}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onTabChange(tab.key)}
            >
              <TextBox
                variant="body2Bold"
                color={isActive ? colors.blue500 : colors.grey500}
              >
                {tab.label}
              </TextBox>
            </TouchableOpacity>
          );
        })}
        {canWrite ? (
          <TouchableOpacity style={styles.writeBtn} onPress={onWrite}>
            <TextBox variant="body2Bold" color={colors.blue500}>글쓰기</TextBox>
          </TouchableOpacity>
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.skeletonList}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={72} borderRadius={8} />
          ))}
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <TextBox variant="body2" color={colors.grey400}>게시글이 없습니다.</TextBox>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostListItem post={item} onPress={() => onSelectPost(item.id)} />
          )}
          onEndReached={hasNextPage ? onLoadMore : undefined}
          onEndReachedThreshold={0.5}
          ItemSeparatorComponent={() => <Spacing size={0} />}
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  tab: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.blue500,
  },
  writeBtn: {
    marginLeft: 'auto',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  skeletonList: {
    padding: spacing[4],
    gap: spacing[3],
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
