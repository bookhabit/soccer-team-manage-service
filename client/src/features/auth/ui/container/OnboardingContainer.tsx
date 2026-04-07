import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema } from '../../data/schemas/auth.schema';
import type { OnboardingInput } from '../../data/schemas/auth.schema';
import { useOnboarding } from '../../data/hooks/useAuth';
import { OnboardingView } from '../view/OnboardingView';

const TOTAL_STEPS = 7;

const STEP_FIELDS: (keyof OnboardingInput)[] = [
  'name',
  'birthYear',
  'gender',
  'position',
  'foot',
  'years',
  'level',
];

export function OnboardingContainer() {
  const [step, setStep] = useState(1);
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

  const handleNext = async () => {
    const field = STEP_FIELDS[step - 1];
    const valid = await trigger(field);
    if (!valid) return;

    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      handleSubmit((data) => mutate(data))();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  return (
    <OnboardingView
      step={step}
      control={control}
      errors={errors}
      isPending={isPending}
      onNext={handleNext}
      onBack={handleBack}
      isLastStep={step === TOTAL_STEPS}
    />
  );
}
