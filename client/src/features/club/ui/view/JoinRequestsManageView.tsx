import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { TextBox, Spacing, Skeleton, ScreenLayout, colors, spacing } from '@ui';
import { JoinRequestCard } from '../components/JoinRequestCard';
import type { JoinRequest } from '../../data/schemas/club.schema';

interface JoinRequestsManageViewProps {
  requests: JoinRequest[];
  isLoading: boolean;
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
  isLoading,
  hasNextPage,
  approvingId,
  rejectingId,
  onApprove,
  onReject,
  onLoadMore,
}: JoinRequestsManageViewProps) {
  if (isLoading) {
    return (
      <ScreenLayout>
        <View style={styles.skeletonList}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} width="100%" height={140} borderRadius={12} />
          ))}
        </View>
      </ScreenLayout>
    );
  }

  const isEmpty = requests.length === 0;

  if (isEmpty) {
    return (
      <ScreenLayout>
        <View style={styles.emptyWrapper}>
          <TextBox variant="body2" color={colors.grey400}>아직 가입 신청이 없습니다.</TextBox>
        </View>
      </ScreenLayout>
    );
  }

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
  skeletonList: {
    padding: spacing[4],
    gap: spacing[3],
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: spacing[4],
  },
});
