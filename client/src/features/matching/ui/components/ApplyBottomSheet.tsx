import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Drawer, TextField, TextArea, Button, TextBox, Spacing, colors, spacing } from '@ui';
import {
  CreateMatchApplicationSchema,
  type CreateMatchApplicationInput,
} from '../../data/schemas/matchApplication.schema';

interface ApplyBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMatchApplicationInput) => void;
  isPending: boolean;
  defaultContactName: string;
  defaultContactPhone: string;
}

/**
 * 매칭 신청 BottomSheet.
 * contactName/contactPhone은 user.name/user.phone에서 기본값을 받아 채운다.
 */
export function ApplyBottomSheet({
  isOpen,
  onClose,
  onSubmit,
  isPending,
  defaultContactName,
  defaultContactPhone,
}: ApplyBottomSheetProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateMatchApplicationInput>({
    resolver: zodResolver(CreateMatchApplicationSchema),
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

  const handleFormSubmit = handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title="매칭 신청">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Spacing size={2} />
        <TextBox variant="body2" color={colors.grey600}>
          신청 후 상대팀 관리자가 수락하면 매칭이 확정됩니다.
        </TextBox>
        <Spacing size={4} />

        {/* 담당자 이름 */}
        <Controller
          control={control}
          name="contactName"
          render={({ field: { onChange, value } }) => (
            <TextField
              title="담당자 이름 *"
              placeholder="이름"
              value={value}
              onChangeText={onChange}
              errorMessage={errors.contactName?.message}
              maxLength={50}
            />
          )}
        />
        <Spacing size={3} />

        {/* 연락처 */}
        <Controller
          control={control}
          name="contactPhone"
          render={({ field: { onChange, value } }) => (
            <TextField
              title="연락처 *"
              placeholder="010-0000-0000"
              value={value}
              onChangeText={onChange}
              keyboardType="phone-pad"
              errorMessage={errors.contactPhone?.message}
              maxLength={20}
            />
          )}
        />
        <Spacing size={3} />

        {/* 메시지 (선택) */}
        <Controller
          control={control}
          name="message"
          render={({ field: { onChange, value } }) => (
            <TextArea
              title="메시지 (선택)"
              placeholder="간단한 팀 소개나 요청 사항을 적어주세요."
              value={value ?? ''}
              onChangeText={onChange}
              errorMessage={errors.message?.message}
              maxLength={100}
            />
          )}
        />
        <Spacing size={5} />

        <Button variant="primary" size="large" fullWidth onPress={handleFormSubmit} loading={isPending}>
          신청하기
        </Button>
        <Spacing size={4} />
      </ScrollView>
    </Drawer>
  );
}

const styles = StyleSheet.create({});
