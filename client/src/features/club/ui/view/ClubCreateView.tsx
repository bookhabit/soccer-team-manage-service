import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Controller } from 'react-hook-form';
import type { Control, FieldErrors } from 'react-hook-form';
import {
  TextBox, TextField, TextArea, Select, Button, Spacing,
  BottomCTASingle, ScreenLayout, colors, spacing,
} from '@ui';
import type { CreateClubInput } from '../../data/schemas/club.schema';
import { LEVEL_OPTIONS } from '@/src/shared/constants/player.constants';

const STEP_TITLES = ['기본 정보', '팀 설정', '소개'];
const MAX_STEPS = 3;

interface ClubCreateViewProps {
  step: number;
  control: Control<CreateClubInput>;
  errors: FieldErrors<CreateClubInput>;
  isPending: boolean;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
  regionOptions: { value: string; label: string }[];
}

/**
 * 클럽 생성 3단계 Funnel View.
 */
export function ClubCreateView({
  step,
  control,
  errors,
  isPending,
  onNext,
  onBack,
  onSubmit,
  regionOptions,
}: ClubCreateViewProps) {
  const isLastStep = step === MAX_STEPS;

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* 진행 표시 */}
        <View style={styles.stepIndicator}>
          {Array.from({ length: MAX_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[styles.stepDot, i < step ? styles.stepDotActive : styles.stepDotInactive]}
            />
          ))}
        </View>

        <Spacing size={2} />
        <TextBox variant="caption" color={colors.grey500}>
          {step}/{MAX_STEPS} — {STEP_TITLES[step - 1]}
        </TextBox>
        <Spacing size={6} />

        {step === 1 && (
          <>
            <TextBox variant="heading3" color={colors.grey900}>팀 이름을 입력해주세요</TextBox>
            <Spacing size={4} />
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <TextField
                  title="팀 이름"
                  placeholder="2~30자 이내"
                  value={value}
                  onChangeText={onChange}
                  errorMessage={errors.name?.message}
                  maxLength={30}
                />
              )}
            />
            <Spacing size={4} />
            <Controller
              control={control}
              name="regionId"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="활동 지역"
                  options={regionOptions}
                  value={value}
                  onChange={onChange}
                  errorMessage={errors.regionId?.message}
                />
              )}
            />
          </>
        )}

        {step === 2 && (
          <>
            <TextBox variant="heading3" color={colors.grey900}>팀 설정을 완료해주세요</TextBox>
            <Spacing size={4} />
            <Controller
              control={control}
              name="level"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="팀 레벨"
                  options={LEVEL_OPTIONS}
                  value={value}
                  onChange={onChange}
                  errorMessage={errors.level?.message}
                />
              )}
            />
            <Spacing size={4} />
            <Controller
              control={control}
              name="maxMemberCount"
              render={({ field: { onChange, value } }) => (
                <TextField
                  title="최대 인원"
                  placeholder="2~50"
                  keyboardType="number-pad"
                  value={value != null ? String(value) : ''}
                  onChangeText={(v) => onChange(Number(v))}
                  errorMessage={errors.maxMemberCount?.message}
                />
              )}
            />
          </>
        )}

        {step === 3 && (
          <>
            <TextBox variant="heading3" color={colors.grey900}>팀을 소개해주세요</TextBox>
            <Spacing size={4} />
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextArea
                  title="팀 소개 (선택)"
                  placeholder="팀의 특징, 모집 조건 등을 자유롭게 작성해주세요."
                  value={value ?? ''}
                  onChangeText={onChange}
                  errorMessage={errors.description?.message}
                  maxLength={500}
                />
              )}
            />
          </>
        )}

        <Spacing size={20} />
      </ScrollView>

      <BottomCTASingle
        label={isLastStep ? '팀 만들기' : '다음'}
        onClick={isLastStep ? onSubmit : onNext}
        loading={isPending}
        safeArea
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[5],
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  stepDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  stepDotActive: {
    backgroundColor: colors.blue500,
  },
  stepDotInactive: {
    backgroundColor: colors.grey200,
  },
});
