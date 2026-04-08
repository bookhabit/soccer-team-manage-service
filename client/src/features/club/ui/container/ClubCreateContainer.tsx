import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useToast } from '@ui';
import { useCreateClub } from '../../data/hooks/useClub';
import { CreateClubInputSchema } from '../../data/schemas/club.schema';
import { ClubCreateView } from '../view/ClubCreateView';
import type { CreateClubInput } from '../../data/schemas/club.schema';

// TODO: 지역 목록은 별도 API 연동 시 교체
const REGION_OPTIONS = [
  { value: 'seoul', label: '서울' },
  { value: 'busan', label: '부산' },
  { value: 'incheon', label: '인천' },
  { value: 'daegu', label: '대구' },
  { value: 'daejeon', label: '대전' },
  { value: 'gwangju', label: '광주' },
  { value: 'ulsan', label: '울산' },
  { value: 'gyeonggi', label: '경기' },
];

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
    mutate(data, {
      onSuccess: () => {
        toast.success('팀이 생성되었습니다!');
        router.replace('/(app)/club' as any);
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
      isPending={isPending}
      onNext={handleNext}
      onBack={handleBack}
      onSubmit={onSubmit}
      regionOptions={REGION_OPTIONS}
    />
  );
}
