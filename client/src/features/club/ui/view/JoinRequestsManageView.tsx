import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Spacing, ScreenLayout, spacing } from '@ui';
import { JoinRequestCard } from '../components/JoinRequestCard';
import type { JoinRequest } from '../../data/schemas/club.schema';

interface JoinRequestsManageViewProps {
  requests: JoinRequest[];
  hasNextPage: boolean;
  approvingId: string | null;
  rejectingId: string | null;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onLoadMore: () => void;
}

/**
 * 가입 신청 관리 View (주장·부주장 전용).
 * - 4-state: 로딩 / 빈 상태 / 목록 표시
 */
export function JoinRequestsManageView({
  requests,
  hasNextPage,
  approvingId,
  rejectingId,
  onApprove,
  onReject,
  onLoadMore,
}: JoinRequestsManageViewProps) {
  return (
    <ScreenLayout>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <JoinRequestCard
            request={item}
            onApprove={() => onApprove(item.id)}
            onReject={() => onReject(item.id)}
            isApproving={approvingId === item.id}
            isRejecting={rejectingId === item.id}
          />
        )}
        onEndReached={hasNextPage ? onLoadMore : undefined}
        onEndReachedThreshold={0.5}
        ItemSeparatorComponent={() => <Spacing size={0} />}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing[4],
  },
});
