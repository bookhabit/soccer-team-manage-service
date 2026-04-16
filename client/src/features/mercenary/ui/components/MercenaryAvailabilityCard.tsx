import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextBox, colors, spacing, AvatarImage, Flex } from '@ui';
import type { MercenaryAvailabilitySummary } from '../../data/schemas/mercenaryAvailability.schema';

interface Props {
  avail: MercenaryAvailabilitySummary;
  onPress: () => void;
}

const POSITION_LABEL: Record<string, string> = {
  FW: 'FW',
  MF: 'MF',
  DF: 'DF',
  GK: 'GK',
};

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: '초급',
  INTERMEDIATE: '중급',
  ADVANCED: '고급',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function MercenaryAvailabilityCard({ avail, onPress }: Props) {
  const sortedDates = [...avail.availableDates].sort();
  const dateLabel =
    sortedDates.length === 1
      ? formatDate(sortedDates[0])
      : `${formatDate(sortedDates[0])} ~ ${formatDate(sortedDates[sortedDates.length - 1])}`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Flex direction="row" align="center" gap={spacing[3]}>
        {avail.userAvatarUrl ? (
          <AvatarImage source={{ uri: avail.userAvatarUrl }} size={48} />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}
        <View style={styles.info}>
          <Flex direction="row" align="center" gap={spacing[2]}>
            <TextBox variant="body2Bold" color={colors.grey900}>{avail.userName}</TextBox>
            {avail.userLevel && (
              <TextBox variant="caption" color={colors.grey500}>
                {LEVEL_LABEL[avail.userLevel] ?? avail.userLevel}
              </TextBox>
            )}
          </Flex>
          <Flex direction="row" gap={spacing[1]} style={styles.positions}>
            {avail.positions.map((pos) => (
              <TextBox key={pos} variant="captionBold" color={colors.primary}>
                {POSITION_LABEL[pos]}
              </TextBox>
            ))}
          </Flex>
          <TextBox variant="caption" color={colors.grey500}>
            {avail.regionNames.join(' · ')}
          </TextBox>
          <TextBox variant="caption" color={colors.grey500}>{dateLabel}</TextBox>
        </View>
      </Flex>
      {avail.isExpired && (
        <View style={styles.expiredBadge}>
          <TextBox variant="captionBold" color={colors.grey500}>만료</TextBox>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.grey100,
  },
  info: { flex: 1, gap: spacing[1] },
  positions: { gap: spacing[2] },
  expiredBadge: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: colors.grey100,
  },
});
