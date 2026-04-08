import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller } from 'react-hook-form';
import { router } from 'expo-router';
import {
  TextBox, TextField, BottomCTASingle, Spacing, ScreenLayout, colors, spacing, useToast,
} from '@ui';
import { useJoinByCode } from '../../data/hooks/useClub';
import { JoinByCodeInputSchema } from '../../data/schemas/club.schema';
import type { JoinByCodeInput } from '../../data/schemas/club.schema';

/**
 * 초대 코드 직접 입력 + 가입 신청 Container.
 */
export function InviteEnterContainer() {
  const { mutate, isPending } = useJoinByCode();
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinByCodeInput>({
    resolver: zodResolver(JoinByCodeInputSchema),
    defaultValues: { code: '' },
  });

  const onSubmit = handleSubmit((data) => {
    mutate(data, {
      onSuccess: () => {
        toast.success('가입 신청이 완료되었습니다.');
        router.back();
      },
      onError: (err) => {
        toast.error(err.message || '유효하지 않은 코드입니다.');
      },
    });
  });

  return (
    <ScreenLayout>
      <View style={styles.content}>
        <TextBox variant="heading3" color={colors.grey900}>초대 코드 입력</TextBox>
        <Spacing size={2} />
        <TextBox variant="body2" color={colors.grey500}>
          팀 관리자에게 받은 초대 코드를 입력해주세요.
        </TextBox>
        <Spacing size={6} />
        <Controller
          control={control}
          name="code"
          render={({ field: { onChange, value } }) => (
            <TextField
              title="초대 코드"
              placeholder="예: AB12CD34"
              autoCapitalize="characters"
              value={value}
              onChangeText={onChange}
              errorMessage={errors.code?.message}
            />
          )}
        />
      </View>
      <BottomCTASingle
        label="가입 신청"
        onClick={onSubmit}
        loading={isPending}
        safeArea
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: spacing[5],
  },
});
