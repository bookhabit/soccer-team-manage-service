import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Skeleton, ScreenLayout, useToast } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { useMemberDetail, useKickMember, useMyClub } from '../../data/hooks/useClub';
import { MemberDetailView } from '../view/MemberDetailView';

interface MemberDetailContainerProps {
  clubId: string;
  userId: string;
}

function MemberDetailSkeleton() {
  return (
    <ScreenLayout>
      <View style={{ padding: 16 }}>
        <Skeleton width="100%" height={280} borderRadius={20} />
      </View>
    </ScreenLayout>
  );
}

function MemberDetailContent({ clubId, userId }: MemberDetailContainerProps) {
  const [isKickDialogOpen, setIsKickDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: member } = useMemberDetail(clubId, userId);
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
      onError: () => toast.error('강퇴에 실패했습니다.'),
    });
  };

  return (
    <MemberDetailView
      member={member}
      myRole={myRole}
      isKickDialogOpen={isKickDialogOpen}
      isKicking={isKicking}
      onKick={handleKick}
      onOpenKickDialog={() => setIsKickDialogOpen(true)}
      onCloseKickDialog={() => setIsKickDialogOpen(false)}
    />
  );
}

export function MemberDetailContainer({ clubId, userId }: MemberDetailContainerProps) {
  return (
    <AsyncBoundary loadingFallback={<MemberDetailSkeleton />}>
      <MemberDetailContent clubId={clubId} userId={userId} />
    </AsyncBoundary>
  );
}
