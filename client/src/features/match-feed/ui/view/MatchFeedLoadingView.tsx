import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenLayout, Skeleton, Spacing, spacing, colors } from '@ui';

function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Skeleton width={28} height={28} borderRadius={14} />
        <Skeleton width={100} height={14} borderRadius={6} />
      </View>
      <Spacing size={3} />
      <View style={styles.scoreRow}>
        <Skeleton width={80} height={14} borderRadius={6} />
        <Skeleton width={60} height={28} borderRadius={6} />
        <Skeleton width={80} height={14} borderRadius={6} />
      </View>
      <Spacing size={3} />
      <Skeleton width={160} height={12} borderRadius={4} />
    </View>
  );
}

export function MatchFeedLoadingView() {
  return (
    <ScreenLayout>
      {/* 필터바 스켈레톤 */}
      <View style={styles.filterBar}>
        <Skeleton width={60} height={30} borderRadius={15} />
        <Skeleton width={60} height={30} borderRadius={15} />
        <Skeleton width={60} height={30} borderRadius={15} />
        <Skeleton width={70} height={30} borderRadius={15} />
      </View>

      <Spacing size={3} />

      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  filterBar: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    marginHorizontal: spacing[4],
    marginBottom: spacing[3],
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.grey100,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
});
