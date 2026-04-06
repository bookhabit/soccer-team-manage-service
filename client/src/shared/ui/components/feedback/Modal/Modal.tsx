import React from 'react';
import {
  View,
  TouchableOpacity,
  Modal as RNModal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '@ui/foundation/colors';
import { CloseIcon } from '@ui/icons';
import TextBox from '@ui/components/general/TextBox';
import type { ModalProps } from './Modal.types';

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const hasTitle = title !== undefined;

  return (
    <RNModal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.modal} activeOpacity={1} onPress={() => {}}>
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
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modal: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: colors.background,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey100,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  body: { padding: 20 },
});
