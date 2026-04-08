import React, { useState } from 'react';
import { router } from 'expo-router';
import { useToast } from '@ui';
import {
  usePostDetail,
  useComments,
  useCreateComment,
  useDeleteComment,
  useDeletePost,
} from '../../data/hooks/usePost';
import { useMyClub } from '../../data/hooks/useClub';
import { PostDetailView } from '../view/PostDetailView';

interface PostDetailContainerProps {
  clubId: string;
  postId: string;
}

/**
 * 게시글 상세 Container.
 * 게시글 조회(viewCount INCR 트리거) + 댓글 CRUD.
 */
export function PostDetailContainer({ clubId, postId }: PostDetailContainerProps) {
  const [commentInput, setCommentInput] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: post, isLoading } = usePostDetail(clubId, postId);
  const { data: commentsData } = useComments(clubId, postId);
  const { data: myClub } = useMyClub();
  const { mutate: createComment, isPending: isSubmittingComment } = useCreateComment(clubId, postId);
  const { mutate: deleteComment } = useDeleteComment(clubId, postId);
  const { mutate: deletePost, isPending: isDeletingPost } = useDeletePost(clubId);

  const comments = commentsData?.pages.flatMap((p) => p.data) ?? [];

  const isCaptainOrVice = myClub?.myRole === 'CAPTAIN' || myClub?.myRole === 'VICE_CAPTAIN';
  // NOTE: author 본인 여부는 서버 응답에 isMine 필드 추가 후 교체 — 현재는 관리자 권한으로만 허용
  const canDeletePost = isCaptainOrVice;

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

  return (
    <PostDetailView
      post={post}
      comments={comments}
      isLoading={isLoading}
      commentInput={commentInput}
      isSubmittingComment={isSubmittingComment}
      isDeleteDialogOpen={isDeleteDialogOpen}
      isDeletingPost={isDeletingPost}
      canDeletePost={canDeletePost}
      onCommentChange={setCommentInput}
      onSubmitComment={handleSubmitComment}
      onDeleteComment={handleDeleteComment}
      onOpenDeleteDialog={() => setIsDeleteDialogOpen(true)}
      onCloseDeleteDialog={() => setIsDeleteDialogOpen(false)}
      onDeletePost={handleDeletePost}
    />
  );
}
