import React from 'react';
import { FlatList, View, ActivityIndicator, StyleSheet } from 'react-native';
import { TextBox, Skeleton, Spacing, colors, spacing } from '@ui';
import type { MatchPostSummary, MatchPostFilters } from '../../data/schemas/matchPost.schema';
import { MatchPostCard } from '../components/MatchPostCard';
import { MatchFilterBar } from '../components/MatchFilterBar';

interface MatchListViewProps {
  posts: MatchPostSummary[];
  filters: Omit<MatchPostFilters, 'cursor' | 'limit' | 'dateFrom' | 'dateTo'>;
  onFilterChange: (next: Partial<MatchPostFilters>) => void;
  onPostPress: (id: string) => void;
  onLoadMore: () => void;
  isFetchingNextPage: boolean;
}

/**
 * 매칭 게시글 전체 목록 뷰. 필터 바 + FlatList + 무한 스크롤.
 */
export function MatchListView({
  posts,
  filters,
  onFilterChange,
  onPostPress,
  onLoadMore,
  isFetchingNextPage,
}: MatchListViewProps) {
  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MatchPostCard post={item} onPress={() => onPostPress(item.id)} />
      )}
      ListHeaderComponent={
        <MatchFilterBar filters={filters} onChange={onFilterChange} />
      }
      ListEmptyComponent={<MatchListEmptyView />}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={styles.footer}>
            <ActivityIndicator color={colors.blue500} />
          </View>
        ) : null
      }
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.4}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    />
  );
}

function MatchListEmptyView() {
  return (
    <View style={styles.empty}>
      <TextBox variant="body1" color={colors.grey400}>조건에 맞는 게시글이 없어요</TextBox>
      <Spacing size={2} />
      <TextBox variant="body2" color={colors.grey300}>필터를 변경해 다시 검색해보세요</TextBox>
    </View>
  );
}

export function MatchListSkeleton() {
  return (
    <View style={styles.skeleton}>
      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i} style={styles.skeletonCard}>
          <Skeleton width="100%" height={140} borderRadius={12} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing[20],
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing[20],
  },
  footer: {
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  skeleton: {
    padding: spacing[4],
  },
  skeletonCard: {
    marginBottom: spacing[3],
  },
});
