import React from 'react';
import { View, TouchableOpacity, Modal as RNModal, StyleSheet } from 'react-native';
import { colors } from '@ui/foundation/colors';
import { Button } from '@ui/components/general/Button';
import TextBox from '@ui/components/general/TextBox';
import type { AlertDialogProps, ConfirmDialogProps } from './Dialog.types';

export function AlertDialog({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel = '확인',
}: AlertDialogProps) {
  return (
    <RNModal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          {title !== undefined && <TextBox variant="heading3" color={colors.grey900} style={styles.titleMargin}>{title}</TextBox>}
          {description !== undefined && <TextBox variant="body2" color={colors.grey600} style={styles.description}>{description}</TextBox>}
          <View style={styles.buttons}>
            <Button variant="primary" size="medium" onPress={onClose}>
              {confirmLabel}
            </Button>
          </View>
        </View>
      </View>
    </RNModal>
  );
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  destructive = false,
}: ConfirmDialogProps) {
  const handleCancel = onCancel ?? onClose;

  return (
    <RNModal visible={isOpen} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          {title !== undefined && <TextBox variant="heading3" color={colors.grey900} style={styles.titleMargin}>{title}</TextBox>}
          {description !== undefined && <TextBox variant="body2" color={colors.grey600} style={styles.description}>{description}</TextBox>}
          <View style={styles.buttons}>
            <View style={styles.flex1}>
              <Button variant="secondary" size="medium" fullWidth onPress={handleCancel}>
                {cancelLabel}
              </Button>
            </View>
            <View style={styles.flex1}>
              <Button
                variant={destructive ? 'danger' : 'primary'}
                size="medium"
                fullWidth
                onPress={onConfirm}
              >
                {confirmLabel}
              </Button>
            </View>
          </View>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
  },
  titleMargin: { marginBottom: 8 },
  description: { marginBottom: 20, lineHeight: 22 },
  buttons: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
  flex1: { flex: 1 },
});
