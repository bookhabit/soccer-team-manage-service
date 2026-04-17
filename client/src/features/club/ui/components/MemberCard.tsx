import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { TextBox, AvatarImage, colors, spacing } from '@ui';
import type { ClubMember } from '../../data/schemas/club.schema';
import { POSITION_LABEL } from '@/src/shared/constants/player.constants';
import { getAvatarUrl } from '@/src/shared/utils/imageUrl';

interface MemberCardProps {
  member: ClubMember;
  isMe?: boolean;
  onPress: () => void;
}

const ROLE_LABEL: Record<string, string> = {
  CAPTAIN: '주장',
  VICE_CAPTAIN: '부주장',
  MEMBER: '',
};

/**
 * 팀원 목록에서 사용하는 팀원 카드 컴포넌트.
 */
export function MemberCard({ member, isMe = false, onPress }: MemberCardProps) {
  const roleLabel = ROLE_LABEL[member.role];
  const positionLabel = member.position ? POSITION_LABEL[member.position] : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <AvatarImage source={{ uri: getAvatarUrl(member.avatarUrl) }} size={44} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <TextBox variant="body1Bold" color={colors.grey900}>{member.name}</TextBox>
          {isMe ? (
            <View style={styles.meBadge}>
              <TextBox variant="captionBold" color={colors.blue500}>나</TextBox>
            </View>
          ) : null}
          {roleLabel ? (
            <TextBox variant="captionBold" color={colors.blue500}>{roleLabel}</TextBox>
          ) : null}
        </View>
        <View style={styles.metaRow}>
          {positionLabel ? (
            <TextBox variant="caption" color={colors.grey500}>{positionLabel}</TextBox>
          ) : null}
          {member.jerseyNumber != null ? (
            <TextBox variant="caption" color={colors.grey500}>
              {positionLabel ? ' · ' : ''}#{member.jerseyNumber}
            </TextBox>
          ) : null}
        </View>
      </View>
      <TextBox variant="body2" color={colors.grey400}>{'>'}</TextBox>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
    backgroundColor: colors.background,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  meBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.blue50,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
