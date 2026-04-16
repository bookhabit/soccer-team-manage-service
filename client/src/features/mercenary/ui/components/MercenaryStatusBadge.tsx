import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, colors } from '@ui';
import type { MercenaryPostStatus } from '../../data/schemas/mercenaryPost.schema';

interface Props {
  status: MercenaryPostStatus;
  isExpired: boolean;
}

export function MercenaryStatusBadge({ status, isExpired }: Props) {
  if (isExpired) {
    return (
      <View style={[styles.badge, styles.expired]}>
        <TextBox variant="captionBold" color={colors.grey500}>만료</TextBox>
      </View>
    );
  }

  if (status === 'CLOSED') {
    return (
      <View style={[styles.badge, styles.closed]}>
        <TextBox variant="captionBold" color={colors.blue600}>마감</TextBox>
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
  closed: { backgroundColor: colors.blue50 },
  expired: { backgroundColor: colors.grey100 },
});
