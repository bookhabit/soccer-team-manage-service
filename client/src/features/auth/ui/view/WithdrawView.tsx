import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import type { Control, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import {
  Select, TextBox, Spacing, BottomCTASingle, ScreenLayout, colors, spacing,
} from '@ui';
import type { WithdrawInput } from '../../data/schemas/user.schema';

const REASON_OPTIONS = [
  { value: 'TIME_CONFLICT', label: '시간이 맞지 않아서' },
  { value: 'MOVING_TEAM', label: '다른 팀으로 이동' },
  { value: 'QUITTING_SOCCER', label: '축구를 그만두게 됨' },
  { value: 'BAD_ATMOSPHERE', label: '팀 분위기가 안 맞아서' },
  { value: 'OTHER', label: '기타' },
];

interface WithdrawViewProps {
  control: Control<WithdrawInput>;
  errors: FieldErrors<WithdrawInput>;
  isPending: boolean;
  onSubmit: () => void;
}

export function WithdrawView({
  control,
  errors,
  isPending,
  onSubmit,
}: WithdrawViewProps) {
  return (
    <ScreenLayout
      bottomSlot={<BottomCTASingle label="탈퇴하기" onClick={onSubmit} loading={isPending} />}
    >
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TextBox variant="heading2" color={colors.grey900}>
          정말 탈퇴하시겠어요?
        </TextBox>
        <Spacing size={2} />
        <TextBox variant="body2" color={colors.grey500}>
          탈퇴하면 모든 데이터가 삭제되며 복구할 수 없습니다.
        </TextBox>

        <Spacing size={6} />

        <View style={styles.warningBox}>
          <TextBox variant="captionBold" color={colors.error}>
            삭제되는 정보
          </TextBox>
          <Spacing size={2} />
          <TextBox variant="caption" color={colors.grey600}>
            • 프로필 및 개인정보{'\n'}
            • 팀 활동 이력{'\n'}
            • 매너 온도 기록
          </TextBox>
        </View>

        <Spacing size={6} />

        <Controller
          control={control}
          name="reason"
          render={({ field: { onChange, value } }) => (
            <Select
              label="탈퇴 사유"
              options={REASON_OPTIONS}
              value={value ?? ''}
              onChange={onChange}
              errorMessage={errors.reason?.message}
              placeholder="사유를 선택해주세요"
            />
          )}
        />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  content: {
    padding: spacing[6],
    paddingBottom: spacing[4],
  },
  warningBox: {
    backgroundColor: colors.red50,
    borderRadius: 12,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.red100,
  },
});
