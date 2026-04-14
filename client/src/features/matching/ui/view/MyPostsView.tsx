import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { TextBox, Skeleton, Spacing, colors, spacing } from '@ui';
import type { MatchPostList } from '../../data/schemas/matchPost.schema';
import { MatchPostCard } from '../components/MatchPostCard';

interface MyPostsViewProps {
  posts: MatchPostList['items'];
  onPostPress: (id: string) => void;
}

/**
 * 내 팀 매칭 게시글 목록 뷰.
 */
export function MyPostsView({ posts, onPostPress }: MyPostsViewProps) {
  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MatchPostCard post={item} onPress={() => onPostPress(item.id)} />
      )}
      ListEmptyComponent={<MyPostsEmptyView />}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    />
  );
}

function MyPostsEmptyView() {
  return (
    <View style={styles.empty}>
      <TextBox variant="body1" color={colors.grey400}>등록한 매칭이 없어요</TextBox>
      <Spacing size={2} />
      <TextBox variant="body2" color={colors.grey300}>+ 버튼을 눌러 매칭을 등록해보세요</TextBox>
    </View>
  );
}

export function MyPostsSkeleton() {
  return (
    <View style={styles.skeleton}>
      {Array.from({ length: 3 }).map((_, i) => (
        <View key={i} style={styles.skeletonCard}>
          <Skeleton width="100%" height={140} borderRadius={12} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing[2], paddingBottom: spacing[20] },
  empty: { alignItems: 'center', paddingTop: spacing[20] },
  skeleton: { padding: spacing[4] },
  skeletonCard: { marginBottom: spacing[3] },
});
