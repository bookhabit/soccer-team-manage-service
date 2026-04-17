import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { TextBox, colors, spacing } from '@ui';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function toLocalDateStr(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function buildCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

interface Props {
  value: string[];
  onChange: (dates: string[]) => void;
}

export function DateMultiPicker({ value, onChange }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const cells = buildCalendarDays(year, month);
  const selectedSet = new Set(value);
  const todayStr = toLocalDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  const hasSelectedDates = value.length > 0;

  const toggle = (day: number) => {
    const dateStr = toLocalDateStr(year, month, day);
    if (selectedSet.has(dateStr)) {
      onChange(value.filter((d) => d !== dateStr));
    } else {
      onChange([...value, dateStr].sort());
    }
  };

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  return (
    <View>
      {/* 월 네비게이션 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={prevMonth} style={styles.navBtn} activeOpacity={0.7}>
          <TextBox variant="body1Bold" color={colors.grey600}>‹</TextBox>
        </TouchableOpacity>
        <TextBox variant="body1Bold" color={colors.grey900}>
          {year}년 {month + 1}월
        </TextBox>
        <TouchableOpacity onPress={nextMonth} style={styles.navBtn} activeOpacity={0.7}>
          <TextBox variant="body1Bold" color={colors.grey600}>›</TextBox>
        </TouchableOpacity>
      </View>

      {/* 요일 헤더 */}
      <View style={styles.row}>
        {DAY_LABELS.map((label, i) => (
          <View key={label} style={styles.cell}>
            <TextBox
              variant="captionBold"
              color={i === 0 ? colors.red500 : i === 6 ? colors.blue500 : colors.grey500}
            >
              {label}
            </TextBox>
          </View>
        ))}
      </View>

      {/* 날짜 그리드 */}
      {Array.from({ length: cells.length / 7 }, (_, week) => (
        <View key={week} style={styles.row}>
          {cells.slice(week * 7, week * 7 + 7).map((day, colIdx) => {
            if (!day) return <View key={colIdx} style={styles.cell} />;
            const dateStr = toLocalDateStr(year, month, day);
            const isSelected = selectedSet.has(dateStr);
            const isToday = dateStr === todayStr;
            return (
              <TouchableOpacity
                key={colIdx}
                style={[styles.cell, isSelected && styles.cellSelected, isToday && !isSelected && styles.cellToday]}
                onPress={() => toggle(day)}
                activeOpacity={0.7}
              >
                <TextBox
                  variant="body2"
                  color={
                    isSelected
                      ? '#ffffff'
                      : isToday
                      ? colors.primary
                      : colIdx === 0
                      ? colors.red400
                      : colIdx === 6
                      ? colors.blue400
                      : colors.grey800
                  }
                >
                  {day}
                </TextBox>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* 선택된 날짜 칩 */}
      {hasSelectedDates && (
        <View style={styles.chips}>
          {value.map((d) => (
            <TouchableOpacity
              key={d}
              style={styles.chip}
              onPress={() => onChange(value.filter((x) => x !== d))}
              activeOpacity={0.7}
            >
              <TextBox variant="caption" color={colors.primary}>{d}</TextBox>
              <TextBox variant="caption" color={colors.grey400}>  ✕</TextBox>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  navBtn: {
    padding: spacing[2],
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  cellSelected: {
    backgroundColor: colors.primary,
  },
  cellToday: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.blue200,
    backgroundColor: colors.blue50,
  },
});
