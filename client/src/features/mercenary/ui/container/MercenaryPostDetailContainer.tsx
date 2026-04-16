import React, { useState } from 'react';
import { router } from 'expo-router';
import { useToast, AlertDialog, ConfirmDialog } from '@ui';
import { useMyProfile } from '@/src/features/auth/data/hooks/useAuth';
import { useMercenaryPostDetail, useDeleteMercenaryPost } from '../../data/hooks/useMercenaryPosts';
import { useApplyMercenaryPost } from '../../data/hooks/useMercenaryApplications';
import { MercenaryPostDetailView } from '../view/MercenaryPostDetailView';
import { ApplyBottomSheet } from '../components/ApplyBottomSheet';
import type { CreateMercenaryApplicationInput } from '../../data/schemas/mercenaryPost.schema';

interface Props {
  postId: string;
}

export function MercenaryPostDetailContainer({ postId }: Props) {
  const { data: post } = useMercenaryPostDetail(postId);
  const { data: profile } = useMyProfile();
  const { toast } = useToast();

  const [applySheetOpen, setApplySheetOpen] = useState(false);
  const [phoneAlertOpen, setPhoneAlertOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { mutate: deletePost, isPending: isDeleting } = useDeleteMercenaryPost();
  const { mutate: applyPost, isPending: isApplying } = useApplyMercenaryPost(postId);

  const handleApplyPress = () => {
    if (!profile?.phone) {
      setPhoneAlertOpen(true);
      return;
    }
    setApplySheetOpen(true);
  };

  const handleApplySubmit = (data: CreateMercenaryApplicationInput) => {
    applyPost(data, {
      onSuccess: () => {
        toast.success('지원이 완료되었습니다!');
        setApplySheetOpen(false);
      },
      onError: (err: any) => {
        const code = err?.response?.data?.code;
        if (code === 'MERCENARY_POST_006') {
          toast.error('이미 지원한 게시글입니다.');
        } else if (code === 'MERCENARY_POST_003') {
          toast.error('이미 마감된 게시글입니다.');
        } else if (code === 'MERCENARY_POST_004') {
          toast.error('만료된 게시글입니다.');
        } else if (code === 'MERCENARY_BLACKLIST') {
          toast.error('지원이 제한된 계정입니다.');
        } else {
          toast.error('지원에 실패했습니다.');
        }
        setApplySheetOpen(false);
      },
    });
  };

  const handleDelete = () => {
    deletePost(postId, {
      onSuccess: () => {
        toast.success('게시글이 삭제되었습니다.');
        router.back();
      },
      onError: () => {
        toast.error('삭제에 실패했습니다.');
      },
    });
    setDeleteConfirmOpen(false);
  };

  return (
    <>
      <MercenaryPostDetailView
        post={post}
        onApply={handleApplyPress}
        onManageApplications={() => router.push(`/(app)/mercenary/post/${postId}/applications` as any)}
        onEdit={() => router.push(`/(app)/mercenary/post/${postId}/edit` as any)}
        onDelete={() => setDeleteConfirmOpen(true)}
        isApplying={isApplying}
      />
      <ApplyBottomSheet
        isOpen={applySheetOpen}
        onClose={() => setApplySheetOpen(false)}
        onSubmit={handleApplySubmit}
        isLoading={isApplying}
      />
      <AlertDialog
        isOpen={phoneAlertOpen}
        title="연락처를 먼저 설정해주세요"
        description="지원하기 전에 연락처를 등록해야 합니다."
        confirmLabel="프로필 설정 가기"
        cancelLabel="나중에"
        onConfirm={() => {
          setPhoneAlertOpen(false);
          router.push('/(app)/profile/edit' as any);
        }}
        onCancel={() => setPhoneAlertOpen(false)}
      />
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="게시글 삭제"
        description="게시글을 삭제하시겠습니까?"
        confirmLabel="삭제"
        cancelLabel="취소"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </>
  );
}
