import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { useToast, AlertDialog } from '@ui';
import { useRegions } from '@/src/shared/hooks/useRegions';
import { useMyProfile } from '@/src/features/auth/data/hooks/useAuth';
import { useCreateMatchPost } from '../../data/hooks/useMatchPosts';
import { CreateMatchPostSchema, type CreateMatchPostInput } from '../../data/schemas/matchPost.schema';
import { MatchCreateView } from '../view/MatchCreateView';

/**
 * 매칭 게시글 등록 Container.
 * 진입 시 user.phone 가드를 수행한다.
 */
export function MatchCreateContainer() {
  const { data: profile } = useMyProfile();
  const { data: regions = [] } = useRegions();
  const { mutate, isPending } = useCreateMatchPost();
  const { toast } = useToast();

  const [phoneAlertOpen, setPhoneAlertOpen] = useState(false);

  useEffect(() => {
    if (profile && !profile.phone) {
      setPhoneAlertOpen(true);
    }
  }, [profile]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateMatchPostInput>({
    resolver: zodResolver(CreateMatchPostSchema),
    defaultValues: {
      matchDate: '',
      startTime: '',
      endTime: '',
      location: '',
      address: '',
      playerCount: 11,
      gender: 'MIXED',
      level: 'AMATEUR',
      fee: 0,
      contactName: profile?.name ?? '',
      contactPhone: profile?.phone ?? '',
      regionId: '',
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutate(data, {
      onSuccess: (post) => {
        toast.success('매칭 게시글이 등록되었습니다!');
        router.replace(`/(app)/matching/${post.id}` as Href);
      },
      onError: (err: any) => {
        const code = err?.response?.data?.code;
        if (code === 'CLUB_NO_PERMISSION') {
          toast.error('주장 또는 부주장만 등록할 수 있습니다.');
        } else {
          toast.error('등록에 실패했습니다.');
        }
      },
    });
  });

  return (
    <>
      <MatchCreateView
        control={control}
        errors={errors}
        regions={regions}
        isPending={isPending}
        onSubmit={onSubmit}
        submitLabel="등록하기"
      />
      <AlertDialog
        isOpen={phoneAlertOpen}
        onClose={() => {
          setPhoneAlertOpen(false);
          router.replace('/(app)/profile/settings' as Href);
        }}
        title="연락처 설정 필요"
        description="매칭 등록을 위해 먼저 프로필에서 연락처를 설정해주세요."
        confirmLabel="설정하러 가기"
      />
    </>
  );
}
