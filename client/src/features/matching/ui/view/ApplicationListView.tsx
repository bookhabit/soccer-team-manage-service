import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { TextBox, Skeleton, Spacing, colors, spacing } from '@ui';
import type { MatchApplicationItem } from '../../data/schemas/matchApplication.schema';
import { ApplicationCard } from '../components/ApplicationCard';

interface ApplicationListViewProps {
  applications: MatchApplicationItem[];
  onAccept: (appId: string) => void;
  onReject: (appId: string) => void;
  acceptingId: string | null;
  rejectingId: string | null;
}

/**
 * 신청 목록 뷰 (게시글 등록자용).
 */
export function ApplicationListView({
  applications,
  onAccept,
  onReject,
  acceptingId,
  rejectingId,
}: ApplicationListViewProps) {
  return (
    <FlatList
      data={applications}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ApplicationCard
          application={item}
          onAccept={() => onAccept(item.id)}
          onReject={() => onReject(item.id)}
          isAccepting={acceptingId === item.id}
          isRejecting={rejectingId === item.id}
        />
      )}
      ListEmptyComponent={<ApplicationListEmptyView />}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    />
  );
}

function ApplicationListEmptyView() {
  return (
    <View style={styles.empty}>
      <TextBox variant="body1" color={colors.grey400}>아직 신청한 팀이 없어요</TextBox>
    </View>
  );
}

export function ApplicationListSkeleton() {
  return (
    <View style={styles.skeleton}>
      {Array.from({ length: 3 }).map((_, i) => (
        <View key={i} style={styles.skeletonCard}>
          <Skeleton width="100%" height={120} borderRadius={12} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing[2], paddingBottom: spacing[20] },
  empty: {
    alignItems: 'center',
    paddingTop: spacing[20],
  },
  skeleton: { padding: spacing[4] },
  skeletonCard: { marginBottom: spacing[3] },
});
