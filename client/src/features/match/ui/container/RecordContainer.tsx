import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Skeleton, ScreenLayout, Spacing, useToast, spacing } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { useMyClub } from '@/src/features/club/data/hooks/useClub';
import {
  useMatchDetail,
  useAttendances,
  useSubmitRecord,
  useUpdateRecord,
} from '../../data/hooks/useMatch';
import { RecordFormView } from '../view/RecordFormView';
import type { RecordInput } from '../../data/schemas/match.schema';

interface RecordContainerProps {
  matchId: string;
}

function RecordSkeleton() {
  return (
    <ScreenLayout>
      <View style={styles.skeleton}>
        <Skeleton width="60%" height={28} />
        <Spacing size={3} />
        <Skeleton width="100%" height={120} borderRadius={12} />
      </View>
    </ScreenLayout>
  );
}

function RecordContent({ matchId }: RecordContainerProps) {
  const { toast } = useToast();
  const { data: club } = useMyClub();
  const clubId = club?.id ?? '';

  const { data: match } = useMatchDetail(clubId, matchId);
  const { data: attendances } = useAttendances(clubId, matchId);
  const { mutate: submitRecord, isPending: isSubmitting } = useSubmitRecord(clubId, matchId);
  const { mutate: updateRecord } = useUpdateRecord(clubId, matchId);

  const isEdit = match.isRecordSubmitted;

  const handleSubmit = (data: RecordInput) => {
    const action = isEdit ? updateRecord : submitRecord;
    action(data, {
      onSuccess: () => {
        toast.success('경기 기록이 저장되었습니다.');
        router.back();
      },
      onError: () => toast.error('기록 저장에 실패했습니다.'),
    });
  };

  return (
    <RecordFormView
      participants={attendances}
      defaultValues={
        isEdit
          ? {
              homeScore: match.homeScore ?? 0,
              awayScore: match.awayScore ?? 0,
              goals: [],
            }
          : undefined
      }
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
    />
  );
}

export function RecordContainer({ matchId }: RecordContainerProps) {
  return (
    <AsyncBoundary loadingFallback={<RecordSkeleton />}>
      <RecordContent matchId={matchId} />
    </AsyncBoundary>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    padding: spacing[4],
  },
});
