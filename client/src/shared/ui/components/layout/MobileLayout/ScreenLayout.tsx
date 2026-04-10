import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';
import { colors } from '../../../foundation';

interface ScreenLayoutProps {
  children: ReactNode;
  /** 상단 Safe Area 안에 고정할 콘텐츠 (진행 바 등) */
  topSlot?: ReactNode;
  /** 하단 Safe Area와 함께 고정할 콘텐츠 (CTA 버튼 등) */
  bottomSlot?: ReactNode;
  backgroundColor?: string;
}

/**
 * 화면 전체를 감싸는 레이아웃 컴포넌트. Safe Area를 자동으로 처리한다.
 *
 * - 슬롯 없음: top + bottom Safe Area를 모두 적용한 전체 wrap
 * - `bottomSlot`: 상단 Safe Area 여백 + 콘텐츠 + 하단 CTA 영역 (패턴 B)
 * - `topSlot`: 상단 Safe Area 안에 고정 콘텐츠 + 본문 (패턴 C)
 */
export function ScreenLayout({
  children,
  topSlot,
  bottomSlot,
  backgroundColor = colors.background,
}: ScreenLayoutProps) {
  const hasSlots = topSlot !== undefined || bottomSlot !== undefined;

  if (!hasSlots) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        {children}
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* 상단 Safe Area: topSlot이 없어도 safe area 여백은 항상 확보 */}
      <SafeAreaView edges={['top']} style={{ backgroundColor }}>
        {topSlot}
      </SafeAreaView>

      <View style={styles.content}>{children}</View>

      {bottomSlot !== undefined && (
        <SafeAreaView edges={['bottom']} style={{ backgroundColor }}>
          {bottomSlot}
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
