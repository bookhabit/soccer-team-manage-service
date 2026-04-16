import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@ui';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';
import { useRegions } from '@/src/shared/hooks/useRegions';
import { useMercenaryPostDetail, useUpdateMercenaryPost } from '@/src/features/mercenary/data/hooks/useMercenaryPosts';
import { CreateMercenaryPostSchema } from '@/src/features/mercenary/data/schemas/mercenaryPost.schema';
import type { CreateMercenaryPostInput } from '@/src/features/mercenary/data/schemas/mercenaryPost.schema';
import { MercenaryPostFormView } from '@/src/features/mercenary/ui/view/MercenaryPostFormView';

function MercenaryPostEditContent({ id }: { id: string }) {
  const { data: post } = useMercenaryPostDetail(id);
  const { data: regions = [] } = useRegions();
  const { mutate: updatePost, isPending } = useUpdateMercenaryPost(id);
  const { toast } = useToast();

  const { control, handleSubmit, formState: { errors } } = useForm<CreateMercenaryPostInput>({
    resolver: zodResolver(CreateMercenaryPostSchema),
    defaultValues: {
      positions: post.positions,
      requiredCount: post.requiredCount,
      matchDate: post.matchDate.split('T')[0] ?? post.matchDate,
      startTime: post.startTime,
      endTime: post.endTime,
      location: post.location,
      address: post.address ?? '',
      level: post.level,
      fee: post.fee,
      description: post.description ?? '',
      contactName: post.contactName,
      contactPhone: post.contactPhone,
    },
  });

  const onSubmit = (data: CreateMercenaryPostInput) => {
    updatePost(data, {
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
    <MercenaryPostFormView
      control={control}
      errors={errors}
      regions={regions}
      isPending={isPending}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="수정하기"
    />
  );
}

export default function MercenaryPostEditPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <AsyncBoundary>
      <MercenaryPostEditContent id={id} />
    </AsyncBoundary>
  );
}
