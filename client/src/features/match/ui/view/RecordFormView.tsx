import React from 'react';
import { ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ScreenLayout,
  BottomCTASingle,
  Select,
  TextBox,
  Spacing,
  Button,
  colors,
  spacing,
} from '@ui';
import { RecordInputSchema } from '../../data/schemas/match.schema';
import type { RecordInput, Attendance } from '../../data/schemas/match.schema';

interface RecordFormViewProps {
  participants: Attendance[];
  defaultValues?: Partial<RecordInput>;
  isSubmitting: boolean;
  onSubmit: (data: RecordInput) => void;
  onCancel: () => void;
}

export function RecordFormView({
  participants,
  defaultValues,
  isSubmitting,
  onSubmit,
  onCancel,
}: RecordFormViewProps) {
  const attending = participants.filter((p) => p.response === 'ATTEND');
  const playerOptions = attending.map((p) => ({
    label: p.user.name ?? '선수',
    value: p.userId,
  }));
  const playerOptionsWithEmpty = [{ label: '선택 안 함', value: '' }, ...playerOptions];

  const quarterOptions = [1, 2, 3, 4, 5, 6].map((q) => ({
    label: `${q}쿼터`,
    value: String(q),
  }));
  const quarterOptionsWithEmpty = [{ label: '선택 안 함', value: '' }, ...quarterOptions];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RecordInput>({
    resolver: zodResolver(RecordInputSchema),
    defaultValues: {
      homeScore: 0,
      awayScore: 0,
      goals: [],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'goals' });

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.content}>
        <TextBox variant="heading3" color={colors.grey900}>경기 기록 입력</TextBox>
        <Spacing size={4} />

        {/* 스코어 */}
        <View style={styles.scoreRow}>
          <View style={styles.scoreInput}>
            <TextBox variant="body2Bold" color={colors.grey700}>우리팀</TextBox>
            <Controller
              control={control}
              name="homeScore"
              render={({ field: { value, onChange } }) => (
                <View style={styles.scoreCounter}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => onChange(Math.max(0, value - 1))}
                  >
                    <TextBox variant="heading3" color={colors.grey700}>−</TextBox>
                  </TouchableOpacity>
                  <TextBox variant="heading2" color={colors.grey900}>{value}</TextBox>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => onChange(value + 1)}
                  >
                    <TextBox variant="heading3" color={colors.grey700}>+</TextBox>
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.homeScore ? (
              <TextBox variant="caption" color={colors.error}>{errors.homeScore.message}</TextBox>
            ) : null}
          </View>

          <TextBox variant="heading2" color={colors.grey400}>:</TextBox>

          <View style={styles.scoreInput}>
            <TextBox variant="body2Bold" color={colors.grey700}>상대팀</TextBox>
            <Controller
              control={control}
              name="awayScore"
              render={({ field: { value, onChange } }) => (
                <View style={styles.scoreCounter}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => onChange(Math.max(0, value - 1))}
                  >
                    <TextBox variant="heading3" color={colors.grey700}>−</TextBox>
                  </TouchableOpacity>
                  <TextBox variant="heading2" color={colors.grey900}>{value}</TextBox>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => onChange(value + 1)}
                  >
                    <TextBox variant="heading3" color={colors.grey700}>+</TextBox>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* 득점 목록 */}
        <View style={styles.goalsHeader}>
          <TextBox variant="body2Bold" color={colors.grey900}>득점 기록 ({fields.length})</TextBox>
          <Button
            variant="ghost"
            onPress={() =>
              append({ scorerUserId: '', assistUserId: undefined, quarterNumber: undefined })
            }
          >+ 득점 추가</Button>
        </View>
        <Spacing size={2} />

        {fields.map((field, idx) => (
          <View key={field.id} style={styles.goalItem}>
            <View style={styles.goalItemHeader}>
              <TextBox variant="captionBold" color={colors.grey700}>득점 {idx + 1}</TextBox>
              <TouchableOpacity onPress={() => remove(idx)}>
                <TextBox variant="caption" color={colors.error}>삭제</TextBox>
              </TouchableOpacity>
            </View>

            <Controller
              control={control}
              name={`goals.${idx}.scorerUserId`}
              render={({ field: { value, onChange } }) => (
                <Select
                  label="득점자"
                  options={playerOptions}
                  value={value}
                  onChange={onChange}
                  errorMessage={
                    errors.goals?.[idx]?.scorerUserId?.message
                  }
                />
              )}
            />
            <Spacing size={2} />

            <Controller
              control={control}
              name={`goals.${idx}.assistUserId`}
              render={({ field: { value, onChange } }) => (
                <Select
                  label="도움 (선택)"
                  options={playerOptionsWithEmpty}
                  value={value ?? ''}
                  onChange={(v) => onChange(v || undefined)}
                />
              )}
            />
            <Spacing size={2} />

            <Controller
              control={control}
              name={`goals.${idx}.quarterNumber`}
              render={({ field: { value, onChange } }) => (
                <Select
                  label="쿼터 (선택)"
                  options={quarterOptionsWithEmpty}
                  value={value != null ? String(value) : ''}
                  onChange={(v) => onChange(v ? Number(v) : undefined)}
                />
              )}
            />
          </View>
        ))}

        <Spacing size={20} />
      </ScrollView>

      <BottomCTASingle
        safeArea
        label="기록 저장"
        onClick={handleSubmit(onSubmit)}
        loading={isSubmitting}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[4],
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[6],
  },
  scoreInput: {
    alignItems: 'center',
    gap: spacing[2],
  },
  scoreCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  counterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.grey100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.grey100,
    marginVertical: spacing[4],
  },
  goalsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalItem: {
    borderWidth: 1,
    borderColor: colors.grey200,
    borderRadius: 10,
    padding: spacing[3],
    gap: spacing[2],
    marginBottom: spacing[3],
    backgroundColor: colors.grey50,
  },
  goalItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
