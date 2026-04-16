import React, { useState } from 'react';
import { Platform, Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import TextBox from '../TextBox';
import { Spacing } from '../../layout/Spacing';
import { colors } from '../../../foundation/colors';
import { spacing } from '../../../foundation/spacing';

interface TimeInputFieldProps {
  label: string;
  value: string; // 'HH:mm'
  onChange: (v: string) => void;
  error?: string;
}

export function TimeInputField({ label, value, onChange, error }: TimeInputFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const getTimeAsDate = () => {
    const [h, m] = value ? value.split(':').map(Number) : [0, 0];
    const d = new Date();
    d.setHours(h ?? 0, m ?? 0, 0, 0);
    return d;
  };

  const toTimeString = (d: Date) => {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const handlePress = () => {
    const timeDate = getTimeAsDate();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: timeDate,
        mode: 'time',
        is24Hour: true,
        onChange: (_, selected) => {
          if (selected) onChange(toTimeString(selected));
        },
      });
    } else {
      setTempDate(timeDate);
      setShowPicker(true);
    }
  };

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
          {value || '시간을 선택해주세요'}
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
                    onChange(toTimeString(tempDate));
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
                mode="time"
                display="spinner"
                locale="ko-KR"
                is24Hour
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
