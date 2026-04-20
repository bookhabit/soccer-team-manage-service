import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Drawer, TextBox, TextArea, BottomCTASingle, Spacing, colors, spacing } from '@ui';
import { CreateMercenaryApplicationSchema } from '../../data/schemas/mercenaryPost.schema';
import type { CreateMercenaryApplicationInput } from '../../data/schemas/mercenaryPost.schema';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMercenaryApplicationInput) => void;
  isLoading?: boolean;
}

export function ApplyBottomSheet({ isOpen, onClose, onSubmit, isLoading }: Props) {
  const { control, handleSubmit, reset } = useForm<CreateMercenaryApplicationInput>({
    resolver: zodResolver(CreateMercenaryApplicationSchema),
    defaultValues: { message: '' },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title="지원하기">
      <View style={styles.content}>
        <TextBox variant="body2Bold" color={colors.grey900}>지원 메시지 (선택)</TextBox>
        <Spacing size={2} />
        <Controller
          control={control}
          name="message"
          render={({ field }) => (
            <TextArea
              placeholder="자기소개나 간단한 메시지를 입력해주세요. (최대 100자)"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              maxLength={100}
            />
          )}
        />
      </View>
      <BottomCTASingle
        label="지원하기"
        onClick={handleSubmit(onSubmit)}
        disabled={isLoading}
        loading={isLoading}
        safeArea
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[4],
    paddingBottom: 0,
  },
});
