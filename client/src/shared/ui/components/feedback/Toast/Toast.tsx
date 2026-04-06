import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@ui/foundation/colors';
import TextBox from '@ui/components/general/TextBox';
import type { ToastItem, ToastType } from './Toast.types';

const toastColors: Record<ToastType, string> = {
  success: colors.success,
  error: colors.error,
  warning: colors.warning,
  info: colors.blue500,
};

type ToastContainerProps = {
  toasts: ToastItem[];
};

export function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {toasts.map((toast) => (
        <View key={toast.id} style={styles.toast}>
          <View style={[styles.dot, { backgroundColor: toastColors[toast.type] }]} />
          <TextBox variant="body2Bold" color="#ffffff" style={styles.messageFlex}>{toast.message}</TextBox>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    gap: 8,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.grey900,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  messageFlex: { flex: 1 },
});
