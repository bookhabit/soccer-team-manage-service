import React from 'react';
import {
  View,
  TouchableOpacity,
  Modal as RNModal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { colors } from '@ui/foundation/colors';

import type { DrawerProps } from './Drawer.types';
import { CloseIcon } from '@ui/icons';
import TextBox from '@ui/components/general/TextBox';

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  const hasTitle = title !== undefined;

  return (
    <RNModal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>
        {hasTitle && (
          <View style={styles.header}>
            <TextBox variant="heading3" color={colors.grey900}>{title}</TextBox>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <CloseIcon size={18} color={colors.grey500} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        )}
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 32,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.grey200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  body: { paddingHorizontal: 20 },
});
