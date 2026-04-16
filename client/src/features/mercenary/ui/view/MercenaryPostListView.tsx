import React from 'react';
import { FlatList, View, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { TextBox, colors, spacing, Flex, Button } from '@ui';
import { MercenaryPostCard } from '../components/MercenaryPostCard';
import type { MercenaryPostSummary } from '../../data/schemas/mercenaryPost.schema';

interface Props {
  posts: MercenaryPostSummary[];
  onPostPress: (id: string) => void;
  onCreatePress: () => void;
  onLoadMore: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export function MercenaryPostListView({
  posts,
  onPostPress,
  onCreatePress,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
  isRefreshing,
  onRefresh,
}: Props) {
  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MercenaryPostCard post={item} onPress={() => onPostPress(item.id)} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Flex align="center" justify="center" style={styles.empty}>
            <TextBox variant="body2" color={colors.grey400}>
              등록된 게시글이 없어요
            </TextBox>
          </Flex>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : null
        }
        onEndReached={hasNextPage ? onLoadMore : undefined}
        onEndReachedThreshold={0.3}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={isRefreshing ?? false} onRefresh={onRefresh} />
          ) : undefined
        }
      />
      <View style={styles.fab}>
        <Button variant="primary" size="medium" onPress={onCreatePress}>
          + 등록
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: {
    padding: spacing[4],
    paddingBottom: spacing[20],
  },
  empty: { paddingTop: spacing[16] },
  loader: { paddingVertical: spacing[4] },
  fab: {
    position: 'absolute',
    bottom: spacing[6],
    right: spacing[4],
  },
});
