import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@ui/foundation/colors';
import TextBox from '@ui/components/general/TextBox';

interface ErrorFallbackProps {
  errorMessage: string;
  onReset: () => void;
}

export default function ErrorFallback({ errorMessage, onReset }: ErrorFallbackProps) {
  return (
    <View style={styles.container}>
      <TextBox variant="body2" color={colors.error} style={styles.message}>
        오류가 발생했습니다: {errorMessage}
      </TextBox>
      <TouchableOpacity style={styles.button} onPress={onReset}>
        <TextBox variant="body2Bold" color="#fff">다시 시도</TextBox>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  message: { marginBottom: 16, textAlign: 'center' },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
});
