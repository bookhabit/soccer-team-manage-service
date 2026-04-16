import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Drawer, TextBox, TextArea, TextField, Button, BottomCTASingle, Spacing, colors, spacing } from '@ui';
import { CreateMercenaryRecruitmentSchema } from '../../data/schemas/mercenaryAvailability.schema';
import type { CreateMercenaryRecruitmentInput } from '../../data/schemas/mercenaryAvailability.schema';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMercenaryRecruitmentInput) => void;
  isLoading?: boolean;
  defaultContactName?: string;
  defaultContactPhone?: string;
}

export function RecruitBottomSheet({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  defaultContactName = '',
  defaultContactPhone = '',
}: Props) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateMercenaryRecruitmentInput>({
    resolver: zodResolver(CreateMercenaryRecruitmentSchema),
    defaultValues: {
      message: '',
      contactName: defaultContactName,
      contactPhone: defaultContactPhone,
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title="영입 신청">
      <View style={styles.content}>
        <Controller
          control={control}
          name="contactName"
          render={({ field }) => (
            <TextField
              title="담당자 이름"
              value={field.value}
              onChangeText={field.onChange}
              errorMessage={errors.contactName?.message}
            />
          )}
        />
        <Spacing size={3} />
        <Controller
          control={control}
          name="contactPhone"
          render={({ field }) => (
            <TextField
              title="연락처"
              value={field.value}
              onChangeText={field.onChange}
              keyboardType="phone-pad"
              errorMessage={errors.contactPhone?.message}
            />
          )}
        />
        <Spacing size={3} />
        <TextBox variant="body2Bold" color={colors.grey900}>메시지 (선택)</TextBox>
        <Spacing size={2} />
        <Controller
          control={control}
          name="message"
          render={({ field }) => (
            <TextArea
              placeholder="팀 소개나 경기 정보를 입력해주세요. (최대 100자)"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              maxLength={100}
            />
          )}
        />
      </View>
      <BottomCTASingle safeArea>
        <Button
          variant="primary"
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          fullWidth
        >
          영입 신청하기
        </Button>
      </BottomCTASingle>
    </Drawer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[4],
    paddingBottom: 0,
  },
});
