import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { TextBox, Button, AvatarImage, ScreenLayout, Spacing, colors, spacing } from '@ui';
import { AttendanceSummary } from '../components/AttendanceSummary';
import { AttendanceChip } from '../components/AttendanceChip';
import { FormationField } from '../components/FormationField';
import { computeMatchStatus } from '../../data/schemas/match.schema';
import type { MatchDetail, Attendance, Quarter } from '../../data/schemas/match.schema';
import type { AttendanceResponse } from '../../data/schemas/match.schema';

interface MatchProgressViewProps {
  match: MatchDetail;
  attendances: Attendance[];
  totalMembers: number;
  isCaptainOrVice: boolean;
  myResponse: AttendanceResponse | null;
  isDeadlinePassed: boolean;
  isSubmittingAttendance: boolean;
  participantNames?: Record<string, string>;
  onAttend: () => void;
  onAbsent: () => void;
  onUndecided: () => void;
  onGoLineup: () => void;
  onGoRecord: () => void;
  onGoMomVote: () => void;
}

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: '입문',
  AMATEUR: '아마추어',
  SEMI_PRO: '세미프로',
  PRO: '프로',
};

export function MatchProgressView({
  match,
  attendances,
  totalMembers,
  isCaptainOrVice,
  myResponse,
  isDeadlinePassed,
  isSubmittingAttendance,
  participantNames = {},
  onAttend,
  onAbsent,
  onUndecided,
  onGoLineup,
  onGoRecord,
  onGoMomVote,
}: MatchProgressViewProps) {
  const status = computeMatchStatus(match.startAt, match.endAt);

  const startDate = new Date(match.startAt);
  const dateLabel = startDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
  const timeLabel = startDate.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const deadlineDate = new Date(match.voteDeadline);
  const deadlineLabel = deadlineDate.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const attending = attendances.filter((a) => a.response === 'ATTEND');
  const absent = attendances.filter((a) => a.response === 'ABSENT');

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.content}>
        {/* 경기 헤더 */}
        <View style={styles.matchHeader}>
          <View style={styles.titleRow}>
            <TextBox variant="heading3" color={colors.grey900}>
              {match.title}
            </TextBox>
            {status === 'DURING' && (
              <View style={styles.duringBadge}>
                <TextBox variant="captionBold" color={colors.orange500}>
                  진행 중
                </TextBox>
              </View>
            )}
          </View>
          {match.opponentName ? (
            <TextBox variant="body2" color={colors.grey700}>
              vs {match.opponentName}
              {match.opponentLevel
                ? ` (${LEVEL_LABEL[match.opponentLevel] ?? match.opponentLevel})`
                : ''}
            </TextBox>
          ) : null}
          <TextBox variant="body2" color={colors.grey500}>
            {dateLabel} {timeLabel}
          </TextBox>
          <TextBox variant="caption" color={colors.grey500}>
            {match.location}
          </TextBox>
          {match.address ? (
            <TextBox variant="caption" color={colors.grey400}>
              {match.address}
            </TextBox>
          ) : null}
        </View>

        <View style={styles.divider} />

        {/* 투표 현황 */}
        <TextBox variant="body2Bold" color={colors.grey900}>
          투표 현황
        </TextBox>
        <Spacing size={2} />
        <AttendanceSummary
          attendCount={match.attendCount}
          absentCount={match.absentCount}
          undecidedCount={match.undecidedCount}
          total={totalMembers}
        />
        <Spacing size={2} />
        <TextBox variant="caption" color={colors.grey500}>
          마감: {deadlineLabel}
        </TextBox>

        {/* 내 응답 + 투표 버튼 (BEFORE 상태, 마감 전) */}
        {status === 'BEFORE' && !isDeadlinePassed ? (
          <>
            <Spacing size={3} />
            <View style={styles.myResponseRow}>
              <TextBox variant="body2" color={colors.grey700}>
                내 응답:
              </TextBox>
              <AttendanceChip response={myResponse} />
            </View>
            <Spacing size={3} />
            <View style={styles.voteButtons}>
              <View style={styles.voteBtn}>
                <Button
                  variant={myResponse === 'ATTEND' ? 'primary' : 'secondary'}
                  onPress={onAttend}
                  loading={isSubmittingAttendance}
                  fullWidth
                >
                  참석
                </Button>
              </View>
              <View style={styles.voteBtn}>
                <Button
                  variant={myResponse === 'UNDECIDED' ? 'primary' : 'secondary'}
                  onPress={onUndecided}
                  loading={isSubmittingAttendance}
                  fullWidth
                >
                  미정
                </Button>
              </View>
              <View style={styles.voteBtn}>
                <Button
                  variant={myResponse === 'ABSENT' ? 'danger' : 'secondary'}
                  onPress={onAbsent}
                  loading={isSubmittingAttendance}
                  fullWidth
                >
                  불참
                </Button>
              </View>
            </View>
          </>
        ) : status === 'BEFORE' && isDeadlinePassed ? (
          <>
            <Spacing size={3} />
            <TextBox variant="caption" color={colors.grey400}>
              투표가 마감되었습니다.
            </TextBox>
          </>
        ) : null}

        <View style={styles.divider} />

        {/* 참석자 목록 */}
        <TextBox variant="body2Bold" color={colors.grey900}>
          참석 선수 ({attending.length})
        </TextBox>
        <Spacing size={2} />
        {attending.length === 0 ? (
          <TextBox variant="body2" color={colors.grey400}>
            참석 선수가 없습니다.
          </TextBox>
        ) : (
          <View style={styles.memberRow}>
            {attending.map((a) => (
              <View key={a.userId} style={styles.memberItem}>
                <AvatarImage
                  source={a.user.avatarUrl ? { uri: a.user.avatarUrl } : null}
                  size={36}
                />
                <TextBox variant="caption" color={colors.grey700} numberOfLines={1}>
                  {a.user.name ?? '선수'}
                </TextBox>
              </View>
            ))}
          </View>
        )}

        {/* 불참자 목록 */}
        {absent.length > 0 ? (
          <>
            <Spacing size={3} />
            <TextBox variant="body2Bold" color={colors.grey900}>
              불참 선수 ({absent.length})
            </TextBox>
            <Spacing size={2} />
            <View style={styles.memberRow}>
              {absent.map((a) => (
                <View key={a.userId} style={styles.memberItem}>
                  <AvatarImage
                    source={a.user.avatarUrl ? { uri: a.user.avatarUrl } : null}
                    size={36}
                  />
                  <TextBox variant="caption" color={colors.grey400} numberOfLines={1}>
                    {a.user.name ?? '선수'}
                  </TextBox>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {/* 관리자 액션 — 종료된 경기에서는 포지션 배정 불가 */}
        {isCaptainOrVice && status !== 'AFTER' ? (
          <>
            <View style={styles.divider} />
            <Button variant="secondary" onPress={onGoLineup}>
              포지션 배정
            </Button>
          </>
        ) : null}

        {/* 경기 후 액션 */}
        {status === 'AFTER' ? (
          <>
            <View style={styles.divider} />
            {isCaptainOrVice && !match.isRecordSubmitted ? (
              <Button variant="primary" onPress={onGoRecord}>
                경기 기록 입력
              </Button>
            ) : match.isRecordSubmitted ? (
              <Button variant="secondary" onPress={onGoMomVote}>
                경기 기록 보기
              </Button>
            ) : null}
          </>
        ) : null}

        <Spacing size={10} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[4],
  },
  matchHeader: {
    gap: spacing[1],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  duringBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.orange50,
  },
  divider: {
    height: 1,
    backgroundColor: colors.grey100,
    marginVertical: spacing[4],
  },
  myResponseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  voteButtons: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  voteBtn: {
    flex: 1,
  },
  memberRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  memberItem: {
    alignItems: 'center',
    gap: 4,
    width: 52,
  },
});
