import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { TextBox, AvatarImage, colors, spacing } from '@ui';
import type { Comment } from '../../data/schemas/post.schema';
import { getAvatarUrl } from '@/src/shared/utils/imageUrl';

interface CommentItemProps {
  comment: Comment;
  onDelete: () => void;
}

/**
 * 게시글 상세 화면에서 사용하는 댓글 아이템 컴포넌트.
 */
export function CommentItem({ comment, onDelete }: CommentItemProps) {
  return (
    <View style={styles.item}>
      <AvatarImage
        source={{ uri: getAvatarUrl(comment.author.avatarUrl) }}
        size={32}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <TextBox variant="captionBold" color={colors.grey700}>
            {comment.author.name}
          </TextBox>
          <TextBox variant="caption" color={colors.grey400}>
            {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
          </TextBox>
        </View>
        <TextBox variant="body2" color={colors.grey900}>
          {comment.content}
        </TextBox>
      </View>
      {comment.isMine ? (
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <TextBox variant="caption" color={colors.error}>
            삭제
          </TextBox>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
});
