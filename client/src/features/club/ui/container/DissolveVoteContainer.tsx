import React, { useState } from 'react';
import { useToast } from '@ui';
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

/**
 * 해체 투표 Container.
 * 주장은 투표 시작, 팀원은 동의·거절 응답.
 */
export function DissolveVoteContainer({ clubId }: DissolveVoteContainerProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { toast } = useToast();

  const { data: vote, isLoading } = useDissolveVote(clubId);
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
      onSuccess: () => {
        toast.info(agreed ? '동의하셨습니다.' : '반대하셨습니다.');
      },
      onError: () => toast.error('응답에 실패했습니다.'),
    });
  };

  return (
    <DissolveVoteView
      vote={vote}
      isLoading={isLoading}
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
