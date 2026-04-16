import React from 'react';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@ui';
import { useRegions } from '@/src/shared/hooks/useRegions';
import { useCreateMercenaryAvailability } from '../../data/hooks/useMercenaryAvailabilities';
import { CreateMercenaryAvailabilitySchema } from '../../data/schemas/mercenaryAvailability.schema';
import type { CreateMercenaryAvailabilityInput } from '../../data/schemas/mercenaryAvailability.schema';
import { MercenaryAvailabilityFormView } from '../view/MercenaryAvailabilityFormView';

export function MercenaryAvailabilityCreateContainer() {
  const { data: regions = [] } = useRegions();
  const { mutate: createAvail, isPending } = useCreateMercenaryAvailability();
  const { toast } = useToast();

  const { control, handleSubmit, formState: { errors } } = useForm<CreateMercenaryAvailabilityInput>({
    resolver: zodResolver(CreateMercenaryAvailabilitySchema),
    defaultValues: {
      positions: [],
      availableDates: [],
      regionIds: [],
      acceptsFee: true,
    },
  });

  const onSubmit = (data: CreateMercenaryAvailabilityInput) => {
    createAvail(data, {
      onSuccess: (res) => {
        toast.success('용병 가능 게시글이 등록되었습니다!');
        router.replace(`/(app)/mercenary/availability/${res.id}` as any);
      },
      onError: (err: any) => {
        const code = err?.response?.data?.code;
        if (code === 'MERCENARY_BLACKLIST') {
          toast.error('게시글 등록이 제한된 계정입니다.');
        } else {
          toast.error('등록에 실패했습니다.');
        }
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
    />
  );
}
