import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { ScreenLayout, TextBox, Skeleton, Spacing, colors, spacing } from '@ui';
import { MatchFeedFilterBar } from '../components/MatchFeedFilterBar';
import { MatchFeedItem } from '../components/MatchFeedItem';
import { MatchFeedEmptyView } from './MatchFeedEmptyView';
import type { MatchFeedItem as MatchFeedItemType, MatchFeedFilter } from '../../data/schemas/matchFeed.schema';

interface MatchFeedViewProps {
  items: MatchFeedItemType[];
  filter: MatchFeedFilter;
  hasNextPage: boolean;
  isLoadingMore: boolean;
  isClubMember: boolean;
  onFilterChange: (filter: MatchFeedFilter) => void;
  onLoadMore: () => void;
  onItemPress: (matchId: string) => void;
}

function LoadingMoreItem() {
  return (
    <View style={styles.loadingMore}>
      <Skeleton width="100%" height={110} borderRadius={12} />
    </View>
  );
}

export function MatchFeedView({
  items,
  filter,
  hasNextPage,
  isLoadingMore,
  isClubMember,
  onFilterChange,
  onLoadMore,
  onItemPress,
}: MatchFeedViewProps) {
  const isEmpty = items.length === 0;

  return (
    <ScreenLayout>
      {/* 헤더 */}
      <View style={styles.titleBar}>
        <TextBox variant="heading3" color={colors.grey900}>
          경기 피드
        </TextBox>
      </View>

      {/* 필터 바 */}
      <MatchFeedFilterBar
        filter={filter}
        isClubMember={isClubMember}
        onChange={onFilterChange}
      />

      {isEmpty ? (
        <>
          <Spacing size={4} />
          <MatchFeedEmptyView filter={filter} />
        </>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MatchFeedItem item={item} onPress={() => onItemPress(item.id)} />
          )}
          contentContainerStyle={styles.listContent}
          onEndReached={() => {
            if (hasNextPage && !isLoadingMore) {
              onLoadMore();
            }
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={isLoadingMore ? <LoadingMoreItem /> : <Spacing size={10} />}
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  titleBar: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  listContent: {
    paddingTop: spacing[3],
    paddingBottom: spacing[6],
  },
  loadingMore: {
    marginHorizontal: spacing[4],
    marginBottom: spacing[3],
  },
});
