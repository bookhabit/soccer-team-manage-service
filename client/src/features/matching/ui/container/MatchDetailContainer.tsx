import React, { useState } from 'react';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { useToast, AlertDialog, ConfirmDialog } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { useMyProfile } from '@/src/features/auth/data/hooks/useAuth';
import { useMatchPostDetail, useMatchContact, useDeleteMatchPost, useCancelMatchPost } from '../../data/hooks/useMatchPosts';
import { useApplyMatchPost } from '../../data/hooks/useMatchApplications';
import { MatchDetailView } from '../view/MatchDetailView';
import { ApplyBottomSheet } from '../components/ApplyBottomSheet';
import type { CreateMatchApplicationInput } from '../../data/schemas/matchApplication.schema';
import { Skeleton, ScreenLayout, Spacing, spacing } from '@ui';
import { View } from 'react-native';

interface MatchDetailContainerProps {
  postId: string;
}

function MatchDetailContent({ postId }: MatchDetailContainerProps) {
  const { data: post } = useMatchPostDetail(postId);
  const { data: profile } = useMyProfile();
  const { toast } = useToast();

  const [applySheetOpen, setApplySheetOpen] = useState(false);
  const [phoneAlertOpen, setPhoneAlertOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  // 연락처: 매칭완료 상태이고 자신이 관계자인 경우에만 조회
  const canFetchContact = post.status === 'MATCHED' && !post.canApply;
  const { data: contact } = useMatchContact(postId, canFetchContact);

  const { mutate: deletePost, isPending: isDeleting } = useDeleteMatchPost();
  const { mutate: cancelPost, isPending: isCancelling } = useCancelMatchPost();
  const { mutate: applyPost, isPending: isApplying } = useApplyMatchPost(postId);

  const handleApplyPress = () => {
    if (!profile?.phone) {
      setPhoneAlertOpen(true);
      return;
    }
    setApplySheetOpen(true);
  };

  const handleApplySubmit = (data: CreateMatchApplicationInput) => {
    applyPost(data, {
      onSuccess: () => {
        toast.success('매칭 신청이 완료되었습니다!');
        setApplySheetOpen(false);
      },
      onError: (err: any) => {
        const code = err?.response?.data?.code;
        if (code === 'MATCH_POST_006') {
          toast.error('이미 신청한 게시글입니다.');
        } else if (code === 'MATCH_POST_003') {
          toast.error('이미 매칭이 완료된 게시글입니다.');
        } else if (code === 'MATCH_POST_004') {
          toast.error('만료된 게시글입니다.');
        } else {
          toast.error('신청에 실패했습니다.');
        }
      },
    });
  };

  const handleDelete = () => {
    deletePost(postId, {
      onSuccess: () => {
        toast.success('게시글이 삭제되었습니다.');
        router.back();
      },
      onError: () => toast.error('삭제에 실패했습니다.'),
    });
  };

  const handleCancelConfirm = () => {
    cancelPost(postId, {
      onSuccess: () => {
        toast.success('매칭이 취소되었습니다.');
        setCancelConfirmOpen(false);
      },
      onError: (err: any) => {
        const code = err?.response?.data?.code;
        if (code === 'MATCH_POST_010') {
          toast.error('매칭 완료 상태에서만 취소할 수 있습니다.');
        } else {
          toast.error('취소에 실패했습니다.');
        }
        setCancelConfirmOpen(false);
      },
    });
  };

  return (
    <>
      <MatchDetailView
        post={post}
        contact={contact}
        onApply={handleApplyPress}
        onEdit={() => router.push(`/(app)/matching/${postId}/edit` as Href)}
        onDelete={handleDelete}
        onCancel={() => setCancelConfirmOpen(true)}
        onViewApplications={() => router.push(`/(app)/matching/${postId}/applications` as Href)}
        isDeleting={isDeleting}
        isCancelling={isCancelling}
      />

      <ApplyBottomSheet
        isOpen={applySheetOpen}
        onClose={() => setApplySheetOpen(false)}
        onSubmit={handleApplySubmit}
        isPending={isApplying}
        defaultContactName={profile?.name ?? ''}
        defaultContactPhone={profile?.phone ?? ''}
      />

      <AlertDialog
        isOpen={phoneAlertOpen}
        onClose={() => {
          setPhoneAlertOpen(false);
          router.push('/(app)/profile/settings' as Href);
        }}
        title="연락처 설정 필요"
        description="매칭 신청을 위해 먼저 프로필에서 연락처를 설정해주세요."
        confirmLabel="설정하러 가기"
      />

      <ConfirmDialog
        isOpen={cancelConfirmOpen}
        onClose={() => setCancelConfirmOpen(false)}
        onConfirm={handleCancelConfirm}
        title="매칭을 취소하시겠습니까?"
        description="취소하면 상대팀에게 알림이 전송됩니다. 이 작업은 되돌릴 수 없습니다."
        confirmLabel="취소하기"
        destructive
      />
    </>
  );
}

function MatchDetailSkeleton() {
  return (
    <ScreenLayout>
      <View style={{ padding: spacing[5] }}>
        <Skeleton width={200} height={24} borderRadius={8} />
        <Spacing size={3} />
        <Skeleton width="100%" height={100} borderRadius={12} />
        <Spacing size={3} />
        <Skeleton width="100%" height={80} borderRadius={12} />
        <Spacing size={3} />
        <Skeleton width="100%" height={80} borderRadius={12} />
      </View>
    </ScreenLayout>
  );
}

/**
 * 매칭 게시글 상세 Container. 신청 BottomSheet + 전화번호 가드를 포함한다.
 */
export function MatchDetailContainer({ postId }: MatchDetailContainerProps) {
  return (
    <AsyncBoundary loadingFallback={<MatchDetailSkeleton />}>
      <MatchDetailContent postId={postId} />
    </AsyncBoundary>
  );
}
