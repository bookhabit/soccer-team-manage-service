import React from 'react';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMyProfile, useUpdateProfile } from '../../data/hooks/useAuth';
import { updateProfileSchema } from '../../data/schemas/user.schema';
import type { UpdateProfileInput } from '../../data/schemas/user.schema';
import { ProfileEditView } from '../view/ProfileEditView';

export function ProfileEditContainer() {
  const { data: profile } = useMyProfile();
  const { mutate, isPending } = useUpdateProfile();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: profile?.name ?? '',
      position: (profile?.position as UpdateProfileInput['position']) ?? undefined,
      foot: (profile?.foot as UpdateProfileInput['foot']) ?? undefined,
      level: (profile?.level as UpdateProfileInput['level']) ?? undefined,
      preferredRegionId: profile?.preferredRegionId ?? undefined,
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutate(data, {
      onSuccess: () => router.back(),
    });
  });

  return (
    <ProfileEditView
      control={control}
      errors={errors}
      isPending={isPending}
      onSubmit={onSubmit}
      onBack={() => router.back()}
    />
  );
}
