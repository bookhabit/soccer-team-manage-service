import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextBox, colors, spacing } from '@ui';
import type { FormationSlot } from '../../data/schemas/match.schema';

type Assignment = { userId: string; position: FormationSlot };

interface FormationFieldProps {
  formation: string;
  assignments: Assignment[];
  participantNames?: Record<string, string>;
  team?: string | null;
}

/** FormationSlot → 시각적 row (0=GK, 1=수비, 2=미드, 3=공격) */
const POSITION_ROW: Record<FormationSlot, number> = {
  GK: 0,
  LB: 1, LCB: 1, CB: 1, RCB: 1, RB: 1, LWB: 1, RWB: 1,
  LDM: 2, CDM: 2, RDM: 2,
  LM: 2, LCM: 2, CM: 2, RCM: 2, RM: 2,
  LAM: 2, CAM: 2, RAM: 2,
  LW: 3, RW: 3, LF: 3, RF: 3, LS: 3, RS: 3, ST: 3,
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
