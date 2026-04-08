import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema } from '../../data/schemas/auth.schema';
import type { OnboardingInput } from '../../data/schemas/auth.schema';
import { useOnboarding } from '../../data/hooks/useAuth';
import { OnboardingView } from '../view/OnboardingView';

/**
 * 온보딩 흐름을 관리하고 OnboardingView에 주입하는 Container.
 */
export function OnboardingContainer() {
  const { mutate, isPending } = useOnboarding();

  const {
    control,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      birthYear: 0,
      gender: undefined,
      position: undefined,
      foot: undefined,
      years: 0,
      level: undefined,
      preferredRegionId: undefined,
    },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit((data) => mutate(data));

  return (
    <OnboardingView
      control={control}
      errors={errors}
      trigger={trigger}
      isPending={isPending}
      onSubmit={onSubmit}
    />
  );
}
