import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useToast } from '@ui';
import { useCreatePost, useUpdatePost, usePostDetailQuery } from '../../data/hooks/usePost';
import { CreatePostInputSchema } from '../../data/schemas/post.schema';
import { PostWriteView } from '../view/PostWriteView';
import type { CreatePostInput } from '../../data/schemas/post.schema';

interface PostWriteContainerProps {
  clubId: string;
  /** 수정 모드일 때 기존 데이터 (직접 전달 시 사용) */
  initialData?: Partial<CreatePostInput>;
  postId?: string;
}

/**
 * 게시글 작성·수정 Container.
 * 수정 모드(postId 존재)이면 기존 게시글을 fetch 하여 폼을 초기화한다.
 */
export function PostWriteContainer({ clubId, initialData, postId }: PostWriteContainerProps) {
  const isEdit = postId != null;
  const { toast } = useToast();

  const { data: existingPost } = usePostDetailQuery(clubId, postId ?? '', { enabled: isEdit && !initialData });

  const { mutate: createPost, isPending: isCreating } = useCreatePost(clubId);
  const { mutate: updatePost, isPending: isUpdating } = useUpdatePost(clubId, postId ?? '');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePostInput>({
    resolver: zodResolver(CreatePostInputSchema),
    defaultValues: {
      type: 'GENERAL',
      title: '',
      content: '',
      isPinned: false,
      sendNotification: false,
      ...initialData,
    },
  });

  useEffect(() => {
    if (existingPost) {
      reset({
        type: existingPost.type,
        title: existingPost.title,
        content: existingPost.content,
        isPinned: existingPost.isPinned,
        sendNotification: false,
      });
    }
  }, [existingPost, reset]);

  const onSubmit = handleSubmit((data) => {
    if (isEdit) {
      updatePost(data, {
        onSuccess: () => {
          toast.success('게시글이 수정되었습니다.');
          router.back();
        },
        onError: () => toast.error('게시글 수정에 실패했습니다.'),
      });
    } else {
      createPost(data, {
        onSuccess: () => {
          toast.success('게시글이 등록되었습니다.');
          router.back();
        },
        onError: () => toast.error('게시글 등록에 실패했습니다.'),
      });
    }
  });

  return (
    <PostWriteView
      isEdit={isEdit}
      control={control}
      errors={errors}
      isPending={isEdit ? isUpdating : isCreating}
      onSubmit={onSubmit}
    />
  );
}
