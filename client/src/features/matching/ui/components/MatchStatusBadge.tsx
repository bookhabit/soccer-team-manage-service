import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, colors } from '@ui';
import type { MatchPostStatus } from '../../data/schemas/matchPost.schema';

interface MatchStatusBadgeProps {
  status: MatchPostStatus;
  isExpired: boolean;
}

/**
 * 매칭 게시글 상태 뱃지.
 * 만료된 경우 우선 표시, OPEN/MATCHED는 각각 초록/파랑
 */
export function MatchStatusBadge({ status, isExpired }: MatchStatusBadgeProps) {
  if (isExpired) {
    return (
      <View style={[styles.badge, styles.expired]}>
        <TextBox variant="captionBold" color={colors.grey500}>마감</TextBox>
      </View>
    );
  }

  if (status === 'CANCELLED') {
    return (
      <View style={[styles.badge, styles.cancelled]}>
        <TextBox variant="captionBold" color={colors.grey500}>취소됨</TextBox>
      </View>
    );
  }

  if (status === 'MATCHED') {
    return (
      <View style={[styles.badge, styles.matched]}>
        <TextBox variant="captionBold" color={colors.blue600}>매칭완료</TextBox>
      </View>
    );
  }

  return (
    <View style={[styles.badge, styles.open]}>
      <TextBox variant="captionBold" color={colors.green600}>모집중</TextBox>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  open: { backgroundColor: colors.green50 },
  matched: { backgroundColor: colors.blue50 },
  cancelled: { backgroundColor: colors.grey100 },
  expired: { backgroundColor: colors.grey100 },
});
