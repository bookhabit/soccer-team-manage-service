import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { TextBox, colors, spacing } from '@ui';
import { computeMatchStatus } from '../../data/schemas/match.schema';
import { AttendanceChip } from './AttendanceChip';
import { AttendanceSummary } from './AttendanceSummary';
import type { MatchSummary } from '../../data/schemas/match.schema';

interface MatchCardProps {
  match: MatchSummary;
  totalMembers?: number;
  onPress: () => void;
}

const TYPE_LABEL: Record<string, string> = {
  LEAGUE: '매칭전',
  SELF: '자체전',
};

const STATUS_COLOR: Record<string, string> = {
  BEFORE: colors.blue500,
  DURING: colors.orange500,
  AFTER: colors.grey400,
};

const STATUS_LABEL: Record<string, string> = {
  BEFORE: '예정',
  DURING: '진행 중',
  AFTER: '종료',
};

export function MatchCard({ match, totalMembers = 0, onPress }: MatchCardProps) {
  const status = computeMatchStatus(match.startAt, match.endAt);
  const startDate = new Date(match.startAt);
  const dateLabel = startDate.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
  const timeLabel = startDate.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const statusColor = STATUS_COLOR[status];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* 상단: 유형 배지 + 상태 배지 */}
      <View style={styles.badgeRow}>
        <View style={[styles.typeBadge]}>
          <TextBox variant="captionBold" color={colors.blue600}>
            {TYPE_LABEL[match.type]}
          </TextBox>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
          <TextBox variant="captionBold" color={statusColor}>
            {STATUS_LABEL[status]}
          </TextBox>
        </View>
      </View>

      {/* 제목 */}
      <TextBox variant="body2Bold" color={colors.grey900}>
        {match.title}
      </TextBox>

      {/* 상대팀 (매칭전) */}
      {match.opponentName ? (
        <TextBox variant="body2" color={colors.grey700}>
          vs {match.opponentName}
        </TextBox>
      ) : null}

      {/* 날짜·장소 */}
      <TextBox variant="caption" color={colors.grey500}>
        {dateLabel} {timeLabel} · {match.location}
      </TextBox>

      {/* 투표 현황 */}
      {status !== 'AFTER' ? (
        <AttendanceSummary
          attendCount={match.attendCount}
          absentCount={match.absentCount}
          total={totalMembers}
        />
      ) : null}

      {/* 내 응답 */}
      <View style={styles.myResponse}>
        <TextBox variant="caption" color={colors.grey500}>
          내 응답
        </TextBox>
        <AttendanceChip response={match.myResponse} />
      </View>

      {/* 경기 결과 (종료 후) */}
      {status === 'AFTER' && match.isRecordSubmitted ? (
        <TextBox variant="body2Bold" color={colors.grey900} style={styles.score}>
          {match.homeScore} : {match.awayScore}
        </TextBox>
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
    marginHorizontal: spacing[4],
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  typeBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.blue50,
  },
  statusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
  },
  myResponse: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  score: {
    textAlign: 'center',
  },
});
