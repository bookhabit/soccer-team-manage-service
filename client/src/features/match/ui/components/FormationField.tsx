import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, colors, spacing } from '@ui';
type Assignment = { userId: string; position: 'FW' | 'MF' | 'DF' | 'GK' };

interface FormationFieldProps {
  formation: string;
  assignments: Assignment[];
  participantNames?: Record<string, string>;
  team?: string | null;
}

const POSITION_ROW: Record<string, number> = {
  GK: 0,
  DF: 1,
  MF: 2,
  FW: 3,
};

export function FormationField({
  formation,
  assignments,
  participantNames = {},
  team,
}: FormationFieldProps) {
  const rows: Assignment[][] = [[], [], [], []];

  for (const a of assignments) {
    const row = POSITION_ROW[a.position] ?? 2;
    rows[row].push(a);
  }

  return (
    <View style={styles.field}>
      {team ? (
        <TextBox variant="captionBold" color={colors.grey500} style={styles.teamLabel}>
          {team}팀 · {formation}
        </TextBox>
      ) : (
        <TextBox variant="captionBold" color={colors.grey500} style={styles.teamLabel}>
          {formation}
        </TextBox>
      )}

      {[...rows].reverse().map((rowAssignments, rIdx) => (
        <View key={rIdx} style={styles.row}>
          {rowAssignments.map((a) => (
            <View key={a.userId} style={styles.playerSlot}>
              <View style={styles.avatar}>
                <TextBox variant="caption" color={colors.background}>{a.position}</TextBox>
              </View>
              <TextBox variant="caption" color={colors.grey700} numberOfLines={1}>
                {participantNames[a.userId] ?? '선수'}
              </TextBox>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    backgroundColor: colors.green50,
    borderRadius: 12,
    padding: spacing[3],
    gap: spacing[3],
    minHeight: 200,
  },
  teamLabel: {
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  playerSlot: {
    alignItems: 'center',
    gap: 2,
    minWidth: 48,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.green500,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
