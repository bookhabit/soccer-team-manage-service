import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ErrorFallbackProps {
  errorMessage: string;
  onReset: () => void;
}

export default function ErrorFallback({ errorMessage, onReset }: ErrorFallbackProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>오류가 발생했습니다: {errorMessage}</Text>
      <TouchableOpacity style={styles.button} onPress={onReset}>
        <Text style={styles.buttonText}>다시 시도</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  message: { fontSize: 14, color: '#ef4444', marginBottom: 16, textAlign: 'center' },
  button: { backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24 },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
