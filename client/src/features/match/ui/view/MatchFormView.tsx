import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity, Modal, Platform, StyleSheet } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import {
  ScreenLayout,
  BottomCTASingle,
  TextField,
  Select,
  TextBox,
  Spacing,
  colors,
  spacing,
} from '@ui';
import { CreateMatchSchema } from '../../data/schemas/match.schema';
import type { CreateMatchInput } from '../../data/schemas/match.schema';

interface MatchFormViewProps {
  defaultValues?: Partial<CreateMatchInput>;
  isSubmitting: boolean;
  submitLabel?: string;
  headerAction?: React.ReactNode;
  onSubmit: (data: CreateMatchInput) => void;
  onCancel: () => void;
}

const TYPE_OPTIONS = [
  { label: '자체전', value: 'SELF' },
  { label: '매칭전', value: 'LEAGUE' },
];

const LEVEL_OPTIONS = [
  { label: '입문', value: 'BEGINNER' },
  { label: '아마추어', value: 'AMATEUR' },
  { label: '세미프로', value: 'SEMI_PRO' },
  { label: '프로', value: 'PRO' },
];

type DateField = 'startAt' | 'endAt' | 'voteDeadline';

const DATE_FIELD_LABEL: Record<DateField, string> = {
  startAt: '시작 시간',
  endAt: '종료 시간',
  voteDeadline: '투표 마감 시간',
};

