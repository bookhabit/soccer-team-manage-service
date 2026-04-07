import React from 'react';
import { View, StyleSheet } from 'react-native';

import { Button } from '@ui/components/general/Button';
import { colors } from '@ui/foundation/colors';
import type {
  BottomCTASingleProps,
  BottomCTADoubleProps,
  FixedBottomCTAProps,
} from './BottomCTA.types';

export function BottomCTASingle({
  label,
  onClick,
  disabled = false,
  loading = false,
  safeArea = false,
}: BottomCTASingleProps) {
  return (
    <View style={[styles.wrapper, safeArea && { paddingBottom: 16 }]}>
      <Button
        variant="primary"
        size="large"
        fullWidth
        onPress={onClick}
        disabled={disabled}
        loading={loading}
      >
        {label}
      </Button>
    </View>
  );
}

export function BottomCTADouble({
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  primaryDisabled = false,
  secondaryDisabled = false,
}: BottomCTADoubleProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <View style={styles.flex1}>
          <Button
            variant="secondary"
            size="large"
            fullWidth
            onPress={onSecondary}
            disabled={secondaryDisabled}
          >
            {secondaryLabel}
          </Button>
        </View>
        <View style={styles.flex1}>
          <Button
            variant="primary"
            size="large"
            fullWidth
            onPress={onPrimary}
            disabled={primaryDisabled}
          >
            {primaryLabel}
          </Button>
        </View>
      </View>
    </View>
  );
}

export function FixedBottomCTA({ children, safeArea = false }: FixedBottomCTAProps) {
  return (
    <View style={[styles.fixedWrapper, { padding: 16 }, safeArea && { paddingBottom: 16 }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey100,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  fixedWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.grey100,
  },
});
