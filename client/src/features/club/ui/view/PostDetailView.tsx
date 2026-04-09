import React from 'react';
import { View, ScrollView, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { TextBox, AvatarImage, Spacing, ScreenLayout, ConfirmDialog, colors, spacing } from '@ui';
import { CommentItem } from '../components/CommentItem';
import type { Post, Comment } from '../../data/schemas/post.schema';

interface PostDetailViewProps {
  post: Post;
  comments: Comment[];
  commentInput: string;
  isSubmittingComment: boolean;
  isDeleteDialogOpen: boolean;
  isDeletingPost: boolean;
  canDeletePost: boolean;
  onCommentChange: (v: string) => void;
  onSubmitComment: () => void;
  onDeleteComment: (commentId: string) => void;
  onOpenDeleteDialog: () => void;
  onCloseDeleteDialog: () => void;
  onDeletePost: () => void;
}

/**
 * 게시글 상세 View — 본문 + 댓글 목록 + 댓글 입력.
 */
export function PostDetailView({
  post,
  comments,
  commentInput,
  isSubmittingComment,
  isDeleteDialogOpen,
  isDeletingPost,
  canDeletePost,
  onCommentChange,
  onSubmitComment,
  onDeleteComment,
  onOpenDeleteDialog,
  onCloseDeleteDialog,
  onDeletePost,
}: PostDetailViewProps) {
  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.content}>
        {/* 게시글 헤더 */}
        <View style={styles.postHeader}>
          <TextBox variant="heading3" color={colors.grey900}>{post.title}</TextBox>
          <View style={styles.authorRow}>
            <AvatarImage source={post.author.avatarUrl ? { uri: post.author.avatarUrl } : null} size={28} />
            <TextBox variant="caption" color={colors.grey500}>{post.author.name}</TextBox>
            <TextBox variant="caption" color={colors.grey400}>
              · {new Date(post.createdAt).toLocaleDateString('ko-KR')}
            </TextBox>
            <TextBox variant="caption" color={colors.grey400}> · 조회 {post.viewCount}</TextBox>
          </View>
        </View>

        <View style={styles.divider} />

        {/* 본문 */}
        <TextBox variant="body1" color={colors.grey900} style={styles.body}>
          {post.content}
        </TextBox>

        {canDeletePost ? (
          <View style={styles.deleteRow}>
            <TouchableOpacity onPress={onOpenDeleteDialog}>
              <TextBox variant="caption" color={colors.error}>게시글 삭제</TextBox>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.divider} />

        {/* 댓글 목록 */}
        <TextBox variant="body2Bold" color={colors.grey700}>댓글 {comments.length}</TextBox>
        <Spacing size={2} />

        {comments.length === 0 ? (
          <TextBox variant="body2" color={colors.grey400}>첫 댓글을 남겨보세요.</TextBox>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={() => onDeleteComment(comment.id)}
            />
          ))
        )}

        <Spacing size={20} />
      </ScrollView>

      {/* 댓글 입력 */}
      <View style={styles.commentInputBar}>
        <TextInput
          style={styles.commentInput}
          placeholder="댓글을 입력하세요..."
          placeholderTextColor={colors.grey400}
          value={commentInput}
          onChangeText={onCommentChange}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, isSubmittingComment && styles.sendBtnDisabled]}
          onPress={onSubmitComment}
          disabled={isSubmittingComment || commentInput.trim().length === 0}
        >
          <TextBox variant="body2Bold" color={isSubmittingComment ? colors.grey400 : colors.blue500}>
            등록
          </TextBox>
        </TouchableOpacity>
      </View>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={onCloseDeleteDialog}
        onConfirm={onDeletePost}
        title="게시글 삭제"
        description="게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        cancelLabel="취소"
        destructive
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  postHeader: {
    gap: spacing[2],
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  divider: {
    height: 1,
    backgroundColor: colors.grey100,
    marginVertical: spacing[4],
  },
  body: {
    lineHeight: 24,
  },
  deleteRow: {
    marginTop: spacing[3],
    alignItems: 'flex-end',
  },
  commentInputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.grey100,
    padding: spacing[3],
    gap: spacing[2],
    backgroundColor: colors.background,
  },
  commentInput: {
    flex: 1,
    maxHeight: 100,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.grey50,
    borderRadius: 20,
    fontSize: 14,
    color: colors.grey900,
  },
  sendBtn: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
