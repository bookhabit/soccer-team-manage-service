import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton, ScreenLayout, Spacing, useToast, spacing } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { useMyClub } from '@/src/features/club/data/hooks/useClub';
import {
  useMatchDetail,
  useLineup,
  useAttendances,
  useSaveLineup,
} from '../../data/hooks/useMatch';
import { LineupView } from '../view/LineupView';
import type { Quarter } from '../../data/schemas/match.schema';
import type { SaveLineupInput } from '../../data/schemas/match.schema';

interface LineupContainerProps {
  matchId: string;
}

function LineupSkeleton() {
  return (
    <ScreenLayout>
      <View style={styles.skeleton}>
        <Skeleton width="100%" height={48} borderRadius={8} />
        <Spacing size={3} />
        <Skeleton width="100%" height={200} borderRadius={12} />
      </View>
    </ScreenLayout>
  );
}

function LineupContent({ matchId }: LineupContainerProps) {
  const [activeQuarter, setActiveQuarter] = useState(1);
  const { toast } = useToast();
  const { data: club } = useMyClub();
  const clubId = club?.id ?? '';

  const { data: match } = useMatchDetail(clubId, matchId);
  const { data: lineupData } = useLineup(clubId, matchId);
  const { data: attendances } = useAttendances(clubId, matchId);
  const { mutate: saveLineup, isPending: isSaving } = useSaveLineup(clubId, matchId);

  const [localQuarters, setLocalQuarters] = useState<Quarter[]>(
    lineupData?.length ? lineupData : [
      { id: 'q1', quarterNumber: 1, formation: '4-3-3', team: null, assignments: [] },
      { id: 'q2', quarterNumber: 2, formation: '4-3-3', team: null, assignments: [] },
    ],
  );

  const isSelf = match.type === 'SELF';
  const participantNames = attendances.reduce<Record<string, string>>((acc, a) => {
    if (a.user.name) acc[a.userId] = a.user.name;
    return acc;
  }, {});

  const handleAssignPosition = (quarterId: string, userId: string, position: string) => {
    setLocalQuarters((prev) =>
      prev.map((q) => {
        if (q.id !== quarterId) return q;
        const existing = q.assignments.findIndex((a) => a.userId === userId);
        const newAssignments = [...q.assignments];
        if (existing >= 0) {
          newAssignments[existing] = { userId, position: position as any };
        } else {
          newAssignments.push({ userId, position: position as any });
        }
        return { ...q, assignments: newAssignments };
      }),
    );
  };

  const handleFormationChange = (quarterId: string, formation: string) => {
    setLocalQuarters((prev) =>
      prev.map((q) => (q.id === quarterId ? { ...q, formation } : q)),
    );
  };

  const handleRandomize = () => {
    const attending = attendances.filter((a) => a.response === 'ATTEND');
    const positions: Array<'GK' | 'DF' | 'MF' | 'FW'> = ['GK', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'FW', 'FW', 'FW', 'FW'];
    const shuffled = [...attending].sort(() => Math.random() - 0.5);
    setLocalQuarters((prev) =>
      prev.map((q) =>
        q.quarterNumber === activeQuarter
          ? {
              ...q,
              assignments: shuffled.slice(0, positions.length).map((a, i) => ({
                userId: a.userId,
                position: positions[i],
              })),
            }
          : q,
      ),
    );
  };

  const handleSave = (dto: SaveLineupInput) => {
    saveLineup(dto, {
      onSuccess: () => toast.success('포지션 배정이 저장되었습니다.'),
      onError: () => toast.error('저장에 실패했습니다.'),
    });
  };

  return (
    <LineupView
      quarters={localQuarters}
      attendances={attendances}
      activeQuarter={activeQuarter}
      participantNames={participantNames}
      isSelf={isSelf}
      isSaving={isSaving}
      onQuarterSelect={setActiveQuarter}
      onAssignPosition={handleAssignPosition}
      onFormationChange={handleFormationChange}
      onSave={handleSave}
      onRandomize={handleRandomize}
    />
  );
}

export function LineupContainer({ matchId }: LineupContainerProps) {
  return (
    <AsyncBoundary loadingFallback={<LineupSkeleton />}>
      <LineupContent matchId={matchId} />
    </AsyncBoundary>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    padding: spacing[4],
  },
});
