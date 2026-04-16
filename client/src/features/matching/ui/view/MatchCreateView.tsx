import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
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
  DateInputField,
  TimeInputField,
} from '@ui';
import { LEVEL_OPTIONS } from '@/src/shared/constants/player.constants';
import { RegionPicker } from '@/src/features/club/ui/components/RegionPicker';
import type { Region } from '@/src/shared/services/region.service';
import type { CreateMatchPostInput } from '../../data/schemas/matchPost.schema';

const GENDER_OPTIONS = [
  { value: 'MALE', label: '남성' },
  { value: 'FEMALE', label: '여성' },
  { value: 'MIXED', label: '혼성' },
];

const PLAYER_COUNT_OPTIONS = Array.from({ length: 7 }, (_, i) => ({
  value: String(i + 5),
  label: `${i + 5}명`,
}));

interface MatchCreateViewProps {
  control: Control<CreateMatchPostInput>;
  errors: FieldErrors<CreateMatchPostInput>;
  regions: Region[];
  isPending: boolean;
  onSubmit: () => void;
  submitLabel?: string;
}

/**
 * 매칭 게시글 등록/수정 폼 뷰.
 */
export function MatchCreateView({
  control,
  errors,
  regions,
  isPending,
  onSubmit,
  submitLabel = '등록하기',
}: MatchCreateViewProps) {
  return (
    <ScreenLayout
      bottomSlot={
        <BottomCTASingle label={submitLabel} onClick={onSubmit} loading={isPending} safeArea />
      }
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextBox variant="heading3" color={colors.grey900}>
          경기 정보
        </TextBox>
        <Spacing size={4} />

        {/* 날짜 */}
        <Controller
          control={control}
          name="matchDate"
          render={({ field: { onChange, value } }) => (
            <DateInputField
              label="경기 날짜 *"
              value={value}
              onChange={onChange}
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
          render={({ field: { onChange, value } }) => (
            <TimeInputField
              label="시작 시간 *"
              value={value}
              onChange={onChange}
              error={errors.startTime?.message}
            />
          )}
        />
        <Spacing size={3} />

        {/* 종료 시간 */}
        <Controller
          control={control}
          name="endTime"
          render={({ field: { onChange, value } }) => (
            <TimeInputField
              label="종료 시간 *"
              value={value}
              onChange={onChange}
              error={errors.endTime?.message}
            />
          )}
        />
        <Spacing size={5} />

        <TextBox variant="heading3" color={colors.grey900}>
          장소
        </TextBox>
        <Spacing size={4} />

        <Controller
          control={control}
          name="location"
          render={({ field: { onChange, value } }) => (
            <TextField
              title="구장 이름 *"
              placeholder="예: 서울 월드컵경기장"
              value={value}
              onChangeText={onChange}
              errorMessage={errors.location?.message}
              maxLength={100}
            />
          )}
        />
        <Spacing size={3} />

        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, value } }) => (
            <TextField
              title="상세 주소 (선택)"
              placeholder="도로명 주소"
              value={value ?? ''}
              onChangeText={onChange}
              errorMessage={errors.address?.message}
              maxLength={200}
            />
          )}
        />
        <Spacing size={3} />

        <Controller
          control={control}
          name="regionId"
          render={({ field: { onChange, value } }) => (
            <RegionPicker
              label="지역 *"
              regions={regions}
              value={value}
              onChange={onChange}
              errorMessage={errors.regionId?.message}
            />
          )}
        />
        <Spacing size={5} />

        <TextBox variant="heading3" color={colors.grey900}>
          경기 조건
        </TextBox>
        <Spacing size={4} />

        <Controller
          control={control}
          name="playerCount"
          render={({ field: { onChange, value } }) => (
            <Select
              label="인원 *"
              options={PLAYER_COUNT_OPTIONS}
              value={String(value ?? '')}
              onChange={(v) => onChange(Number(v))}
              errorMessage={errors.playerCount?.message}
            />
          )}
        />
        <Spacing size={3} />

        <Controller
          control={control}
          name="gender"
          render={({ field: { onChange, value } }) => (
            <Select
              label="성별 *"
              options={GENDER_OPTIONS}
              value={value}
              onChange={onChange}
              errorMessage={errors.gender?.message}
            />
          )}
        />
        <Spacing size={3} />

        <Controller
          control={control}
          name="level"
          render={({ field: { onChange, value } }) => (
            <Select
              label="레벨 *"
              options={LEVEL_OPTIONS}
              value={value}
              onChange={onChange}
              errorMessage={errors.level?.message}
            />
          )}
        />
        <Spacing size={3} />

        <Controller
          control={control}
          name="fee"
          render={({ field: { onChange, value } }) => (
            <TextField
              title="구장비 (원)"
              placeholder="0 입력 시 무료"
              value={value != null ? String(value) : ''}
              onChangeText={(v) => onChange(Number(v) || 0)}
              keyboardType="number-pad"
              errorMessage={errors.fee?.message}
            />
          )}
        />
        <Spacing size={5} />

        <TextBox variant="heading3" color={colors.grey900}>
          담당자 정보
        </TextBox>
        <Spacing size={4} />

        <Controller
          control={control}
          name="contactName"
          render={({ field: { onChange, value } }) => (
            <TextField
              title="담당자 이름 *"
              value={value}
              onChangeText={onChange}
              errorMessage={errors.contactName?.message}
              maxLength={50}
            />
          )}
        />
        <Spacing size={3} />

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
        <Spacing size={20} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[5],
  },
});
