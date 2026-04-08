import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableOpacity,
} from 'react-native';
import type { Control, FieldErrors, UseFormTrigger } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import {
  TextField,
  Select,
  TextBox,
  Button,
  Spacing,
  ScreenLayout,
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

// ─── 상수 ────────────────────────────────────────────────────────────────────

const STEP_FIELDS: (keyof OnboardingInput)[] = [
  'name',
  'birthYear',
  'gender',
  'position',
  'foot',
  'years',
  'level',
];

const STEP_TITLES = [
  '이름을 알려주세요',
  '출생 연도를 알려주세요',
  '성별을 선택해주세요',
  '주 포지션을 선택해주세요',
  '주로 사용하는 발을 알려주세요',
  '축구 경력을 알려주세요',
  '실력 수준을 선택해주세요',
];

const TOTAL_FIELDS = STEP_FIELDS.length;

/** 성별은 선택 사항 — onBlur가 없으므로 건너뛰기 버튼 제공 */
const OPTIONAL_FIELD_INDICES = new Set([2]);

// ─── Props ───────────────────────────────────────────────────────────────────

interface OnboardingViewProps {
  control: Control<OnboardingInput>;
  errors: FieldErrors<OnboardingInput>;
  trigger: UseFormTrigger<OnboardingInput>;
  isPending: boolean;
  onSubmit: () => void;
}

// ─── FieldReveal ─────────────────────────────────────────────────────────────

/**
 * 처음 마운트될 때 fade + slide 애니메이션으로 자연스럽게 나타나는 래퍼.
 */
function FieldReveal({ children }: { children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

// ─── OnboardingView ───────────────────────────────────────────────────────────

export function OnboardingView({
  control,
  errors,
  trigger,
  isPending,
  onSubmit,
}: OnboardingViewProps) {
  const [visibleCount, setVisibleCount] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const visibleCountRef = useRef(1);
  const scrollRef = useRef<ScrollView>(null);
  const fieldYPositions = useRef<number[]>(new Array(TOTAL_FIELDS).fill(0));

  const progressPercent = `${Math.round((visibleCount / TOTAL_FIELDS) * 100)}%` as `${number}%`;

  /** 현재 필드 검증 후 다음 필드를 노출하거나 완료 처리 */
  const revealNext = async (currentIndex: number) => {
    const field = STEP_FIELDS[currentIndex];
    const isValid = await trigger(field);
    if (!isValid) return;

    const isLastField = currentIndex === TOTAL_FIELDS - 1;

    if (isLastField) {
      setIsComplete(true);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 80);
      return;
    }

    const nextCount = currentIndex + 2;
    if (visibleCountRef.current < nextCount) {
      visibleCountRef.current = nextCount;
      setVisibleCount(nextCount);
      setTimeout(() => {
        const y = fieldYPositions.current[currentIndex + 1];
        scrollRef.current?.scrollTo({ y: Math.max(0, y - spacing[4]), animated: true });
      }, 80);
    }
  };

  const progressBar = (
    <View style={styles.progressBar}>
      <View style={[styles.progressFill, { width: progressPercent }]} />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenLayout topSlot={progressBar}>
        <ScrollView
          ref={scrollRef}
          style={styles.flex1}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {STEP_FIELDS.slice(0, visibleCount).map((fieldName, index) => {
            const isNewest = index === visibleCount - 1;

            return (
              <FieldReveal key={fieldName}>
                <View
                  onLayout={(e) => {
                    fieldYPositions.current[index] = e.nativeEvent.layout.y;
                  }}
                >
                  <TextBox variant="heading3" color={colors.grey900} style={styles.fieldTitle}>
                    {STEP_TITLES[index]}
                  </TextBox>
                  <Spacing size={3} />

                  {/* Step 0 — 이름 */}
                  {index === 0 && (
                    <Controller
                      control={control}
                      name="name"
                      render={({ field: { onChange, value, onBlur } }) => (
                        <TextField
                          placeholder="2~20자"
                          value={value}
                          onChangeText={onChange}
                          onBlur={() => { onBlur(); revealNext(0); }}
                          errorMessage={errors.name?.message}
                          autoFocus={isNewest}
                        />
                      )}
                    />
                  )}

                  {/* Step 1 — 출생 연도 */}
                  {index === 1 && (
                    <Controller
                      control={control}
                      name="birthYear"
                      render={({ field: { onChange, value, onBlur } }) => (
                        <TextField
                          placeholder="예) 1995"
                          keyboardType="numeric"
                          value={value ? String(value) : ''}
                          onChangeText={(v) => onChange(v ? parseInt(v, 10) : 0)}
                          onBlur={() => { onBlur(); revealNext(1); }}
                          errorMessage={errors.birthYear?.message}
                          autoFocus={isNewest}
                        />
                      )}
                    />
                  )}

                  {/* Step 2 — 성별 (선택 사항) */}
                  {index === 2 && (
                    <>
                      <Controller
                        control={control}
                        name="gender"
                        render={({ field: { onChange, value } }) => (
                          <Select
                            options={GENDER_OPTIONS}
                            value={value ?? ''}
                            onChange={(v) => { onChange(v); revealNext(2); }}
                            placeholder="선택 안 함"
                          />
                        )}
                      />
                      <TouchableOpacity
                        onPress={() => revealNext(2)}
                        style={styles.skipButton}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <TextBox variant="caption" color={colors.grey400}>
                          건너뛰기
                        </TextBox>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Step 3 — 포지션 */}
                  {index === 3 && (
                    <Controller
                      control={control}
                      name="position"
                      render={({ field: { onChange, value } }) => (
                        <Select
                          options={POSITION_OPTIONS}
                          value={value ?? ''}
                          onChange={(v) => { onChange(v); revealNext(3); }}
                          errorMessage={errors.position?.message}
                          placeholder="포지션 선택"
                        />
                      )}
                    />
                  )}

                  {/* Step 4 — 주 발 */}
                  {index === 4 && (
                    <Controller
                      control={control}
                      name="foot"
                      render={({ field: { onChange, value } }) => (
                        <Select
                          options={FOOT_OPTIONS}
                          value={value ?? ''}
                          onChange={(v) => { onChange(v); revealNext(4); }}
                          errorMessage={errors.foot?.message}
                          placeholder="선택"
                        />
                      )}
                    />
                  )}

                  {/* Step 5 — 경력 */}
                  {index === 5 && (
                    <Controller
                      control={control}
                      name="years"
                      render={({ field: { onChange, value, onBlur } }) => (
                        <TextField
                          placeholder="예) 3 (단위: 년)"
                          keyboardType="numeric"
                          value={value !== undefined ? String(value) : ''}
                          onChangeText={(v) => onChange(v ? parseInt(v, 10) : 0)}
                          onBlur={() => { onBlur(); revealNext(5); }}
                          errorMessage={errors.years?.message}
                          autoFocus={isNewest}
                        />
                      )}
                    />
                  )}

                  {/* Step 6 — 실력 */}
                  {index === 6 && (
                    <Controller
                      control={control}
                      name="level"
                      render={({ field: { onChange, value } }) => (
                        <Select
                          options={LEVEL_OPTIONS}
                          value={value ?? ''}
                          onChange={(v) => { onChange(v); revealNext(6); }}
                          errorMessage={errors.level?.message}
                          placeholder="실력 선택"
                        />
                      )}
                    />
                  )}

                  <Spacing size={6} />
                </View>
              </FieldReveal>
            );
          })}

          {/* 모든 필드 완료 후 제출 버튼 노출 */}
          {isComplete && (
            <FieldReveal>
              <Button
                variant="primary"
                size="large"
                fullWidth
                loading={isPending}
                onPress={onSubmit}
              >
                시작하기
              </Button>
              <Spacing size={4} />
            </FieldReveal>
          )}
        </ScrollView>
      </ScreenLayout>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex1: { flex: 1 },
  progressBar: {
    height: 4,
    backgroundColor: colors.grey200,
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  content: {
    padding: spacing[6],
    paddingBottom: spacing[10],
  },
  fieldTitle: {
    lineHeight: 28,
  },
  skipButton: {
    alignSelf: 'flex-start',
    marginTop: spacing[2],
  },
});
