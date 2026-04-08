import React, { useState } from 'react';
import { useToast } from '@ui';
import {
  useJoinRequests,
  useApproveJoinRequest,
  useRejectJoinRequest,
} from '../../data/hooks/useClub';
import { JoinRequestsManageView } from '../view/JoinRequestsManageView';

interface JoinRequestsManageContainerProps {
  clubId: string;
}

/**
 * 가입 신청 관리 Container (주장·부주장 전용).
 */
export function JoinRequestsManageContainer({ clubId }: JoinRequestsManageContainerProps) {
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data, isLoading, fetchNextPage, hasNextPage } = useJoinRequests(clubId);
  const { mutate: approve } = useApproveJoinRequest(clubId);
  const { mutate: reject } = useRejectJoinRequest(clubId);

  const requests = data?.pages.flatMap((p) => p.data) ?? [];

  const handleApprove = (requestId: string) => {
    setApprovingId(requestId);
    approve(requestId, {
      onSuccess: () => toast.success('승인되었습니다.'),
      onError: () => toast.error('승인에 실패했습니다.'),
      onSettled: () => setApprovingId(null),
    });
  };

  const handleReject = (requestId: string) => {
    setRejectingId(requestId);
    reject(requestId, {
      onSuccess: () => toast.info('거절되었습니다.'),
      onError: () => toast.error('거절에 실패했습니다.'),
      onSettled: () => setRejectingId(null),
    });
  };

  return (
    <JoinRequestsManageView
      requests={requests}
      isLoading={isLoading}
      hasNextPage={hasNextPage ?? false}
      approvingId={approvingId}
      rejectingId={rejectingId}
      onApprove={handleApprove}
      onReject={handleReject}
      onLoadMore={() => fetchNextPage()}
    />
  );
}
