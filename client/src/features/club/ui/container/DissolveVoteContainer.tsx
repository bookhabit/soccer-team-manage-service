import React, { useState } from 'react';
import { View } from 'react-native';
import { Skeleton, ScreenLayout, useToast } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import {
  useDissolveVote,
  useStartDissolveVote,
  useRespondDissolveVote,
  useMyClub,
} from '../../data/hooks/useClub';
import { DissolveVoteView } from '../view/DissolveVoteView';

interface DissolveVoteContainerProps {
  clubId: string;
}

function DissolveVoteSkeleton() {
  return (
    <ScreenLayout>
      <View style={{ padding: 20 }}>
        <Skeleton width="100%" height={160} borderRadius={16} />
      </View>
    </ScreenLayout>
  );
}

function DissolveVoteContent({ clubId }: DissolveVoteContainerProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { toast } = useToast();

  const { data: vote } = useDissolveVote(clubId);
  const { data: myClub } = useMyClub();
  const { mutate: startVote, isPending: isStarting } = useStartDissolveVote(clubId);
  const { mutate: respond, isPending: isResponding } = useRespondDissolveVote(clubId);

  const isCaptain = myClub?.myRole === 'CAPTAIN';

  const handleStartVote = () => {
    startVote(undefined, {
      onSuccess: () => {
        toast.info('해체 요청이 전송되었습니다.');
        setIsConfirmOpen(false);
      },
      onError: () => toast.error('해체 요청에 실패했습니다.'),
    });
  };

  const handleRespond = (agreed: boolean) => {
    respond(agreed, {
      onSuccess: () => toast.info(agreed ? '동의하셨습니다.' : '반대하셨습니다.'),
      onError: () => toast.error('응답에 실패했습니다.'),
    });
  };

  return (
    <DissolveVoteView
      vote={vote}
      isCaptain={isCaptain}
      isResponding={isResponding}
      isStarting={isStarting}
      isConfirmOpen={isConfirmOpen}
      onStartVote={handleStartVote}
      onAgree={() => handleRespond(true)}
      onDisagree={() => handleRespond(false)}
      onOpenConfirm={() => setIsConfirmOpen(true)}
      onCloseConfirm={() => setIsConfirmOpen(false)}
    />
  );
}

export function DissolveVoteContainer({ clubId }: DissolveVoteContainerProps) {
  return (
    <AsyncBoundary loadingFallback={<DissolveVoteSkeleton />}>
      <DissolveVoteContent clubId={clubId} />
    </AsyncBoundary>
  );
}