function formatDateDisplay(iso: string): string {
  if (!iso) return '날짜를 선택해주세요';
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** iOS 전용 — 날짜 선택 완료 후 Modal 닫기 버튼 */
function IOSPickerModal({
  visible,
  label,
  date,
  minimumDate,
  onChange,
  onDone,
}: {
  visible: boolean;
  label: string;
  date: Date;
  minimumDate?: Date;
  onChange: (d: Date) => void;
  onDone: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <TextBox variant="body2Bold" color={colors.grey900}>
              {label}
            </TextBox>
            <TouchableOpacity onPress={onDone}>
              <TextBox variant="body2Bold" color={colors.blue500}>
                완료
              </TextBox>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={date}
            mode="datetime"
            display="spinner"
            locale="ko-KR"
            minimumDate={minimumDate}
            onChange={(_, selected) => {
              if (selected) onChange(selected);
            }}
            style={styles.iosPicker}
          />
        </View>
      </View>
    </Modal>
  );
}

export function MatchFormView({
  defaultValues,
  isSubmitting,
  submitLabel = '경기 등록',
  headerAction,
  onSubmit,
  onCancel,
}: MatchFormViewProps) {
  const [activeField, setActiveField] = useState<DateField | null>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const showIOSPicker = Platform.OS === 'ios' && activeField !== null;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateMatchInput>({
    resolver: zodResolver(CreateMatchSchema),
    defaultValues: {
      type: 'SELF',
      title: '',
      location: '',
      startAt: '',
      endAt: '',
      voteDeadline: '',
      ...defaultValues,
    },
  });

  const matchType = watch('type');
  const startAt = watch('startAt');

  const openPicker = (field: DateField, currentIso: string) => {
    const current = currentIso ? new Date(currentIso) : new Date();
    const minimumDate = field !== 'startAt' && startAt ? new Date(startAt) : undefined;

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: current,
        mode: 'date',
        minimumDate,
        onChange: (_e, selectedDate) => {
          if (!selectedDate) return;
          // 날짜 선택 후 바로 시간 선택 다이얼로그를 연다
          DateTimePickerAndroid.open({
            value: selectedDate,
            mode: 'time',
            is24Hour: true,
            minimumDate,
            onChange: (_e2, finalDate) => {
              if (finalDate) {
                setValue(field, finalDate.toISOString(), { shouldValidate: true });
              }
            },
          });
        },
      });
      return;
    }

    // iOS: Modal spinner
    setTempDate(current);
    setActiveField(field);
  };

  const handleIOSChange = (d: Date) => setTempDate(d);

  const handleIOSDone = () => {
    if (activeField) {
      setValue(activeField, tempDate.toISOString(), { shouldValidate: true });
    }
    setActiveField(null);
  };

  return (
    <ScreenLayout
      bottomSlot={
        <BottomCTASingle
          safeArea
          label={submitLabel}
          onClick={handleSubmit(onSubmit)}
          loading={isSubmitting}
        />
      }
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formHeader}>
          <TextBox variant="heading3" color={colors.grey900}>
            {submitLabel}
          </TextBox>
          <TouchableOpacity onPress={onCancel} hitSlop={8}>
            <TextBox variant="body2" color={colors.grey500}>
              취소
            </TextBox>
          </TouchableOpacity>
        </View>
        {headerAction ? (
          <>
            <Spacing size={3} />
            {headerAction}
          </>
        ) : null}
        <Spacing size={4} />

        {/* 경기 유형 */}
        <Controller
          control={control}
          name="type"
          render={({ field: { value, onChange } }) => (
            <Select
              label="경기 유형"
              options={TYPE_OPTIONS}
              value={value}
              onChange={(v) => onChange(v as 'SELF' | 'LEAGUE')}
              errorMessage={errors.type?.message}
            />
          )}
        />
        <Spacing size={3} />

        {/* 제목 */}
        <Controller
          control={control}
          name="title"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextField
              title="경기 제목"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="경기 제목을 입력해주세요"
              maxLength={100}
              errorMessage={errors.title?.message}
            />
          )}
        />
        <Spacing size={3} />

        {/* 상대팀 (매칭전) */}
        {matchType === 'LEAGUE' ? (
          <>
            <Controller
              control={control}
              name="opponentName"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextField
                  title="상대팀 이름"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="상대팀 이름을 입력해주세요"
                  maxLength={50}
                  errorMessage={errors.opponentName?.message}
                />
              )}
            />
            <Spacing size={3} />
            <Controller
              control={control}
              name="opponentLevel"
              render={({ field: { value, onChange } }) => (
                <Select
                  label="상대팀 수준 (선택)"
                  options={LEVEL_OPTIONS}
                  value={value ?? ''}
                  onChange={(v) =>
                    onChange(v ? (v as 'BEGINNER' | 'AMATEUR' | 'SEMI_PRO' | 'PRO') : undefined)
                  }
                  errorMessage={errors.opponentLevel?.message}
                />
              )}
            />
            <Spacing size={3} />
          </>
        ) : null}

        {/* 경기 장소 */}
        <Controller
          control={control}
          name="location"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextField
              title="경기 장소"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="경기 장소를 입력해주세요"
              maxLength={100}
              errorMessage={errors.location?.message}
            />
          )}
        />
        <Spacing size={3} />

        <Controller
          control={control}
          name="address"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextField
              title="상세 주소 (선택)"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="상세 주소 (선택)"
              maxLength={200}
            />
          )}
        />
        <Spacing size={3} />

        {/* 날짜·시간 필드 (DateTimePicker) */}
        {(['startAt', 'endAt', 'voteDeadline'] as DateField[]).map((field) => {
          const iso = watch(field) ?? '';
          const error = errors[field]?.message;
          return (
            <React.Fragment key={field}>
              <DatePickerField
                label={DATE_FIELD_LABEL[field]}
                value={iso}
                error={error}
                onPress={() => openPicker(field, iso)}
              />
              <Spacing size={3} />
            </React.Fragment>
          );
        })}

        <Spacing size={16} />
      </ScrollView>

      {/* iOS: Modal spinner picker */}
      {showIOSPicker && (
        <IOSPickerModal
          visible
          label={DATE_FIELD_LABEL[activeField]}
          date={tempDate}
          minimumDate={activeField !== 'startAt' && startAt ? new Date(startAt) : undefined}
          onChange={handleIOSChange}
          onDone={handleIOSDone}
        />
      )}
    </ScreenLayout>
  );
}

// ─── DatePickerField ──────────────────────────────────────────────────────────

function DatePickerField({
  label,
  value,
  error,
  onPress,
}: {
  label: string;
  value: string;
  error?: string;
  onPress: () => void;
}) {
  const isEmpty = !value;
  return (
    <View>
      <TextBox variant="body2Bold" color={colors.grey700}>
        {label}
      </TextBox>
      <Spacing size={1} />
      <TouchableOpacity
        style={[styles.dateField, error ? styles.dateFieldError : null]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <TextBox variant="body2" color={isEmpty ? colors.grey400 : colors.grey900}>
          {isEmpty ? '날짜를 선택해주세요' : formatDateDisplay(value)}
        </TextBox>
        <TextBox variant="body2" color={colors.grey400}>
          ▼
        </TextBox>
      </TouchableOpacity>
      {error ? (
        <TextBox variant="caption" color={colors.error} style={styles.errorText}>
          {error}
        </TextBox>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[4],
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: spacing[3],
    borderWidth: 1,
    borderColor: colors.grey200,
    borderRadius: 10,
    backgroundColor: colors.background,
  },
  dateFieldError: {
    borderColor: colors.error,
  },
  errorText: {
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: spacing[6],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  iosPicker: {
    height: 200,
  },
});
