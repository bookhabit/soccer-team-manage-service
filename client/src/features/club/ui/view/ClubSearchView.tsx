import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { TextBox, Input, Spacing, Skeleton, ScreenLayout, colors, spacing } from '@ui';
import { ClubPreviewCard } from '../components/ClubPreviewCard';
import type { ClubPreview } from '../../data/schemas/club.schema';

interface ClubSearchViewProps {
  query: string;
  clubs: ClubPreview[];
  isLoading: boolean;
  hasNextPage: boolean;
  onQueryChange: (q: string) => void;
  onLoadMore: () => void;
  onSelectClub: (clubId: string) => void;
}

/**
 * 클럽 검색 View.
 * - 검색어 입력 → 결과 목록 표시
 * - 4-state: 로딩 / 빈 결과 / 결과 있음 / 초기(추천)
 */
export function ClubSearchView({
  query,
  clubs,
  isLoading,
  hasNextPage,
  onQueryChange,
  onLoadMore,
  onSelectClub,
}: ClubSearchViewProps) {
  const isEmptyResult = !isLoading && query.length > 0 && clubs.length === 0;
  const isInitial = !isLoading && query.length === 0 && clubs.length === 0;

  return (
    <ScreenLayout>
      <View style={styles.searchBar}>
        <Input
          placeholder="팀 이름으로 검색"
          value={query}
          onChangeText={onQueryChange}
          autoFocus
        />
      </View>

      {isLoading && (
        <View style={styles.skeletonList}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.skeletonItem}>
              <Skeleton width={48} height={48} borderRadius={24} />
              <View style={{ flex: 1, gap: 8 }}>
                <Skeleton width="60%" height={16} />
                <Skeleton width="40%" height={12} />
              </View>
            </View>
          ))}
        </View>
      )}

      {isEmptyResult && (
        <View style={styles.emptyWrapper}>
          <TextBox variant="body2" color={colors.grey400}>'{query}'에 해당하는 팀이 없습니다.</TextBox>
        </View>
      )}

      {isInitial && (
        <View style={styles.emptyWrapper}>
          <TextBox variant="body2" color={colors.grey400}>팀 이름을 검색해보세요</TextBox>
        </View>
      )}

      {!isLoading && clubs.length > 0 && (
        <FlatList
          data={clubs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ClubPreviewCard club={item} onPress={() => onSelectClub(item.id)} />
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
  searchBar: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  skeletonList: {
    padding: spacing[4],
    gap: spacing[4],
  },
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing[10],
  },
});
