import React, { useState } from 'react';
import { View } from 'react-native';
import { Skeleton, ScreenLayout, useToast } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { EmptyBoundary } from '@/src/shared/ui/server-state-handling/EmptyBoundary';
import { TextBox } from '@ui';
import { colors } from '@ui';
import {
  useJoinRequests,
  useApproveJoinRequest,
  useRejectJoinRequest,
} from '../../data/hooks/useClub';
import { JoinRequestsManageView } from '../view/JoinRequestsManageView';

interface JoinRequestsManageContainerProps {
  clubId: string;
}

function JoinRequestsSkeleton() {
  return (
    <ScreenLayout>
      <View style={{ padding: 16, gap: 12 }}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} width="100%" height={140} borderRadius={12} />
        ))}
      </View>
    </ScreenLayout>
  );
}

function EmptyRequests() {
  return (
    <ScreenLayout>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <TextBox variant="body2" color={colors.grey400}>아직 가입 신청이 없습니다.</TextBox>
      </View>
    </ScreenLayout>
  );
}

function JoinRequestsManageContent({ clubId }: JoinRequestsManageContainerProps) {
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data, fetchNextPage, hasNextPage } = useJoinRequests(clubId);
  const { mutate: approve } = useApproveJoinRequest(clubId);
  const { mutate: reject } = useRejectJoinRequest(clubId);

  const requests = data.pages.flatMap((p) => p.data);

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
    <EmptyBoundary data={requests} fallback={<EmptyRequests />}>
      <JoinRequestsManageView
        requests={requests}
        hasNextPage={hasNextPage ?? false}
        approvingId={approvingId}
        rejectingId={rejectingId}
        onApprove={handleApprove}
        onReject={handleReject}
        onLoadMore={() => fetchNextPage()}
      />
    </EmptyBoundary>
  );
}

export function JoinRequestsManageContainer({ clubId }: JoinRequestsManageContainerProps) {
  return (
    <AsyncBoundary loadingFallback={<JoinRequestsSkeleton />}>
      <JoinRequestsManageContent clubId={clubId} />
    </AsyncBoundary>
  );
}
