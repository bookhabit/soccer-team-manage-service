import React from 'react';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@ui';
import { useMyProfile } from '@/src/features/auth/data/hooks/useAuth';
import { useRegions } from '@/src/shared/hooks/useRegions';
import { useCreateMercenaryPost } from '../../data/hooks/useMercenaryPosts';
import { CreateMercenaryPostSchema } from '../../data/schemas/mercenaryPost.schema';
import type { CreateMercenaryPostInput } from '../../data/schemas/mercenaryPost.schema';
import { MercenaryPostFormView } from '../view/MercenaryPostFormView';

export function MercenaryPostCreateContainer() {
  const { data: profile } = useMyProfile();
  const { data: regions = [] } = useRegions();
  const { mutate: createPost, isPending } = useCreateMercenaryPost();
  const { toast } = useToast();

  const { control, handleSubmit, formState: { errors } } = useForm<CreateMercenaryPostInput>({
    resolver: zodResolver(CreateMercenaryPostSchema),
    defaultValues: {
      fee: 0,
      contactName: profile?.name ?? '',
      contactPhone: profile?.phone ?? '',
      positions: [],
    },
  });

  const onSubmit = (data: CreateMercenaryPostInput) => {
    createPost(data, {
      onSuccess: (res) => {
        toast.success('용병 구함 게시글이 등록되었습니다!');
        router.replace(`/(app)/mercenary/post/${res.id}` as any);
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
    <MercenaryPostFormView
      control={control}
      errors={errors}
      regions={regions}
      isPending={isPending}
      onSubmit={handleSubmit(onSubmit)}
    />
  );
}
