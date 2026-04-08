import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, AvatarImage, colors, spacing } from '@ui';
import type { MemberDetail } from '../../data/schemas/club.schema';
import { POSITION_LABEL, LEVEL_LABEL } from '@/src/shared/constants/player.constants';

interface FifaCardProps {
  member: MemberDetail;
}

interface StatRowProps {
  label: string;
  value: number | null;
}

function StatRow({ label, value }: StatRowProps) {
  const display = value != null ? String(value) : '-';
  return (
    <View style={styles.statRow}>
      <TextBox variant="captionBold" color={colors.grey500}>{label}</TextBox>
      <TextBox variant="body2Bold" color={colors.grey900}>{display}</TextBox>
    </View>
  );
}

/**
 * 팀원 상세 화면에서 표시하는 FIFA 카드 스타일 컴포넌트.
 */
export function FifaCard({ member }: FifaCardProps) {
  const positionLabel = member.position ? POSITION_LABEL[member.position] : '-';
  const levelLabel = member.level ? LEVEL_LABEL[member.level] : '-';
  const canShowStats = member.stats.isStatsPublic;

  return (
    <View style={styles.card}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <AvatarImage source={member.avatarUrl ? { uri: member.avatarUrl } : null} size={72} />
        <View style={styles.headerInfo}>
          <TextBox variant="heading3" color={colors.grey900}>{member.name}</TextBox>
          <View style={styles.tagRow}>
            <TextBox variant="captionBold" color={colors.blue500}>{positionLabel}</TextBox>
            <TextBox variant="caption" color={colors.grey400}> · </TextBox>
            <TextBox variant="caption" color={colors.grey500}>{levelLabel}</TextBox>
          </View>
          <TextBox variant="caption" color={colors.grey500}>⭐ {member.mannerScore.toFixed(1)}</TextBox>
        </View>
      </View>

      <View style={styles.divider} />

      {/* 시즌 기록 */}
      <View style={styles.section}>
        <TextBox variant="body2Bold" color={colors.grey700}>시즌 기록</TextBox>
        <View style={styles.statsGrid}>
          <StatRow label="경기" value={member.stats.matchCount} />
          <StatRow label="골" value={member.stats.goals} />
          <StatRow label="어시스트" value={member.stats.assists} />
          <StatRow label="MOM" value={member.stats.momCount} />
        </View>
      </View>

      <View style={styles.divider} />

      {/* 능력치 */}
      <View style={styles.section}>
        <TextBox variant="body2Bold" color={colors.grey700}>능력치</TextBox>
        {canShowStats ? (
          <View style={styles.statsGrid}>
            <StatRow label="속도" value={member.stats.speed} />
            <StatRow label="슛" value={member.stats.shoot} />
            <StatRow label="패스" value={member.stats.pass} />
            <StatRow label="드리블" value={member.stats.dribble} />
            <StatRow label="수비" value={member.stats.defense} />
            <StatRow label="체력" value={member.stats.physical} />
          </View>
        ) : (
          <TextBox variant="body2" color={colors.grey400}>비공개 능력치입니다.</TextBox>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.grey200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    padding: spacing[5],
    backgroundColor: colors.blue50,
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.grey200,
  },
  section: {
    padding: spacing[4],
    gap: spacing[3],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  statRow: {
    width: '30%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing[1],
  },
});
