import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { Skeleton, ScreenLayout, Spacing, useToast, spacing } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { useMyClub } from '@/src/features/club/data/hooks/useClub';
import {
  useMatchDetail,
  useAttendances,
  useSubmitAttendance,
  useLineup,
} from '../../data/hooks/useMatch';
import { MatchProgressView } from '../view/MatchProgressView';

interface MatchProgressContainerProps {
  matchId: string;
}

function MatchProgressSkeleton() {
  return (
    <ScreenLayout>
      <View style={styles.skeleton}>
        <Skeleton width="60%" height={28} />
        <Spacing size={3} />
        <Skeleton width="100%" height={80} borderRadius={12} />
        <Spacing size={3} />
        <Skeleton width="100%" height={200} borderRadius={12} />
      </View>
    </ScreenLayout>
  );
}

function MatchProgressContent({ matchId }: MatchProgressContainerProps) {
  const { toast } = useToast();
  const { data: club } = useMyClub();
  const clubId = club?.id ?? '';

  const { data: match } = useMatchDetail(clubId, matchId);
  const { data: attendances } = useAttendances(clubId, matchId);
  const { data: lineup } = useLineup(clubId, matchId);
  const { mutate: submitAttendance, isPending: isSubmittingAttendance } = useSubmitAttendance(
    clubId,
    matchId,
  );

  const isCaptainOrVice = club?.myRole === 'CAPTAIN' || club?.myRole === 'VICE_CAPTAIN';
  const totalMembers = club?.currentMemberCount ?? 0;

  const myResponse = match.myResponse;
  const isDeadlinePassed = new Date(match.voteDeadline).getTime() < Date.now();

  const firstQuarter = lineup?.[0] ?? null;

  const participantNames = attendances.reduce<Record<string, string>>((acc, a) => {
    if (a.user.name) acc[a.userId] = a.user.name;
    return acc;
  }, {});

  const handleAttendance = (response: 'ATTEND' | 'ABSENT' | 'UNDECIDED') => {
    submitAttendance(response, {
      onError: () => toast.error('투표 처리에 실패했습니다.'),
    });
  };

  return (
    <MatchProgressView
      match={match}
      attendances={attendances}
      totalMembers={totalMembers}
      isCaptainOrVice={isCaptainOrVice}
      myResponse={myResponse}
      isDeadlinePassed={isDeadlinePassed}
      isSubmittingAttendance={isSubmittingAttendance}
      participantNames={participantNames}
      onAttend={() => handleAttendance('ATTEND')}
      onAbsent={() => handleAttendance('ABSENT')}
      onUndecided={() => handleAttendance('UNDECIDED')}
      onGoLineup={() => router.push(`/(app)/vote/${matchId}/lineup` as Href)}
      onGoRecord={() => router.push(`/(app)/vote/${matchId}/record` as Href)}
      onGoMomVote={() => router.push(`/(app)/vote/${matchId}/detail` as Href)}
    />
  );
}

export function MatchProgressContainer({ matchId }: MatchProgressContainerProps) {
  return (
    <AsyncBoundary loadingFallback={<MatchProgressSkeleton />}>
      <MatchProgressContent matchId={matchId} />
    </AsyncBoundary>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    padding: spacing[4],
  },
});
