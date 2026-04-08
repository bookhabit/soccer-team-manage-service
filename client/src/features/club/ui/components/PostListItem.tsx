import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { TextBox, colors, spacing } from '@ui';
import type { PostListItem as PostListItemType } from '../../data/schemas/post.schema';

interface PostListItemProps {
  post: PostListItemType;
  onPress: () => void;
}

const POST_TYPE_LABEL: Record<string, string> = {
  NOTICE: '[공지]',
  GENERAL: '',
  INQUIRY: '[문의]',
};

/**
 * 클럽 게시판 목록에서 사용하는 게시글 아이템 컴포넌트.
 */
export function PostListItem({ post, onPress }: PostListItemProps) {
  const typeLabel = POST_TYPE_LABEL[post.type];

  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.titleRow}>
        {post.isPinned ? (
          <TextBox variant="captionBold" color={colors.blue500}>📌 </TextBox>
        ) : null}
        {typeLabel ? (
          <TextBox variant="body2Bold" color={post.type === 'NOTICE' ? colors.blue500 : colors.grey500}>
            {typeLabel}{' '}
          </TextBox>
        ) : null}
        <TextBox variant="body2Bold" color={colors.grey900} numberOfLines={1} style={styles.titleText}>
          {post.title}
        </TextBox>
        {post.isNew ? (
          <View style={styles.newBadge}>
            <TextBox variant="captionBold" color={colors.blue500}>N</TextBox>
          </View>
        ) : null}
      </View>
      <TextBox variant="caption" color={colors.grey500} numberOfLines={2} style={styles.preview}>
        {post.contentPreview}
      </TextBox>
      <View style={styles.meta}>
        <TextBox variant="caption" color={colors.grey400}>{post.author.name}</TextBox>
        <TextBox variant="caption" color={colors.grey400}> · </TextBox>
        <TextBox variant="caption" color={colors.grey400}>조회 {post.viewCount}</TextBox>
        <TextBox variant="caption" color={colors.grey400}> · </TextBox>
        <TextBox variant="caption" color={colors.grey400}>댓글 {post.commentCount}</TextBox>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    flex: 1,
  },
  newBadge: {
    marginLeft: spacing[1],
    paddingHorizontal: 5,
    paddingVertical: 1,
    backgroundColor: colors.blue50,
    borderRadius: 4,
  },
  preview: {
    lineHeight: 18,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
