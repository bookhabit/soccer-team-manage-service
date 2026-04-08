import React, { useState } from 'react';
import { router } from 'expo-router';
import { useToast } from '@ui';
import { useMemberDetail, useKickMember, useMyClub } from '../../data/hooks/useClub';
import { MemberDetailView } from '../view/MemberDetailView';

interface MemberDetailContainerProps {
  clubId: string;
  userId: string;
}

/**
 * 팀원 상세 Container.
 * FIFA 카드 표시 + 권한에 따른 강퇴 기능 제공.
 */
export function MemberDetailContainer({ clubId, userId }: MemberDetailContainerProps) {
  const [isKickDialogOpen, setIsKickDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: member, isLoading } = useMemberDetail(clubId, userId);
  const { data: myClub } = useMyClub();
  const { mutate: kick, isPending: isKicking } = useKickMember(clubId);

  const myRole = myClub?.myRole ?? null;

  const handleKick = () => {
    kick(userId, {
      onSuccess: () => {
        toast.success('강퇴 처리되었습니다.');
        setIsKickDialogOpen(false);
        router.back();
      },
      onError: () => {
        toast.error('강퇴에 실패했습니다.');
      },
    });
  };

  return (
    <MemberDetailView
      member={member}
      isLoading={isLoading}
      myRole={myRole}
      isKickDialogOpen={isKickDialogOpen}
      isKicking={isKicking}
      onKick={handleKick}
      onOpenKickDialog={() => setIsKickDialogOpen(true)}
      onCloseKickDialog={() => setIsKickDialogOpen(false)}
    />
  );
}
