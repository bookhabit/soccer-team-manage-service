import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import type { Control, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import {
  TextField,
  Select,
  Button,
  TextBox,
  Spacing,
  BottomCTASingle,
  SafeAreaWrapper,
  colors,
  spacing,
} from '@ui';
import type { OnboardingInput } from '../../data/schemas/auth.schema';
import {
  POSITION_OPTIONS,
  FOOT_OPTIONS,
  LEVEL_OPTIONS,
  GENDER_OPTIONS,
} from '@/src/shared/constants/player.constants';

const STEP_TITLES = [
  '이름을 알려주세요',
  '출생 연도를 알려주세요',
  '성별을 선택해주세요',
  '주 포지션을 선택해주세요',
  '주로 사용하는 발을 알려주세요',
  '축구 경력을 알려주세요',
  '실력 수준을 선택해주세요',
];


interface OnboardingViewProps {
  step: number;
  totalSteps: number;
  control: Control<OnboardingInput>;
  errors: FieldErrors<OnboardingInput>;
  isPending: boolean;
  onNext: () => void;
  onBack: () => void;
  isLastStep: boolean;
}

export function OnboardingView({
  step,
  totalSteps,
  control,
  errors,
  isPending,
  onNext,
  onBack,
  isLastStep,
}: OnboardingViewProps) {
  const progressPercent = `${(step / totalSteps) * 100}%` as `${number}%`;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 상단 Safe Area + 진행 바 */}
      <SafeAreaWrapper edges={['top']}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: progressPercent }]} />
        </View>
      </SafeAreaWrapper>

      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {step > 1 && (
          <View style={styles.backBtnWrapper}>
            <Button variant="ghost" size="small" onPress={onBack}>
              ← 이전
            </Button>
          </View>
        )}

        <Spacing size={4} />
        <TextBox variant="caption" color={colors.grey400}>
          {step} / {totalSteps}
        </TextBox>
        <Spacing size={2} />
        <TextBox variant="heading2" color={colors.grey900} style={styles.title}>
          {STEP_TITLES[step - 1]}
        </TextBox>
        <Spacing size={6} />

        {/* Step 1 — 이름 */}
        {step === 1 && (
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <TextField
                title="닉네임"
                placeholder="2~20자"
                value={value}
                onChangeText={onChange}
                errorMessage={errors.name?.message}
                autoFocus
              />
            )}
          />
        )}

        {/* Step 2 — 출생 연도 */}
        {step === 2 && (
          <Controller
            control={control}
            name="birthYear"
            render={({ field: { onChange, value } }) => (
              <TextField
                title="출생 연도"
                placeholder="예) 1995"
                keyboardType="numeric"
                value={value ? String(value) : ''}
                onChangeText={(v) => onChange(v ? parseInt(v, 10) : 0)}
                errorMessage={errors.birthYear?.message}
                autoFocus
              />
            )}
          />
        )}

        {/* Step 3 — 성별 (선택) */}
        {step === 3 && (
          <Controller
            control={control}
            name="gender"
            render={({ field: { onChange, value } }) => (
              <Select
                label="성별 (선택 사항)"
                options={GENDER_OPTIONS}
                value={value ?? ''}
                onChange={onChange}
                placeholder="선택 안 함"
              />
            )}
          />
        )}

        {/* Step 4 — 포지션 */}
        {step === 4 && (
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
        )}

        {/* Step 5 — 주 발 */}
        {step === 5 && (
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
        )}

        {/* Step 6 — 경력 */}
        {step === 6 && (
          <Controller
            control={control}
            name="years"
            render={({ field: { onChange, value } }) => (
              <TextField
                title="축구 경력"
                placeholder="예) 3 (단위: 년)"
                keyboardType="numeric"
                value={value !== undefined ? String(value) : ''}
                onChangeText={(v) => onChange(v ? parseInt(v, 10) : 0)}
                errorMessage={errors.years?.message}
                autoFocus
              />
            )}
          />
        )}

        {/* Step 7 — 실력 */}
        {step === 7 && (
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
        )}
      </ScrollView>

      <BottomCTASingle
        label={isLastStep ? '시작하기' : '다음'}
        onClick={onNext}
        loading={isPending && isLastStep}
        safeArea
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex1: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.grey200,
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.primary,
  },
  content: {
    padding: spacing[6],
    paddingBottom: spacing[4],
  },
  backBtnWrapper: {
    alignSelf: 'flex-start',
    marginBottom: spacing[2],
  },
  title: { lineHeight: 30 },
});
