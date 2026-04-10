import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { TextBox, colors, spacing } from '@ui';
import type { MatchSummary } from '../../data/schemas/match.schema';

interface MatchRecordCardProps {
  match: MatchSummary;
  momName?: string;
  onPress: () => void;
}

export function MatchRecordCard({ match, momName, onPress }: MatchRecordCardProps) {
  const date = new Date(match.startAt);
  const dateLabel = date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });

  const homeScore = match.homeScore ?? 0;
  const awayScore = match.awayScore ?? 0;
  const resultColor =
    homeScore > awayScore
      ? colors.blue500
      : homeScore < awayScore
        ? colors.red500
        : colors.grey500;
  const resultLabel =
    homeScore > awayScore ? '승' : homeScore < awayScore ? '패' : '무';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <TextBox variant="caption" color={colors.grey500}>{dateLabel}</TextBox>
        {match.type === 'LEAGUE' && match.opponentName ? (
          <TextBox variant="caption" color={colors.grey500}>vs {match.opponentName}</TextBox>
        ) : null}
      </View>

      {match.isRecordSubmitted ? (
        <View style={styles.resultRow}>
          <View style={[styles.resultBadge, { backgroundColor: resultColor + '22' }]}>
            <TextBox variant="body2Bold" color={resultColor}>{resultLabel}</TextBox>
          </View>
          <TextBox variant="heading3" color={colors.grey900}>
            {homeScore} : {awayScore}
          </TextBox>
        </View>
      ) : (
        <TextBox variant="body2" color={colors.grey400}>기록 미등록</TextBox>
      )}

      {momName ? (
        <TextBox variant="caption" color={colors.grey500}>⭐ MOM {momName}</TextBox>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.grey200,
    borderRadius: 12,
    padding: spacing[4],
    gap: spacing[2],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  resultBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 6,
  },
});
