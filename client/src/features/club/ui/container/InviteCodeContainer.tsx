import React from 'react';
import { Share } from 'react-native';
import { useToast } from '@ui';
import { useInviteCode, useRenewInviteCode } from '../../data/hooks/useClub';
import { InviteCodeView } from '../view/InviteCodeView';

interface InviteCodeContainerProps {
  clubId: string;
}

/**
 * 초대 코드 Container.
 * 코드 조회 + Share API로 공유 + 재발급.
 */
export function InviteCodeContainer({ clubId }: InviteCodeContainerProps) {
  const { toast } = useToast();

  const { data: inviteCode, isLoading } = useInviteCode(clubId);
  const { mutate: renew, isPending: isRenewing } = useRenewInviteCode(clubId);

  const handleCopy = async () => {
    if (!inviteCode) return;
    try {
      await Share.share({ message: `FC Flow 초대 코드: ${inviteCode.code}` });
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
      isLoading={isLoading}
      isRenewing={isRenewing}
      onCopy={handleCopy}
      onRenew={handleRenew}
    />
  );
}
