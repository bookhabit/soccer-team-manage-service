import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Controller } from 'react-hook-form';
import type { Control, FieldErrors } from 'react-hook-form';
import {
  TextBox, TextArea, BottomCTASingle, Spacing, ScreenLayout, colors, spacing,
} from '@ui';
import type { JoinRequestInput } from '../../data/schemas/club.schema';
import type { ClubDetail } from '../../data/schemas/club.schema';
import { LEVEL_LABEL } from '@/src/shared/constants/player.constants';
import { RecruitmentBadge } from '../components/RecruitmentBadge';

interface JoinRequestViewProps {
  club: ClubDetail;
  control: Control<JoinRequestInput>;
  errors: FieldErrors<JoinRequestInput>;
  isPending: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

/**
 * 클럽 가입 신청 View — 클럽 정보 요약 + 자유 메시지 입력.
 */
export function JoinRequestView({
  club,
  control,
  errors,
  isPending,
  onSubmit,
  onCancel,
}: JoinRequestViewProps) {
  const levelLabel = LEVEL_LABEL[club.level] ?? club.level;

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* 클럽 요약 */}
        <View style={styles.clubSummary}>
          <View style={styles.nameRow}>
            <TextBox variant="heading3" color={colors.grey900}>{club.name}</TextBox>
            <RecruitmentBadge status={club.recruitmentStatus} />
          </View>
          <TextBox variant="body2" color={colors.grey500}>
            {club.regionName} · {levelLabel} · {club.currentMemberCount}/{club.maxMemberCount}명
          </TextBox>
        </View>

        <Spacing size={5} />

        <TextBox variant="body2Bold" color={colors.grey700}>가입 메시지 (선택)</TextBox>
        <Spacing size={2} />
        <Controller
          control={control}
          name="message"
          render={({ field: { onChange, value } }) => (
            <TextArea
              placeholder="자기소개나 가입 동기를 남겨보세요 (최대 500자)"
              value={value ?? ''}
              onChangeText={onChange}
              errorMessage={errors.message?.message}
              maxLength={500}
            />
          )}
        />

        <Spacing size={20} />
      </ScrollView>

      <BottomCTASingle
        label="가입 신청"
        onClick={onSubmit}
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
  clubSummary: {
    borderWidth: 1,
    borderColor: colors.grey200,
    borderRadius: 12,
    padding: spacing[4],
    gap: spacing[2],
    backgroundColor: colors.grey50,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
});
