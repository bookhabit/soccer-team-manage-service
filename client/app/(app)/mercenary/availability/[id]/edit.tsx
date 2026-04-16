import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { useRegions } from '@/src/shared/hooks/useRegions';
import {
  useMercenaryAvailabilityDetail,
  useUpdateMercenaryAvailability,
} from '@/src/features/mercenary/data/hooks/useMercenaryAvailabilities';
import { CreateMercenaryAvailabilitySchema } from '@/src/features/mercenary/data/schemas/mercenaryAvailability.schema';
import type { CreateMercenaryAvailabilityInput } from '@/src/features/mercenary/data/schemas/mercenaryAvailability.schema';
import { MercenaryAvailabilityFormView } from '@/src/features/mercenary/ui/view/MercenaryAvailabilityFormView';

function MercenaryAvailabilityEditContent({ id }: { id: string }) {
  const { data: avail } = useMercenaryAvailabilityDetail(id);
  const { data: regions = [] } = useRegions();
  const { mutate: updateAvail, isPending } = useUpdateMercenaryAvailability(id);
  const { toast } = useToast();

  const { control, handleSubmit, formState: { errors } } = useForm<CreateMercenaryAvailabilityInput>({
    resolver: zodResolver(CreateMercenaryAvailabilitySchema),
    defaultValues: {
      positions: avail.positions,
      availableDates: avail.availableDates.map((d) =>
        typeof d === 'string' ? d.split('T')[0] ?? d : new Date(d).toISOString().split('T')[0],
      ),
      regionIds: [],
      timeSlot: avail.timeSlot ?? '',
      bio: avail.bio ?? '',
      acceptsFee: avail.acceptsFee,
    },
  });

  const onSubmit = (data: CreateMercenaryAvailabilityInput) => {
    updateAvail(data, {
      onSuccess: () => {
        toast.success('수정이 완료되었습니다.');
        router.back();
      },
      onError: () => {
        toast.error('수정에 실패했습니다.');
      },
    });
  };

  return (
    <MercenaryAvailabilityFormView
      control={control}
      errors={errors}
      regions={regions}
      isPending={isPending}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="수정하기"
    />
  );
}

export default function MercenaryAvailabilityEditPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <AsyncBoundary>
      <MercenaryAvailabilityEditContent id={id} />
    </AsyncBoundary>
  );
}
