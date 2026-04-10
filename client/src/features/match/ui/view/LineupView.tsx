import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { TextBox, Button, ScreenLayout, Spacing, Select, colors, spacing } from '@ui';
import { FormationField } from '../components/FormationField';
import { QuarterTab } from '../components/QuarterTab';
import type { Quarter, Attendance } from '../../data/schemas/match.schema';
import type { SaveLineupInput } from '../../data/schemas/match.schema';

const FORMATION_OPTIONS = [
  { label: '4-3-3', value: '4-3-3' },
  { label: '4-4-2', value: '4-4-2' },
  { label: '3-5-2', value: '3-5-2' },
  { label: '4-2-3-1', value: '4-2-3-1' },
  { label: '5-3-2', value: '5-3-2' },
];

const POSITION_OPTIONS = [
  { label: 'GK', value: 'GK' },
  { label: 'DF', value: 'DF' },
  { label: 'MF', value: 'MF' },
  { label: 'FW', value: 'FW' },
];

interface LineupViewProps {
  quarters: Quarter[];
  attendances: Attendance[];
  activeQuarter: number;
  participantNames: Record<string, string>;
  isSelf: boolean;
  isSaving: boolean;
  onQuarterSelect: (q: number) => void;
  onAssignPosition: (quarterId: string, userId: string, position: string) => void;
  onFormationChange: (quarterId: string, formation: string) => void;
  onSave: (dto: SaveLineupInput) => void;
  onRandomize: () => void;
}

export function LineupView({
  quarters,
  attendances,
  activeQuarter,
  participantNames,
  isSelf,
  isSaving,
  onQuarterSelect,
  onAssignPosition,
  onFormationChange,
  onSave,
  onRandomize,
}: LineupViewProps) {
  const quarterNumbers = quarters.length > 0
    ? quarters.map((q) => q.quarterNumber)
    : [1, 2];

  const currentQuarter = quarters.find((q) => q.quarterNumber === activeQuarter);
  const attending = attendances.filter((a) => a.response === 'ATTEND');

  return (
    <ScreenLayout>
      {/* 쿼터 탭 */}
      <QuarterTab
        quarters={quarterNumbers}
        activeQuarter={activeQuarter}
        onSelect={onQuarterSelect}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {currentQuarter ? (
          <>
            {/* 포메이션 선택 */}
            <Select
              label="포메이션"
              options={FORMATION_OPTIONS}
              value={currentQuarter.formation}
              onChange={(v) => onFormationChange(currentQuarter.id, v)}
            />
            <Spacing size={4} />

            {/* 포메이션 시각화 */}
            <FormationField
              formation={currentQuarter.formation}
              assignments={currentQuarter.assignments}
              participantNames={participantNames}
              team={currentQuarter.team}
            />
            <Spacing size={4} />

            {/* 선수 배정 목록 */}
            <TextBox variant="body2Bold" color={colors.grey900}>선수 배정</TextBox>
            <Spacing size={2} />
            {attending.map((a) => {
              const assignment = currentQuarter.assignments.find(
                (asgn) => asgn.userId === a.userId,
              );
              return (
                <View key={a.userId} style={styles.playerRow}>
                  <TextBox variant="body2" color={colors.grey900} style={styles.playerName}>
                    {a.user.name ?? '선수'}
                  </TextBox>
                  <Select
                    options={POSITION_OPTIONS}
                    value={assignment?.position ?? ''}
                    onChange={(pos) =>
                      pos && onAssignPosition(currentQuarter.id, a.userId, pos)
                    }
                  />
                </View>
              );
            })}
          </>
        ) : (
          <TextBox variant="body2" color={colors.grey400}>
            쿼터 데이터가 없습니다.
          </TextBox>
        )}

        <Spacing size={4} />

        <View style={styles.actions}>
          <View style={styles.actionBtn}>
            <Button variant="secondary" onPress={onRandomize} fullWidth>랜덤 배치</Button>
          </View>
          <View style={styles.actionBtn}>
          <Button
            variant="primary"
            onPress={() => {
              const dto: SaveLineupInput = {
                quarters: quarters.map((q) => ({
                  quarterNumber: q.quarterNumber,
                  formation: q.formation,
                  team: q.team ?? undefined,
                  assignments: q.assignments.map((a) => ({
                    userId: a.userId,
                    position: a.position,
                  })),
                })),
              };
              onSave(dto);
            }}
            loading={isSaving}
            fullWidth
          >저장</Button>
          </View>
        </View>

        <Spacing size={10} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[4],
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  playerName: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  actionBtn: {
    flex: 1,
  },
});
