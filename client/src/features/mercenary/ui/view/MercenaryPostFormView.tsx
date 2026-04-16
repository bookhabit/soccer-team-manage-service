import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Controller } from 'react-hook-form';
import type { Control, FieldErrors } from 'react-hook-form';
import {
  TextBox,
  TextField,
  Select,
  BottomCTASingle,
  ScreenLayout,
  Spacing,
  colors,
  spacing,
  Button,
  DateInputField,
  TimeInputField,
} from '@ui';
import { PositionPicker } from '../components/PositionPicker';
import type { Region } from '@/src/shared/services/region.service';
import type { CreateMercenaryPostInput } from '../../data/schemas/mercenaryPost.schema';

const LEVEL_OPTIONS = [
  { value: 'BEGINNER', label: '초급' },
  { value: 'AMATEUR', label: '아마추어' },
  { value: 'SEMI_PRO', label: '세미프로' },
  { value: 'PRO', label: '프로' },
];

interface Props {
  control: Control<CreateMercenaryPostInput>;
  errors: FieldErrors<CreateMercenaryPostInput>;
  regions: Region[];
  isPending: boolean;
  onSubmit: () => void;
  submitLabel?: string;
}

export function MercenaryPostFormView({
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
        <TextBox variant="heading3" color={colors.grey900}>
          용병 구함 등록
        </TextBox>
        <Spacing size={4} />

        {/* 포지션 */}
        <TextBox variant="body2Bold" color={colors.grey700}>
          포지션 *
        </TextBox>
        <Spacing size={2} />
        <Controller
          control={control}
          name="positions"
          render={({ field }) => (
            <PositionPicker value={field.value ?? []} onChange={field.onChange} />
          )}
        />
        {errors.positions && (
          <TextBox variant="caption" color={colors.error}>
            {errors.positions.message}
          </TextBox>
        )}
        <Spacing size={4} />

        {/* 필요 인원 */}
        <Controller
          control={control}
          name="requiredCount"
          render={({ field }) => (
            <TextField
              title="필요 인원 *"
              value={field.value ? String(field.value) : ''}
              onChangeText={(v) => field.onChange(parseInt(v) || 0)}
              keyboardType="number-pad"
              errorMessage={errors.requiredCount?.message}
            />
          )}
        />
        <Spacing size={3} />

        {/* 경기 날짜 */}
        <Controller
          control={control}
          name="matchDate"
          render={({ field }) => (
            <DateInputField
              label="경기 날짜 *"
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.matchDate?.message}
              minimumDate={new Date()}
            />
          )}
        />
        <Spacing size={3} />

        {/* 시작 시간 */}
        <Controller
          control={control}
          name="startTime"
          render={({ field }) => (
            <TimeInputField
              label="시작 시간 *"
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.startTime?.message}
            />
          )}
        />
        <Spacing size={3} />

        {/* 종료 시간 */}
        <Controller
          control={control}
          name="endTime"
          render={({ field }) => (
            <TimeInputField
              label="종료 시간 *"
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.endTime?.message}
            />
          )}
        />
        <Spacing size={3} />

        {/* 장소 */}
        <Controller
          control={control}
          name="location"
          render={({ field }) => (
            <TextField
              title="구장 이름 *"
              placeholder="예: 마포구민운동장"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              errorMessage={errors.location?.message}
            />
          )}
        />
        <Spacing size={3} />

        {/* 주소 */}
        <Controller
          control={control}
          name="address"
          render={({ field }) => (
            <TextField
              title="구장 주소"
              placeholder="예: 서울 마포구 성산동 ..."
              value={field.value ?? ''}
              onChangeText={field.onChange}
              errorMessage={errors.address?.message}
            />
          )}
        />
        <Spacing size={3} />

        {/* 지역 */}
        <Controller
          control={control}
          name="regionId"
          render={({ field }) => (
            <Select
              label="지역 *"
              options={regionOptions}
              value={field.value ?? ''}
              onChange={field.onChange}
              errorMessage={errors.regionId?.message}
            />
          )}
        />
        <Spacing size={3} />

        {/* 실력 */}
        <Controller
          control={control}
          name="level"
          render={({ field }) => (
            <Select
              label="실력 *"
              options={LEVEL_OPTIONS}
              value={field.value ?? ''}
              onChange={field.onChange}
              errorMessage={errors.level?.message}
            />
          )}
        />
        <Spacing size={3} />

        {/* 참가비 */}
        <Controller
          control={control}
          name="fee"
          render={({ field }) => (
            <TextField
              title="참가비"
              placeholder="0 (무료)"
              value={field.value !== undefined ? String(field.value) : '0'}
              onChangeText={(v) => field.onChange(parseInt(v) || 0)}
              keyboardType="number-pad"
              errorMessage={errors.fee?.message}
            />
          )}
        />
        <Spacing size={3} />

        {/* 상세 설명 */}
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <TextField
              title="상세 설명"
              placeholder="경기에 대한 추가 정보를 입력해주세요."
              value={field.value ?? ''}
              onChangeText={field.onChange}
              multiline
              errorMessage={errors.description?.message}
            />
          )}
        />
        <Spacing size={3} />

        {/* 담당자 */}
        <Controller
          control={control}
          name="contactName"
          render={({ field }) => (
            <TextField
              title="담당자 이름 *"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              errorMessage={errors.contactName?.message}
            />
          )}
        />
        <Spacing size={3} />

        {/* 연락처 */}
        <Controller
          control={control}
          name="contactPhone"
          render={({ field }) => (
            <TextField
              title="담당자 연락처 *"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              keyboardType="phone-pad"
              errorMessage={errors.contactPhone?.message}
            />
          )}
        />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing[4], paddingBottom: spacing[8] },
});
