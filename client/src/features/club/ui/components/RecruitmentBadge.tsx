import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, colors, spacing } from '@ui';
import type { RecruitmentStatus } from '../../data/schemas/club.schema';

interface RecruitmentBadgeProps {
  status: RecruitmentStatus;
}

/**
 * 클럽 모집 상태(모집중 / 마감)를 표시하는 배지 컴포넌트.
 */
export function RecruitmentBadge({ status }: RecruitmentBadgeProps) {
  const isOpen = status === 'OPEN';

  return (
    <View style={[styles.badge, isOpen ? styles.open : styles.closed]}>
      <TextBox variant="captionBold" color={isOpen ? colors.blue500 : colors.grey500}>
        {isOpen ? '모집중' : '마감'}
      </TextBox>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  open: {
    backgroundColor: colors.blue50,
  },
  closed: {
    backgroundColor: colors.grey100,
  },
});
