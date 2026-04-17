import React, { useState } from 'react';
import { useToast } from '@ui';
import { useMatchApplications, useAcceptApplication, useRejectApplication } from '../../data/hooks/useMatchApplications';
import { ApplicationListView, ApplicationListSkeleton } from '../view/ApplicationListView';

interface ApplicationListContainerProps {
  postId: string;
}

export function ApplicationListContainer({ postId }: ApplicationListContainerProps) {
  const { data, isPending } = useMatchApplications(postId);
  const { toast } = useToast();

  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const { mutate: accept } = useAcceptApplication(postId);
  const { mutate: reject } = useRejectApplication(postId);

  if (isPending) return <ApplicationListSkeleton />;

  const handleAccept = (appId: string) => {
    setAcceptingId(appId);
    accept(appId, {
      onSuccess: () => {
        toast.success('수락되었습니다. 매칭이 확정되었습니다!');
        setAcceptingId(null);
      },
      onError: (err: any) => {
        const code = err?.response?.data?.code;
        if (code === 'MATCH_APPLICATION_002') {
          toast.error('이미 처리된 신청입니다.');
        } else if (code === 'MATCH_POST_003') {
          toast.error('이미 매칭이 완료된 게시글입니다.');
        } else {
          toast.error('수락에 실패했습니다.');
        }
        setAcceptingId(null);
      },
    });
  };

  const handleReject = (appId: string) => {
    setRejectingId(appId);
    reject(appId, {
      onSuccess: () => {
        toast.info('거절되었습니다.');
        setRejectingId(null);
      },
      onError: () => {
        toast.error('거절에 실패했습니다.');
        setRejectingId(null);
      },
    });
  };

  return (
    <ApplicationListView
      applications={data?.items ?? []}
      onAccept={handleAccept}
      onReject={handleReject}
      acceptingId={acceptingId}
      rejectingId={rejectingId}
    />
  );
}
