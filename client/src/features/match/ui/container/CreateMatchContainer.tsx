import React from 'react';
import { router } from 'expo-router';
import { useToast } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { useMyClub } from '@/src/features/club/data/hooks/useClub';
import { useCreateMatch } from '../../data/hooks/useMatch';
import { MatchFormView } from '../view/MatchFormView';
import type { CreateMatchInput } from '../../data/schemas/match.schema';

function CreateMatchContent() {
  const { toast } = useToast();
  const { data: club } = useMyClub();
  const clubId = club?.id ?? '';

  const { mutate: createMatch, isPending } = useCreateMatch(clubId);

  const handleSubmit = (data: CreateMatchInput) => {
    createMatch(data, {
      onSuccess: () => {
        toast.success('경기가 등록되었습니다.');
        router.back();
      },
      onError: () => toast.error('경기 등록에 실패했습니다.'),
    });
  };

  return (
    <MatchFormView
      isSubmitting={isPending}
      submitLabel="경기 등록"
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
    />
  );
}

export function CreateMatchContainer() {
  return (
    <AsyncBoundary>
      <CreateMatchContent />
    </AsyncBoundary>
  );
}
