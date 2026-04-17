import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { TextBox, Button, ScreenLayout, Spacing, Select, EmptyState, colors, spacing } from '@ui';
import { FormationField } from '../components/FormationField';
import { QuarterTab } from '../components/QuarterTab';
import type { Quarter, Attendance, FormationSlot } from '../../data/schemas/match.schema';
import type { SaveLineupInput } from '../../data/schemas/match.schema';

const FORMATION_OPTIONS = [
  { label: '4-3-3', value: '4-3-3' },
  { label: '4-4-2', value: '4-4-2' },
  { label: '3-5-2', value: '3-5-2' },
  { label: '4-2-3-1', value: '4-2-3-1' },
  { label: '5-3-2', value: '5-3-2' },
];

/** 포메이션별 11개 FormationSlot 슬롯 정의 */
const FORMATION_SLOTS: Record<string, FormationSlot[]> = {
  '4-3-3':   ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LCM', 'CM', 'RCM', 'LW', 'ST', 'RW'],
  '4-4-2':   ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LM', 'LCM', 'RCM', 'RM', 'LS', 'RS'],
  '3-5-2':   ['GK', 'LCB', 'CB', 'RCB', 'LWB', 'LCM', 'CM', 'RCM', 'RWB', 'LS', 'RS'],
  '4-2-3-1': ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LDM', 'RDM', 'LAM', 'CAM', 'RAM', 'ST'],
  '5-3-2':   ['GK', 'LB', 'LCB', 'CB', 'RCB', 'RB', 'LCM', 'CM', 'RCM', 'LS', 'RS'],
};

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
  onAddQuarter: () => void;
  onRemoveQuarter: (quarterNumber: number) => void;
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
  onAddQuarter,
  onRemoveQuarter,
  onSave,
  onRandomize,
}: LineupViewProps) {
  const quarterNumbers = quarters.length > 0
    ? quarters.map((q) => q.quarterNumber)
    : [1, 2];

  const currentQuarter = quarters.find((q) => q.quarterNumber === activeQuarter);

  // 참석 인원만 표시 (ATTEND만, ABSENT·UNDECIDED 제외)
  const attendingPlayers = attendances.filter((a) => a.response === 'ATTEND');
  const hasAttendingPlayers = attendingPlayers.length > 0;

  // 현재 포메이션에 해당하는 슬롯 목록
  const formationSlots = currentQuarter
    ? (FORMATION_SLOTS[currentQuarter.formation] ?? [])
    : [];

  // 슬롯 선택 옵션 (현재 포메이션 슬롯만)
  const slotOptions = formationSlots.map((s) => ({ label: s, value: s }));

  return (
    <ScreenLayout>
      {/* 쿼터 탭 */}
      <QuarterTab
        quarters={quarterNumbers}
        activeQuarter={activeQuarter}
        onSelect={onQuarterSelect}
        onAdd={onAddQuarter}
        onRemove={onRemoveQuarter}
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

            {/* 포메이션 시각화 — 11개 빈 슬롯 포함 */}
            <FormationField
              formation={currentQuarter.formation}
              assignments={currentQuarter.assignments}
              formationSlots={formationSlots}
              participantNames={participantNames}
              team={currentQuarter.team}
            />
            <Spacing size={4} />

            {/* 선수 배정 — 참석자(ATTEND)만 */}
            <TextBox variant="body2Bold" color={colors.grey900}>
              선수 배정 ({attendingPlayers.length}명 참석)
            </TextBox>
            <Spacing size={2} />

            {!hasAttendingPlayers ? (
              <EmptyState message="참석 선수가 없습니다." />
            ) : (
              attendingPlayers.map((a) => {
                const assignment = currentQuarter.assignments.find(
                  (asgn) => asgn.userId === a.userId,
                );
                return (
                  <View key={a.userId} style={styles.playerRow}>
                    <TextBox variant="body2" color={colors.grey900} style={styles.playerName}>
                      {a.user.name ?? '선수'}
                    </TextBox>
                    <View style={styles.slotSelect}>
                      <Select
                        options={[{ label: '포지션 선택', value: '' }, ...slotOptions]}
                        value={assignment?.position ?? ''}
                        onChange={(pos) =>
                          pos && onAssignPosition(currentQuarter.id, a.userId, pos)
                        }
                      />
                    </View>
                  </View>
                );
              })
            )}
          </>
        ) : (
          <EmptyState message="쿼터 데이터가 없습니다." />
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
  slotSelect: {
    width: 140,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  actionBtn: {
    flex: 1,
  },
});
