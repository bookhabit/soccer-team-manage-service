import React from 'react';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { useMyProfile, useUpdateProfile } from '../../data/hooks/useAuth';
import { updateProfileSchema } from '../../data/schemas/user.schema';
import type { UpdateProfileInput } from '../../data/schemas/user.schema';
import { useUploadAvatar, useDeleteAvatar } from '@/src/features/upload/data/hooks/useUpload';
import { ProfileEditView } from '../view/ProfileEditView';

/**
 * 프로필 수정 폼을 조립하고 ProfileEditView에 주입하는 Container.
 */
export function ProfileEditContainer() {
  const { data: profile } = useMyProfile();
  const { mutate, isPending } = useUpdateProfile();
  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar();
  const { mutate: deleteAvatar, isPending: isDeleting } = useDeleteAvatar();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: profile?.name ?? '',
      position: profile?.position ?? undefined,
      foot: profile?.foot ?? undefined,
      level: profile?.level ?? undefined,
      preferredRegionId: profile?.preferredRegionId ?? undefined,
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutate(data, {
      onSuccess: () => router.back(),
    });
  });

  const onAvatarPress = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const formData = new FormData();
    formData.append('image', {
      uri: asset.uri,
      name: 'avatar.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);

    uploadAvatar(formData);
  };

  const onAvatarDelete = () => {
    deleteAvatar();
  };

  return (
    <ProfileEditView
      control={control}
      errors={errors}
      isPending={isPending}
      isAvatarLoading={isUploading || isDeleting}
      currentAvatarUrl={profile?.avatarUrl ?? null}
      onAvatarPress={onAvatarPress}
      onAvatarDelete={onAvatarDelete}
      onSubmit={onSubmit}
    />
  );
}
