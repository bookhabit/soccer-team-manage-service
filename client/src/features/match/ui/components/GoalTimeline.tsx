import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, colors, spacing } from '@ui';
import type { Goal } from '../../data/schemas/match.schema';

interface GoalTimelineProps {
  goals: Goal[];
  participantNames?: Record<string, string>;
}

export function GoalTimeline({ goals, participantNames = {} }: GoalTimelineProps) {
  if (goals.length === 0) {
    return (
      <TextBox variant="body2" color={colors.grey400}>득점 기록이 없습니다.</TextBox>
    );
  }

  return (
    <View style={styles.container}>
      {goals.map((goal, idx) => {
        const scorer = participantNames[goal.scorerUserId] ?? goal.scorerUserId;
        const assist = goal.assistUserId
          ? participantNames[goal.assistUserId] ?? goal.assistUserId
          : null;
        return (
          <View key={goal.id ?? idx} style={styles.row}>
            <View style={styles.iconCol}>
              <View style={styles.dot} />
              {idx < goals.length - 1 ? <View style={styles.line} /> : null}
            </View>
            <View style={styles.content}>
              <View style={styles.goalRow}>
                <TextBox variant="captionBold" color={colors.grey900}>{scorer}</TextBox>
                {goal.quarterNumber ? (
                  <TextBox variant="caption" color={colors.grey500}>Q{goal.quarterNumber}</TextBox>
                ) : null}
              </View>
              {assist ? (
                <TextBox variant="caption" color={colors.grey500}>어시스트: {assist}</TextBox>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  iconCol: {
    alignItems: 'center',
    width: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.blue500,
    marginTop: 3,
  },
  line: {
    flex: 1,
    width: 1,
    backgroundColor: colors.grey200,
    marginTop: 2,
    minHeight: 20,
  },
  content: {
    flex: 1,
    paddingBottom: spacing[3],
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
});
