import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { TextBox, colors, spacing } from '@ui';

interface ContactCardProps {
  contactName: string;
  contactPhone: string;
  label?: string;
}

/**
 * 매칭 수락 후 공개되는 연락처 카드.
 */
export function ContactCard({ contactName, contactPhone, label = '담당자 연락처' }: ContactCardProps) {
  const handleCall = () => {
    Linking.openURL(`tel:${contactPhone}`);
  };

  return (
    <View style={styles.card}>
      <TextBox variant="captionBold" color={colors.grey500} style={styles.label}>{label}</TextBox>
      <View style={styles.row}>
        <View style={styles.info}>
          <TextBox variant="body1Bold" color={colors.grey900}>{contactName}</TextBox>
          <TextBox variant="body2" color={colors.grey700}>{contactPhone}</TextBox>
        </View>
        <TouchableOpacity style={styles.callBtn} onPress={handleCall} activeOpacity={0.8}>
          <TextBox variant="captionBold" color={colors.blue500}>전화</TextBox>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.blue50,
    borderRadius: 12,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.blue100,
  },
  label: {
    marginBottom: spacing[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  callBtn: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.blue300,
    backgroundColor: colors.background,
  },
});
