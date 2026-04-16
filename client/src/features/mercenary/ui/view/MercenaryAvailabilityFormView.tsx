import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Controller } from 'react-hook-form';
import type { Control, FieldErrors } from 'react-hook-form';
import {
  TextBox,
  TextField,
  Select,
  BottomCTASingle,
  ScreenLayout,
  Spacing,
  Switch,
  colors,
  spacing,
  Flex,
} from '@ui';
import { PositionPicker } from '../components/PositionPicker';
import { DateMultiPicker } from '../components/DateMultiPicker';
import type { Region } from '@/src/shared/services/region.service';
import type { CreateMercenaryAvailabilityInput } from '../../data/schemas/mercenaryAvailability.schema';

interface Props {
  control: Control<CreateMercenaryAvailabilityInput>;
  errors: FieldErrors<CreateMercenaryAvailabilityInput>;
  regions: Region[];
  isPending: boolean;
  onSubmit: () => void;
  submitLabel?: string;
}

export function MercenaryAvailabilityFormView({
  control,
  errors,
  regions,
  isPending,
  onSubmit,
  submitLabel = '등록하기',
}: Props) {
  const regionOptions = regions.map((r) => ({ value: r.id, label: `${r.name} ${r.sigungu}` }));

  return (
    <ScreenLayout
      bottomSlot={
        <BottomCTASingle label={submitLabel} onClick={onSubmit} loading={isPending} safeArea />
      }
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextBox variant="heading3" color={colors.grey900}>용병 가능 등록</TextBox>
        <Spacing size={4} />

        {/* 포지션 */}
        <TextBox variant="body2Bold" color={colors.grey700}>가능 포지션 *</TextBox>
        <Spacing size={2} />
        <Controller
          control={control}
          name="positions"
          render={({ field }) => (
            <PositionPicker value={field.value ?? []} onChange={field.onChange} />
          )}
        />
        {errors.positions && (
          <TextBox variant="caption" color={colors.error}>{errors.positions.message}</TextBox>
        )}
        <Spacing size={4} />

        {/* 가능 날짜 — 캘린더 복수 선택 */}
        <TextBox variant="body2Bold" color={colors.grey700}>가능 날짜 *</TextBox>
        <Spacing size={2} />
        <Controller
          control={control}
          name="availableDates"
          render={({ field }) => (
            <DateMultiPicker value={field.value ?? []} onChange={field.onChange} />
          )}
        />
        {(errors.availableDates?.message || (errors.availableDates as any)?.[0]?.message) && (
          <TextBox variant="caption" color={colors.error}>
            {errors.availableDates?.message ?? (errors.availableDates as any)?.[0]?.message}
          </TextBox>
        )}
        <Spacing size={3} />

        {/* 지역 — 복수 선택 (Select로 단순화) */}
        <Controller
          control={control}
          name="regionIds"
          render={({ field }) => (
            <Select
              title="가능 지역 *"
              options={regionOptions}
              value={field.value?.[0] ?? ''}
              onChange={(v) => field.onChange([v])}
              errorMessage={errors.regionIds?.message}
            />
          )}
        />
        <Spacing size={3} />

        {/* 가능 시간대 */}
        <Controller
          control={control}
          name="timeSlot"
          render={({ field }) => (
            <TextField
              title="가능 시간대"
              placeholder="예: 저녁 18시 이후"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              errorMessage={errors.timeSlot?.message}
            />
          )}
        />
        <Spacing size={3} />

        {/* 자기소개 */}
        <Controller
          control={control}
          name="bio"
          render={({ field }) => (
            <TextField
              title="자기소개"
              placeholder="포지션, 경험, 특기 등을 자유롭게 입력해주세요."
              value={field.value ?? ''}
              onChangeText={field.onChange}
              multiline
              errorMessage={errors.bio?.message}
            />
          )}
        />
        <Spacing size={4} />

        {/* 참가비 희망 여부 */}
        <Controller
          control={control}
          name="acceptsFee"
          render={({ field }) => (
            <Flex direction="row" align="center" justify="space-between">
              <TextBox variant="body2Bold" color={colors.grey700}>참가비 수락</TextBox>
              <Switch value={field.value ?? true} onValueChange={field.onChange} />
            </Flex>
          )}
        />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing[4], paddingBottom: spacing[8] },
});
