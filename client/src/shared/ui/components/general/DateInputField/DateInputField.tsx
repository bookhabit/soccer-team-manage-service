import React, { useState } from 'react';
import { Platform, Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import TextBox from '../TextBox';
import { Spacing } from '../../layout/Spacing';
import { colors } from '../../../foundation/colors';
import { spacing } from '../../../foundation/spacing';

interface DateInputFieldProps {
  label: string;
  value: string; // 'YYYY-MM-DD'
  onChange: (v: string) => void;
  error?: string;
  minimumDate?: Date;
}

export function DateInputField({ label, value, onChange, error, minimumDate }: DateInputFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const currentDate = value ? new Date(`${value}T00:00:00`) : new Date();

  const toDateString = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handlePress = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: currentDate,
        mode: 'date',
        minimumDate,
        onChange: (_, selected) => {
          if (selected) onChange(toDateString(selected));
        },
      });
    } else {
      setTempDate(currentDate);
      setShowPicker(true);
    }
  };

  const displayText = value
    ? new Date(`${value}T00:00:00`).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      })
    : '날짜를 선택해주세요';

  return (
    <View>
      <TextBox variant="body2Bold" color={colors.grey700}>
        {label}
      </TextBox>
      <Spacing size={1} />
      <TouchableOpacity
        style={[styles.field, error ? styles.fieldError : null]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <TextBox variant="body2" color={value ? colors.grey900 : colors.grey400}>
          {displayText}
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

      {Platform.OS === 'ios' && (
        <Modal transparent visible={showPicker} animationType="slide">
          <View style={styles.overlay}>
            <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <TextBox variant="body2Bold" color={colors.grey900}>
                  {label}
                </TextBox>
                <TouchableOpacity
                  onPress={() => {
                    onChange(toDateString(tempDate));
                    setShowPicker(false);
                  }}
                >
                  <TextBox variant="body2Bold" color={colors.blue500}>
                    완료
                  </TextBox>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                locale="ko-KR"
                minimumDate={minimumDate}
                onChange={(_, selected) => {
                  if (selected) setTempDate(selected);
                }}
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
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
  fieldError: {
    borderColor: colors.error,
  },
  errorText: {
    marginTop: 4,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 40,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  picker: {
    height: 180,
  },
});
