import React, { useState } from 'react';
import { router } from 'expo-router';
import { useToast, AlertDialog, ConfirmDialog } from '@ui';
import { useMyProfile } from '@/src/features/auth/data/hooks/useAuth';
import { useMercenaryAvailabilityDetail, useDeleteMercenaryAvailability, useRecruitMercenary } from '../../data/hooks/useMercenaryAvailabilities';
import { MercenaryAvailabilityDetailView } from '../view/MercenaryAvailabilityDetailView';
import { RecruitBottomSheet } from '../components/RecruitBottomSheet';
import type { CreateMercenaryRecruitmentInput } from '../../data/schemas/mercenaryAvailability.schema';

interface Props {
  availId: string;
}

export function MercenaryAvailabilityDetailContainer({ availId }: Props) {
  const { data: avail } = useMercenaryAvailabilityDetail(availId);
  const { data: profile } = useMyProfile();
  const { toast } = useToast();

  const [recruitSheetOpen, setRecruitSheetOpen] = useState(false);
  const [phoneAlertOpen, setPhoneAlertOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { mutate: deleteAvail, isPending: isDeleting } = useDeleteMercenaryAvailability();
  const { mutate: recruit, isPending: isRecruiting } = useRecruitMercenary(availId);

  const handleRecruitPress = () => {
    if (!profile?.phone) {
      setPhoneAlertOpen(true);
      return;
    }
    setRecruitSheetOpen(true);
  };

  const handleRecruitSubmit = (data: CreateMercenaryRecruitmentInput) => {
    recruit(data, {
      onSuccess: () => {
        toast.success('영입 신청이 완료되었습니다!');
        setRecruitSheetOpen(false);
      },
      onError: (err: any) => {
        const code = err?.response?.data?.code;
        if (code === 'MERCENARY_AVAIL_004') {
          toast.error('이미 신청한 게시글입니다.');
        } else if (code === 'MERCENARY_AVAIL_003') {
          toast.error('만료된 게시글입니다.');
        } else if (code === 'MERCENARY_BLACKLIST') {
          toast.error('영입 신청이 제한된 계정입니다.');
        } else {
          toast.error('영입 신청에 실패했습니다.');
        }
        setRecruitSheetOpen(false);
      },
    });
  };

  const handleDelete = () => {
    deleteAvail(availId, {
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
      <MercenaryAvailabilityDetailView
        avail={avail}
        onRecruit={handleRecruitPress}
        onEdit={() => router.push(`/(app)/mercenary/availability/${availId}/edit` as any)}
        onDelete={() => setDeleteConfirmOpen(true)}
        isRecruiting={isRecruiting}
      />
      <RecruitBottomSheet
        isOpen={recruitSheetOpen}
        onClose={() => setRecruitSheetOpen(false)}
        onSubmit={handleRecruitSubmit}
        isLoading={isRecruiting}
        defaultContactName={profile?.name ?? ''}
        defaultContactPhone={profile?.phone ?? ''}
      />
      <AlertDialog
        isOpen={phoneAlertOpen}
        title="연락처를 먼저 설정해주세요"
        description="영입 신청 전에 연락처를 등록해야 합니다."
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
