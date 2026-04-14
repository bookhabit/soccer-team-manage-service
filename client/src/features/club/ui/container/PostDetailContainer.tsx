import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Skeleton, ScreenLayout, Spacing, useToast } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import {
  usePostDetail,
  useComments,
  useCreateComment,
  useDeleteComment,
  useDeletePost,
} from '../../data/hooks/usePost';
import { useMyClub } from '../../data/hooks/useClub';
import { useMyProfile } from '@/src/features/auth/data/hooks/useAuth';
import { PostDetailView } from '../view/PostDetailView';

interface PostDetailContainerProps {
  clubId: string;
  postId: string;
}

function PostDetailSkeleton() {
  return (
    <ScreenLayout>
      <View style={{ padding: 16 }}>
        <Skeleton width="70%" height={24} />
        <Spacing size={3} />
        <Skeleton width="100%" height={160} borderRadius={8} />
      </View>
    </ScreenLayout>
  );
}

function PostDetailContent({ clubId, postId }: PostDetailContainerProps) {
  const [commentInput, setCommentInput] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: post } = usePostDetail(clubId, postId);
  const { data: commentsData } = useComments(clubId, postId);
  const { data: myClub } = useMyClub();
  const { data: myProfile } = useMyProfile();
  const { mutate: createComment, isPending: isSubmittingComment } = useCreateComment(clubId, postId);
  const { mutate: deleteComment } = useDeleteComment(clubId, postId);
  const { mutate: deletePost, isPending: isDeletingPost } = useDeletePost(clubId);

  const comments = commentsData.pages.flatMap((p) => p.data);

  const isCaptainOrVice = myClub?.myRole === 'CAPTAIN' || myClub?.myRole === 'VICE_CAPTAIN';
  const isAuthor = post.author.userId === myProfile?.id;
  const canDeletePost = isCaptainOrVice || isAuthor;
  const canEditPost = isAuthor;

  const handleSubmitComment = () => {
    const trimmed = commentInput.trim();
    if (!trimmed) return;
    createComment(
      { content: trimmed },
      {
        onSuccess: () => setCommentInput(''),
        onError: () => toast.error('댓글 등록에 실패했습니다.'),
      },
    );
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment(commentId, {
      onError: () => toast.error('댓글 삭제에 실패했습니다.'),
    });
  };

  const handleDeletePost = () => {
    deletePost(postId, {
      onSuccess: () => {
        toast.success('게시글이 삭제되었습니다.');
        setIsDeleteDialogOpen(false);
        router.back();
      },
      onError: () => toast.error('게시글 삭제에 실패했습니다.'),
    });
  };

  const handleEditPost = () => {
    router.push(`/club/${clubId}/board/write?postId=${postId}`);
  };

  return (
    <PostDetailView
      post={post}
      comments={comments}
      commentInput={commentInput}
      isSubmittingComment={isSubmittingComment}
      isDeleteDialogOpen={isDeleteDialogOpen}
      isDeletingPost={isDeletingPost}
      canDeletePost={canDeletePost}
      canEditPost={canEditPost}
      onCommentChange={setCommentInput}
      onSubmitComment={handleSubmitComment}
      onDeleteComment={handleDeleteComment}
      onOpenDeleteDialog={() => setIsDeleteDialogOpen(true)}
      onCloseDeleteDialog={() => setIsDeleteDialogOpen(false)}
      onDeletePost={handleDeletePost}
      onEditPost={handleEditPost}
    />
  );
}

export function PostDetailContainer({ clubId, postId }: PostDetailContainerProps) {
  return (
    <AsyncBoundary loadingFallback={<PostDetailSkeleton />}>
      <PostDetailContent clubId={clubId} postId={postId} />
    </AsyncBoundary>
  );
}
