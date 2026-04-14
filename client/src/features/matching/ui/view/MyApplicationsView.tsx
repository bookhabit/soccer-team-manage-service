import React from 'react';
import { FlatList, View, TouchableOpacity, StyleSheet } from 'react-native';
import { TextBox, Skeleton, Spacing, colors, spacing } from '@ui';
import type { MyApplicationItem } from '../../data/schemas/matchApplication.schema';
import { MatchStatusBadge } from '../components/MatchStatusBadge';

interface MyApplicationsViewProps {
  applications: MyApplicationItem[];
  onPostPress: (postId: string) => void;
}

const APP_STATUS_LABEL: Record<string, string> = {
  PENDING: '검토중',
  ACCEPTED: '수락됨',
  REJECTED: '거절됨',
};

const APP_STATUS_COLOR: Record<string, string> = {
  PENDING: colors.blue500,
  ACCEPTED: colors.green500,
  REJECTED: colors.grey400,
};

/**
 * 내 신청 목록 뷰 (신청팀 관리자용).
 */
export function MyApplicationsView({ applications, onPostPress }: MyApplicationsViewProps) {
  return (
    <FlatList
      data={applications}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MyApplicationItem application={item} onPress={() => onPostPress(item.post.id)} />
      )}
      ListEmptyComponent={<MyApplicationsEmptyView />}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    />
  );
}

function MyApplicationItem({ application, onPress }: { application: MyApplicationItem; onPress: () => void }) {
  const { post } = application;
  const dateLabel = new Date(post.matchDate).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });
  const statusColor = APP_STATUS_COLOR[application.status] ?? colors.grey400;
  const statusLabel = APP_STATUS_LABEL[application.status] ?? application.status;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <TextBox variant="body1Bold" color={colors.grey900}>{post.clubName}</TextBox>
        <TextBox variant="captionBold" color={statusColor}>{statusLabel}</TextBox>
      </View>
      <TextBox variant="body2" color={colors.grey700}>
        {dateLabel} · {post.startTime}–{post.endTime}
      </TextBox>
      <TextBox variant="caption" color={colors.grey500}>{post.location}</TextBox>
      <View style={styles.badgeRow}>
        <MatchStatusBadge status={post.status} isExpired={post.isExpired} />
        <TextBox variant="caption" color={colors.grey400} style={styles.date}>
          신청일: {new Date(application.createdAt).toLocaleDateString('ko-KR')}
        </TextBox>
      </View>
    </TouchableOpacity>
  );
}

function MyApplicationsEmptyView() {
  return (
    <View style={styles.empty}>
      <TextBox variant="body1" color={colors.grey400}>신청한 매칭이 없어요</TextBox>
      <Spacing size={2} />
      <TextBox variant="body2" color={colors.grey300}>전체 탭에서 마음에 드는 팀을 찾아보세요</TextBox>
    </View>
  );
}

export function MyApplicationsSkeleton() {
  return (
    <View style={styles.skeleton}>
      {Array.from({ length: 3 }).map((_, i) => (
        <View key={i} style={styles.skeletonCard}>
          <Skeleton width="100%" height={100} borderRadius={12} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing[2], paddingBottom: spacing[20] },
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing[4],
    marginHorizontal: spacing[4],
    marginVertical: spacing[1],
    borderWidth: 1,
    borderColor: colors.grey100,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[3],
  },
  date: {},
  empty: { alignItems: 'center', paddingTop: spacing[20] },
  skeleton: { padding: spacing[4] },
  skeletonCard: { marginBottom: spacing[3] },
});
