import * as Device from "expo-device";
import { Platform } from "react-native";

// 환경별 API Base URL 결정 우선순위:
// 1. 실제 기기 → app.json extra.apiBaseUrl 또는 EXPO_PUBLIC_API_BASE_URL (실제 서버 IP 명시 필요)
// 2. Android 에뮬레이터 → 10.0.2.2 (에뮬레이터에서 호스트 머신을 가리키는 특수 IP)
// 3. iOS 시뮬레이터 → localhost

function resolveApiBaseUrl(): string {
  // 1. 실제 기기인지 확인 (Device.isDevice 사용)
  const isRealDevice = Device.isDevice;
  console.log("isRealDevice:", isRealDevice);

  if (isRealDevice) {
    // 실제 기기일 때 IP 설정 (같은 Wi-Fi 환경의 PC IP)
    return process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  }

  // 2. 에뮬레이터/시뮬레이터 판단
  if (Platform.OS === "android") {
    return "http://10.0.2.2:4000";
  }

  return "http://localhost:4000";
}

export const API_BASE_URL = resolveApiBaseUrl();
