import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { TextBox, AvatarImage, colors, spacing } from '@ui';
import type { Attendance } from '../../data/schemas/match.schema';

interface MomVoteListProps {
  participants: Attendance[];
  selectedUserId: string | null;
  myUserId: string;
  hasVoted: boolean;
  isDeadlinePassed: boolean;
  onSelect: (userId: string) => void;
}

export function MomVoteList({
  participants,
  selectedUserId,
  myUserId,
  hasVoted,
  isDeadlinePassed,
  onSelect,
}: MomVoteListProps) {
  const disabled = hasVoted || isDeadlinePassed;

  if (participants.length === 0) {
    return <TextBox variant="body2" color={colors.grey400}>참여 선수가 없습니다.</TextBox>;
  }

  return (
    <View style={styles.container}>
      {participants
        .filter((p) => p.userId !== myUserId)
        .map((p) => {
          const isSelected = selectedUserId === p.userId;
          return (
            <TouchableOpacity
              key={p.userId}
              style={[styles.row, isSelected && styles.rowSelected, disabled && styles.rowDisabled]}
              onPress={() => !disabled && onSelect(p.userId)}
              activeOpacity={disabled ? 1 : 0.7}
            >
              <AvatarImage
                source={p.user.avatarUrl ? { uri: p.user.avatarUrl } : null}
                size={36}
              />
              <TextBox variant="body2" color={colors.grey900}>{p.user.name ?? '선수'}</TextBox>
              {isSelected ? (
                <View style={styles.checkBadge}>
                  <TextBox variant="captionBold" color={colors.blue600}>선택</TextBox>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.grey200,
    backgroundColor: colors.background,
  },
  rowSelected: {
    borderColor: colors.blue500,
    backgroundColor: colors.blue50,
  },
  rowDisabled: {
    opacity: 0.6,
  },
  checkBadge: {
    marginLeft: 'auto',
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.blue100,
  },
});
