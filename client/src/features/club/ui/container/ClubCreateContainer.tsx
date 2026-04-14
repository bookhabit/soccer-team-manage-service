import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useToast } from '@ui';
import { useCreateClub } from '../../data/hooks/useClub';
import { CreateClubInputSchema } from '../../data/schemas/club.schema';
import { ClubCreateView } from '../view/ClubCreateView';
import { useRegions } from '@/src/shared/hooks/useRegions';
import type { CreateClubInput } from '../../data/schemas/club.schema';

const FIELDS_BY_STEP: (keyof CreateClubInput)[][] = [
  ['name', 'regionId'],
  ['level', 'maxMemberCount'],
  ['description'],
];

/**
 * 클럽 생성 3단계 Funnel Container.
 */
export function ClubCreateContainer() {
  const [step, setStep] = useState(1);
  const { mutate, isPending } = useCreateClub();
  const { toast } = useToast();
  const { data: regions = [], isLoading: isRegionsLoading } = useRegions();

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<CreateClubInput>({
    resolver: zodResolver(CreateClubInputSchema),
    defaultValues: {
      name: '',
      regionId: '',
      level: 'AMATEUR',
      maxMemberCount: 20,
      description: '',
    },
  });

  const handleNext = async () => {
    const fields = FIELDS_BY_STEP[step - 1];
    const valid = await trigger(fields);
    if (valid) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    } else {
      router.back();
    }
  };

  const onSubmit = handleSubmit((data) => {
    console.log('팀 생성 dto:', data);
    mutate(data, {
      onSuccess: (newClub) => {
        toast.success('팀이 생성되었습니다!');
        // 생성 직후 초대 코드 화면으로 이동 (기획 변경 2026-04-14)
        router.replace(`/(app)/club/${newClub.id}/invite` as any);
      },
      onError: () => {
        toast.error('팀 생성에 실패했습니다.');
      },
    });
  });

  return (
    <ClubCreateView
      step={step}
      control={control}
      errors={errors}
      isPending={isPending || isRegionsLoading}
      onNext={handleNext}
      onBack={handleBack}
      onSubmit={onSubmit}
      regions={regions}
    />
  );
}
