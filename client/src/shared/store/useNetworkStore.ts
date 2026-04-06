import { create } from 'zustand';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  isOffline: boolean;
}

export const useNetworkStore = create<NetworkState>()(() => ({
  isConnected: true,
  isInternetReachable: null,
  isOffline: false,
}));

export function initNetworkListener() {
  return NetInfo.addEventListener((state: NetInfoState) => {
    const connected = state.isConnected ?? false;
    const reachable = state.isInternetReachable;
    const offline = !connected || reachable === false;

    useNetworkStore.setState((prev) => {
      // 값이 변하지 않으면 업데이트하지 않음 (불필요한 리렌더링 방지)
      if (
        prev.isConnected === connected &&
        prev.isInternetReachable === reachable &&
        prev.isOffline === offline
      ) {
        return prev;
      }
      return { isConnected: connected, isInternetReachable: reachable, isOffline: offline };
    });

    // React Query onlineManager 연동 — 오프라인 시 쿼리 자동 중단
    onlineManager.setOnline(!offline);
  });
}
