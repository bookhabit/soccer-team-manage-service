import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import type { Control, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import {
  TextField, Select, Spacing,
  BottomCTASingle, SafeAreaWrapper, TextBox, colors, spacing,
} from '@ui';
import type { UpdateProfileInput } from '../../data/schemas/user.schema';

const POSITION_OPTIONS = [
  { value: 'FW', label: '공격수 (FW)' },
  { value: 'MF', label: '미드필더 (MF)' },
  { value: 'DF', label: '수비수 (DF)' },
  { value: 'GK', label: '골키퍼 (GK)' },
];

const FOOT_OPTIONS = [
  { value: 'RIGHT', label: '오른발' },
  { value: 'LEFT', label: '왼발' },
  { value: 'BOTH', label: '양발' },
];

const LEVEL_OPTIONS = [
  { value: 'BEGINNER', label: '입문 (풋살 입문자)' },
  { value: 'AMATEUR', label: '아마추어 (동호회 수준)' },
  { value: 'SEMI_PRO', label: '세미프로 (실업팀 수준)' },
  { value: 'PRO', label: '프로 (선수 출신)' },
];

interface ProfileEditViewProps {
  control: Control<UpdateProfileInput>;
  errors: FieldErrors<UpdateProfileInput>;
  isPending: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

export function ProfileEditView({
  control,
  errors,
  isPending,
  onSubmit,
  onBack,
}: ProfileEditViewProps) {
  return (
    <View style={styles.container}>
      <SafeAreaWrapper edges={['top']} />
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TextBox variant="heading2" color={colors.grey900} style={styles.title}>
          프로필 수정
        </TextBox>
        <Spacing size={6} />

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextField
              title="닉네임"
              placeholder="2~20자"
              value={value ?? ''}
              onChangeText={onChange}
              errorMessage={errors.name?.message}
            />
          )}
        />
        <Spacing size={4} />

        <Controller
          control={control}
          name="position"
          render={({ field: { onChange, value } }) => (
            <Select
              label="주 포지션"
              options={POSITION_OPTIONS}
              value={value ?? ''}
              onChange={onChange}
              errorMessage={errors.position?.message}
              placeholder="포지션 선택"
            />
          )}
        />
        <Spacing size={4} />

        <Controller
          control={control}
          name="foot"
          render={({ field: { onChange, value } }) => (
            <Select
              label="주 발"
              options={FOOT_OPTIONS}
              value={value ?? ''}
              onChange={onChange}
              errorMessage={errors.foot?.message}
              placeholder="선택"
            />
          )}
        />
        <Spacing size={4} />

        <Controller
          control={control}
          name="level"
          render={({ field: { onChange, value } }) => (
            <Select
              label="실력 수준"
              options={LEVEL_OPTIONS}
              value={value ?? ''}
              onChange={onChange}
              errorMessage={errors.level?.message}
              placeholder="실력 선택"
            />
          )}
        />
      </ScrollView>

      <SafeAreaWrapper edges={['bottom']}>
        <BottomCTASingle
          label="저장"
          onClick={onSubmit}
          loading={isPending}
        />
      </SafeAreaWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex1: { flex: 1 },
  content: {
    padding: spacing[6],
    paddingBottom: spacing[4],
  },
  title: { lineHeight: 30 },
});
