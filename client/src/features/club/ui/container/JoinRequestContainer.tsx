import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useToast } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { useClubDetail, useCreateJoinRequest } from '../../data/hooks/useClub';
import { JoinRequestInputSchema } from '../../data/schemas/club.schema';
import { JoinRequestView } from '../view/JoinRequestView';
import type { JoinRequestInput } from '../../data/schemas/club.schema';

interface JoinRequestContainerProps {
  clubId: string;
}

function JoinRequestContent({ clubId }: JoinRequestContainerProps) {
  const { data: club } = useClubDetail(clubId);
  const { mutate, isPending } = useCreateJoinRequest(clubId);
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinRequestInput>({
    resolver: zodResolver(JoinRequestInputSchema),
    defaultValues: { message: '' },
  });

  const onSubmit = handleSubmit((data) => {
    mutate(data, {
      onSuccess: () => {
        toast.success('가입 신청이 완료되었습니다.');
        router.back();
      },
      onError: () => toast.error('가입 신청에 실패했습니다.'),
    });
  });

  return (
    <JoinRequestView
      club={club}
      control={control}
      errors={errors}
      isPending={isPending}
      onSubmit={onSubmit}
      onCancel={() => router.back()}
    />
  );
}

export function JoinRequestContainer({ clubId }: JoinRequestContainerProps) {
  return (
    <AsyncBoundary>
      <JoinRequestContent clubId={clubId} />
    </AsyncBoundary>
  );
}
