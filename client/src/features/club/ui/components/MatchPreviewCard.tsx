import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { TextBox, colors, spacing } from '@ui';

interface MatchPreview {
  id: string;
  opponentName: string;
  scheduledAt: string;
  location?: string | null;
}

interface MatchPreviewCardProps {
  match: MatchPreview;
  onPress: () => void;
}

/**
 * 클럽 대시보드에서 이번 주 예정 경기를 미리 보여주는 카드 컴포넌트.
 */
export function MatchPreviewCard({ match, onPress }: MatchPreviewCardProps) {
  const matchDate = new Date(match.scheduledAt);
  const dateLabel = matchDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
  const timeLabel = matchDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.badge}>
        <TextBox variant="captionBold" color={colors.blue500}>예정</TextBox>
      </View>
      <TextBox variant="body2Bold" color={colors.grey900}>vs {match.opponentName}</TextBox>
      <TextBox variant="caption" color={colors.grey500}>{dateLabel} {timeLabel}</TextBox>
      {match.location ? (
        <TextBox variant="caption" color={colors.grey400}>{match.location}</TextBox>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.grey200,
    borderRadius: 12,
    padding: spacing[4],
    gap: 4,
    backgroundColor: colors.background,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    backgroundColor: colors.blue50,
    borderRadius: 4,
    marginBottom: 4,
  },
});
