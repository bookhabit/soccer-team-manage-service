import React from 'react';
import { View, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Skeleton, Spacing, ScreenLayout, useToast } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { useInviteCode, useRenewInviteCode } from '../../data/hooks/useClub';
import { InviteCodeView } from '../view/InviteCodeView';

interface InviteCodeContainerProps {
  clubId: string;
}

function InviteCodeSkeleton() {
  return (
    <ScreenLayout>
      <View style={{ padding: 20 }}>
        <Skeleton width="40%" height={24} />
        <Spacing size={6} />
        <Skeleton width="100%" height={100} borderRadius={16} />
      </View>
    </ScreenLayout>
  );
}

function InviteCodeContent({ clubId }: InviteCodeContainerProps) {
  const { toast } = useToast();

  const { data: inviteCode } = useInviteCode(clubId);
  const { mutate: renew, isPending: isRenewing } = useRenewInviteCode(clubId);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(inviteCode.code);
    toast.success('코드가 복사되었습니다.');
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: inviteCode.code });
    } catch {
      toast.error('공유에 실패했습니다.');
    }
  };

  const handleRenew = () => {
    renew(undefined, {
      onSuccess: () => toast.success('코드가 재발급되었습니다.'),
      onError: () => toast.error('코드 재발급에 실패했습니다.'),
    });
  };

  return (
    <InviteCodeView
      inviteCode={inviteCode}
      isRenewing={isRenewing}
      onCopy={handleCopy}
      onShare={handleShare}
      onRenew={handleRenew}
    />
  );
}

export function InviteCodeContainer({ clubId }: InviteCodeContainerProps) {
  return (
    <AsyncBoundary loadingFallback={<InviteCodeSkeleton />}>
      <InviteCodeContent clubId={clubId} />
    </AsyncBoundary>
  );
}
