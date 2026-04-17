import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { TextBox, AvatarImage, colors, spacing } from '@ui';
import { RecruitmentBadge } from './RecruitmentBadge';
import type { ClubPreview } from '../../data/schemas/club.schema';
import { LEVEL_LABEL } from '@/src/shared/constants/player.constants';
import { getClubLogoUrl } from '@/src/shared/utils/imageUrl';

interface ClubPreviewCardProps {
  club: ClubPreview;
  onPress: () => void;
}

/**
 * 클럽 검색 결과 목록에서 사용하는 클럽 카드 컴포넌트.
 */
export function ClubPreviewCard({ club, onPress }: ClubPreviewCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <AvatarImage source={{ uri: getClubLogoUrl(club.logoUrl) }} size={48} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <TextBox variant="body1Bold" color={colors.grey900}>
            {club.name}
          </TextBox>
          <RecruitmentBadge status={club.recruitmentStatus} />
        </View>
        <View style={styles.metaRow}>
          <TextBox variant="caption" color={colors.grey500}>
            {club.regionName}
          </TextBox>
          <TextBox variant="caption" color={colors.grey400}>
            {' '}
            ·{' '}
          </TextBox>
          <TextBox variant="caption" color={colors.grey500}>
            {LEVEL_LABEL[club.level] ?? club.level}
          </TextBox>
          <TextBox variant="caption" color={colors.grey400}>
            {' '}
            ·{' '}
          </TextBox>
          <TextBox variant="caption" color={colors.grey500}>
            {club.currentMemberCount}/{club.maxMemberCount}명
          </TextBox>
        </View>
        <View style={styles.mannerRow}>
          <TextBox variant="captionBold" color={colors.blue500}>
            ⭐ {club.mannerScoreAvg.toFixed(1)}
          </TextBox>
        </View>
      </View>
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
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mannerRow: {
    flexDirection: 'row',
  },
});
