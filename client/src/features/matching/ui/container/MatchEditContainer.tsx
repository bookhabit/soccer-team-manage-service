import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useToast } from '@ui';
import { useRegions } from '@/src/shared/hooks/useRegions';
import { useMatchPostDetail, useUpdateMatchPost } from '../../data/hooks/useMatchPosts';
import { CreateMatchPostSchema, type CreateMatchPostInput } from '../../data/schemas/matchPost.schema';
import { MatchCreateView } from '../view/MatchCreateView';
import AsyncBoundary from '@/src/shared/ui/server-state-handling/AsyncBoundary';

interface MatchEditContainerProps {
  postId: string;
}

function MatchEditContent({ postId }: MatchEditContainerProps) {
  const { data: post } = useMatchPostDetail(postId);
  const { data: regions = [] } = useRegions();
  const { mutate, isPending } = useUpdateMatchPost(postId);
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateMatchPostInput>({
    resolver: zodResolver(CreateMatchPostSchema),
    defaultValues: {
      matchDate: post.matchDate.split('T')[0],
      startTime: post.startTime,
      endTime: post.endTime,
      location: post.location,
      address: post.address ?? '',
      playerCount: post.playerCount,
      gender: post.gender,
      level: post.level,
      fee: post.fee,
      contactName: post.contactName ?? '',
      contactPhone: post.contactPhone ?? '',
      regionId: '',
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutate(data, {
      onSuccess: () => {
        toast.success('게시글이 수정되었습니다.');
        router.back();
      },
      onError: (err: any) => {
        const code = err?.response?.data?.code;
        if (code === 'MATCH_POST_003') {
          toast.error('매칭 완료 후에는 수정할 수 없습니다.');
        } else {
          toast.error('수정에 실패했습니다.');
        }
      },
    });
  });

  return (
    <MatchCreateView
      control={control}
      errors={errors}
      regions={regions}
      isPending={isPending}
      onSubmit={onSubmit}
      submitLabel="수정하기"
    />
  );
}

/**
 * 매칭 게시글 수정 Container.
 */
export function MatchEditContainer({ postId }: MatchEditContainerProps) {
  return (
    <AsyncBoundary>
      <MatchEditContent postId={postId} />
    </AsyncBoundary>
  );
}
