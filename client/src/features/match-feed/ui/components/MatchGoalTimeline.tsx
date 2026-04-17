import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, colors, spacing } from '@ui';
import type { MatchGoalItem } from '../../data/schemas/matchFeed.schema';

interface MatchGoalTimelineProps {
  goals: MatchGoalItem[];
}

export function MatchGoalTimeline({ goals }: MatchGoalTimelineProps) {
  if (goals.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <TextBox variant="body2" color={colors.grey400}>
          득점 기록이 없습니다.
        </TextBox>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {goals.map((goal, index) => (
        <View
          key={`${goal.scorerUserId}-${index}`}
          style={[styles.row, index < goals.length - 1 && styles.rowBorder]}
        >
          {/* 쿼터 */}
          <View style={styles.quarterBadge}>
            {goal.quarterNumber != null ? (
              <TextBox variant="captionBold" color={colors.primary}>
                Q{goal.quarterNumber}
              </TextBox>
            ) : (
              <View style={styles.dotIndicator} />
            )}
          </View>

          {/* 득점자 정보 */}
          <View style={styles.content}>
            <View style={styles.scorerRow}>
              {/* SELF 경기 팀 표시 */}
              {goal.team != null && (
                <View style={[
                  styles.teamBadge,
                  goal.team === 'A' ? styles.teamBadgeA : styles.teamBadgeB,
                ]}>
                  <TextBox variant="caption" color={goal.team === 'A' ? colors.blue600 : colors.grey600}>
                    {goal.team}팀
                  </TextBox>
                </View>
              )}
              <TextBox variant="body2Bold" color={colors.grey900}>
                {goal.scorerUserName}
              </TextBox>
            </View>

            {goal.assistUserName != null && (
              <TextBox variant="caption" color={colors.grey500}>
                도움: {goal.assistUserName}
              </TextBox>
            )}
          </View>

          {/* 골 아이콘 (텍스트로 대체) */}
          <TextBox variant="body2" color={colors.grey400}>
            ⚽
          </TextBox>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.grey100,
    overflow: 'hidden',
  },
  emptyContainer: {
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    gap: spacing[3],
    backgroundColor: colors.background,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  quarterBadge: {
    width: 32,
    alignItems: 'center',
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.grey300,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  scorerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  teamBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
  },
  teamBadgeA: {
    backgroundColor: colors.blue50,
  },
  teamBadgeB: {
    backgroundColor: colors.grey100,
  },
});
