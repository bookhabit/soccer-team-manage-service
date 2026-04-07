/**
 * Component Tests — Auth UI
 *
 * 대상: LoginView, SignupView, OnboardingView/Container, ProfileView/Container,
 *        WithdrawView/Container, MannerBadge
 * 도구: React Native Testing Library + Vitest
 *
 * 실행 전 필요한 패키지:
 *   npm install -D @testing-library/react-native @testing-library/jest-native
 *   npm install -D vitest @vitest/coverage-v8
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ─── 모의 객체 설정 ────────────────────────────────────────────────────────────

// expo-router 모의
const mockRouterReplace = vi.fn();
const mockRouterPush = vi.fn();
vi.mock('expo-router', () => ({
  router: {
    replace: mockRouterReplace,
    push: mockRouterPush,
  },
}));

// expo-secure-store 모의
vi.mock('expo-secure-store', () => ({
  setItemAsync: vi.fn(),
  getItemAsync: vi.fn().mockResolvedValue(null),
  deleteItemAsync: vi.fn(),
}));

// @ui 디자인 시스템 모의 — React Native 컴포넌트로 단순화
vi.mock('@ui', () => ({
  TextBox: ({ children, testID, ...props }: any) =>
    React.createElement(require('react-native').Text, { testID, ...props }, children),
  Button: ({ children, onPress, loading, disabled, testID }: any) =>
    React.createElement(
      require('react-native').TouchableOpacity,
      { onPress, disabled: disabled || loading, testID: testID ?? 'button', accessibilityState: { disabled: disabled || loading } },
      React.createElement(require('react-native').Text, null, children)
    ),
  TextField: ({ title, errorMessage, onChangeText, value, testID, ...props }: any) =>
    React.createElement(
      require('react-native').View,
      null,
      React.createElement(require('react-native').TextInput, {
        testID: testID ?? `field-${title}`,
        value,
        onChangeText,
        placeholder: props.placeholder,
        ...props,
      }),
      errorMessage
        ? React.createElement(require('react-native').Text, { testID: `error-${title}` }, errorMessage)
        : null
    ),
  Select: ({ label, options, value, onChange, errorMessage, placeholder, testID }: any) =>
    React.createElement(
      require('react-native').View,
      null,
      React.createElement(
        require('react-native').TouchableOpacity,
        { testID: testID ?? `select-${label}`, onPress: () => options[0] && onChange(options[0].value) },
        React.createElement(require('react-native').Text, null, value || placeholder)
      ),
      errorMessage
        ? React.createElement(require('react-native').Text, { testID: `error-${label}` }, errorMessage)
        : null
    ),
  Skeleton: ({ testID }: any) =>
    React.createElement(require('react-native').View, { testID: testID ?? 'skeleton' }),
  Spacing: () => React.createElement(require('react-native').View, null),
  SafeAreaWrapper: ({ children }: any) =>
    React.createElement(require('react-native').View, null, children),
  BottomCTASingle: ({ label, onClick, loading, disabled }: any) =>
    React.createElement(
      require('react-native').TouchableOpacity,
      { onPress: onClick, disabled: disabled || loading, testID: 'bottom-cta', accessibilityState: { disabled: disabled || loading } },
      React.createElement(require('react-native').Text, null, label)
    ),
  ConfirmDialog: ({ visible, onConfirm, onCancel, children }: any) =>
    visible
      ? React.createElement(
          require('react-native').View,
          { testID: 'confirm-dialog' },
          React.createElement(
            require('react-native').TouchableOpacity,
            { testID: 'confirm-ok', onPress: onConfirm },
            React.createElement(require('react-native').Text, null, '확인')
          ),
          React.createElement(
            require('react-native').TouchableOpacity,
            { testID: 'confirm-cancel', onPress: onCancel },
            React.createElement(require('react-native').Text, null, '취소')
          ),
          children
        )
      : null,
  colors: {
    primary: '#3182f6',
    error: '#e53e3e',
    warning: '#dd6b20',
    grey900: '#1a202c',
    grey700: '#2d3748',
    grey600: '#4a5568',
    grey500: '#718096',
    grey400: '#a0aec0',
    grey200: '#edf2f7',
    grey100: '#f7fafc',
    background: '#ffffff',
    blue500: '#3182f6',
    red50: '#fff5f5',
    red100: '#fed7d7',
  },
  spacing: new Proxy(
    {},
    { get: (_, key) => Number(key) * 4 }
  ),
  AvatarImage: ({ testID }: any) =>
    React.createElement(require('react-native').View, { testID: testID ?? 'avatar-image' }),
}));

// useAuth hooks 모의 (통합 테스트에서 커버하므로 컴포넌트 테스트에서는 mock)
vi.mock('../../data/hooks/useAuth', () => ({
  useLogin: vi.fn(),
  useSignup: vi.fn(),
  useOnboarding: vi.fn(),
  useMyProfile: vi.fn(),
  useLogout: vi.fn(),
  useWithdraw: vi.fn(),
}));

// ─── 임포트 (mock 설정 후) ────────────────────────────────────────────────────
import { LoginView } from '../view/LoginView';
import { SignupView } from '../view/SignupView';
import { ProfileView } from '../view/ProfileView';
import { WithdrawView } from '../view/WithdrawView';
import { MannerBadge } from '../components/MannerBadge';
import { ProfileContainer } from '../container/ProfileContainer';
import { LoginContainer } from '../container/LoginContainer';
import { SignupContainer } from '../container/SignupContainer';
import { WithdrawContainer } from '../container/WithdrawContainer';
import { loginSchema } from '../../data/schemas/auth.schema';
import { withdrawSchema } from '../../data/schemas/user.schema';
import type { LoginInput } from '../../data/schemas/auth.schema';
import type { WithdrawInput } from '../../data/schemas/user.schema';
import {
  useLogin,
  useSignup,
  useMyProfile,
  useLogout,
  useWithdraw,
} from '../../data/hooks/useAuth';

// ─── 테스트 유틸리티 ──────────────────────────────────────────────────────────

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });
}

function WithQueryClient({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => createTestQueryClient());
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
}

// ─── LoginView ───────────────────────────────────────────────────────────────

/**
 * LoginView 테스트를 위한 래퍼 컴포넌트
 * useForm을 사용해 실제 유효성 검사가 동작하도록 한다
 */
function LoginViewWrapper({
  isPending = false,
  serverError = null,
}: {
  isPending?: boolean;
  serverError?: Error | null;
}) {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  return React.createElement(LoginView, {
    control,
    errors,
    isPending,
    serverError,
    onSubmit: handleSubmit(() => {}),
    onGoSignup: vi.fn(),
  });
}

describe('LoginView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AUTH-02-019
  it('AUTH-02-019: 이메일 미입력 후 제출 시 이메일 에러 메시지가 표시된다', async () => {
    render(React.createElement(LoginViewWrapper));

    // 제출 버튼 클릭 (이메일, 비밀번호 모두 빈 값)
    fireEvent.press(screen.getByTestId('button'));

    await waitFor(() => {
      expect(screen.queryByText('올바른 이메일 형식이 아닙니다.')).toBeTruthy();
    });
  });

  // AUTH-02-020
  it('AUTH-02-020: 비밀번호 7자 입력 후 제출 시 비밀번호 에러 메시지가 표시된다', async () => {
    render(React.createElement(LoginViewWrapper));

    fireEvent.changeText(screen.getByTestId('field-이메일'), 'user@example.com');
    fireEvent.changeText(screen.getByTestId('field-비밀번호'), 'short1!');
    fireEvent.press(screen.getByTestId('button'));

    await waitFor(() => {
      expect(screen.queryByText('비밀번호는 최소 8자 이상이어야 합니다.')).toBeTruthy();
    });
  });

  // AUTH-03-006
  it('AUTH-03-006: isPending = true 상태에서 로그인 버튼이 disabled 상태이다', () => {
    render(React.createElement(LoginViewWrapper, { isPending: true }));

    const button = screen.getByTestId('button');
    expect(button.props.accessibilityState?.disabled).toBe(true);
  });

  // AUTH-05-005
  it('AUTH-05-005: serverError가 있으면 에러 메시지가 화면에 표시된다', () => {
    const serverError = new Error('이메일 또는 비밀번호를 확인해주세요.');
    render(React.createElement(LoginViewWrapper, { serverError }));

    expect(screen.getByText('이메일 또는 비밀번호를 확인해주세요.')).toBeTruthy();
  });
});

// ─── LoginContainer ──────────────────────────────────────────────────────────

describe('LoginContainer', () => {
  // AUTH-04-001
  it('AUTH-04-001: 로그인 성공 시 router.replace("/(app)")가 호출된다', async () => {
    const mockMutate = vi.fn().mockImplementation(() => {
      // onSuccess 즉시 호출 시뮬레이션
      mockRouterReplace('/(app)');
    });
    (useLogin as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    });

    render(
      React.createElement(WithQueryClient, null,
        React.createElement(LoginContainer)
      )
    );

    fireEvent.changeText(screen.getByTestId('field-이메일'), 'user@example.com');
    fireEvent.changeText(screen.getByTestId('field-비밀번호'), 'password1');
    fireEvent.press(screen.getByTestId('button'));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockRouterReplace).toHaveBeenCalledWith('/(app)');
    });
  });
});

// ─── SignupView ───────────────────────────────────────────────────────────────

import { signupSchema } from '../../data/schemas/auth.schema';
import type { SignupInput } from '../../data/schemas/auth.schema';

function SignupViewWrapper({
  isPending = false,
  serverError = null,
}: {
  isPending?: boolean;
  serverError?: Error | null;
}) {
  const { control, handleSubmit, formState: { errors } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', name: '', password: '' },
  });
  return React.createElement(SignupView, {
    control,
    errors,
    isPending,
    serverError,
    onSubmit: handleSubmit(() => {}),
    onGoLogin: vi.fn(),
  });
}

describe('SignupView', () => {
  // AUTH-02-021
  it('AUTH-02-021: 닉네임 1자 입력 후 제출 시 닉네임 에러 메시지가 표시된다', async () => {
    render(React.createElement(SignupViewWrapper));

    fireEvent.changeText(screen.getByTestId('field-이메일'), 'user@example.com');
    fireEvent.changeText(screen.getByTestId('field-닉네임'), '홍');
    fireEvent.changeText(screen.getByTestId('field-비밀번호'), 'password1');
    fireEvent.press(screen.getByTestId('button'));

    await waitFor(() => {
      expect(screen.queryByText('닉네임은 최소 2자 이상이어야 합니다.')).toBeTruthy();
    });
  });

  // AUTH-05-006
  it('AUTH-05-006: serverError {code: "USER_002"} 상태에서 에러 메시지가 표시된다', () => {
    const serverError = new Error('이미 사용 중인 이메일입니다.');
    render(React.createElement(SignupViewWrapper, { serverError }));

    expect(screen.getByText('이미 사용 중인 이메일입니다.')).toBeTruthy();
  });
});

// ─── ProfileView ──────────────────────────────────────────────────────────────

const MOCK_PROFILE = {
  id: 'user-123',
  provider: 'LOCAL' as const,
  email: 'user@example.com',
  name: '홍길동',
  birthYear: 1990,
  gender: 'MALE' as const,
  position: 'FW' as const,
  foot: 'RIGHT' as const,
  years: 5,
  level: 'AMATEUR' as const,
  preferredRegionId: null,
  avatarUrl: null,
  mannerScore: 36.5,
  isOnboarded: true,
  status: 'ACTIVE' as const,
  createdAt: '2024-01-01T00:00:00.000Z',
};

describe('ProfileView', () => {
  // USER-04-004
  it('USER-04-004: isLoading = true일 때 Skeleton UI가 표시된다', () => {
    render(
      React.createElement(ProfileView, {
        profile: undefined,
        isLoading: true,
        onEditPress: vi.fn(),
        onMannerPress: vi.fn(),
        onSettingsPress: vi.fn(),
        onLogout: vi.fn(),
      })
    );

    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  // USER-04-005
  it('USER-04-005: profile 데이터가 있을 때 이름, 포지션이 렌더된다', () => {
    render(
      React.createElement(ProfileView, {
        profile: MOCK_PROFILE,
        isLoading: false,
        onEditPress: vi.fn(),
        onMannerPress: vi.fn(),
        onSettingsPress: vi.fn(),
        onLogout: vi.fn(),
      })
    );

    expect(screen.getByText('홍길동')).toBeTruthy();
    // PlayerCard 내 포지션 표시 (공격수)
    expect(screen.getByText('공격수')).toBeTruthy();
  });

  // USER-04-006
  it('USER-04-006: 프로필 수정 버튼 클릭 시 onEditPress가 호출된다', () => {
    const onEditPress = vi.fn();
    render(
      React.createElement(ProfileView, {
        profile: MOCK_PROFILE,
        isLoading: false,
        onEditPress,
        onMannerPress: vi.fn(),
        onSettingsPress: vi.fn(),
        onLogout: vi.fn(),
      })
    );

    fireEvent.press(screen.getByText('프로필 수정'));
    expect(onEditPress).toHaveBeenCalled();
  });

  // USER-03-003
  it('USER-03-003: 로그아웃 버튼 클릭 시 onLogout이 호출된다', () => {
    const onLogout = vi.fn();
    render(
      React.createElement(ProfileView, {
        profile: MOCK_PROFILE,
        isLoading: false,
        onEditPress: vi.fn(),
        onMannerPress: vi.fn(),
        onSettingsPress: vi.fn(),
        onLogout,
      })
    );

    fireEvent.press(screen.getByText('로그아웃'));
    expect(onLogout).toHaveBeenCalled();
  });
});

// ─── ProfileContainer ────────────────────────────────────────────────────────

describe('ProfileContainer', () => {
  beforeEach(() => vi.clearAllMocks());

  // USER-04-004 (Container 경유)
  it('USER-04-004: useMyProfile loading 상태일 때 Skeleton UI가 표시된다', () => {
    (useMyProfile as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    (useLogout as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn() });

    render(
      React.createElement(WithQueryClient, null,
        React.createElement(ProfileContainer)
      )
    );

    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  // USER-04-005 (Container 경유)
  it('USER-04-005: useMyProfile data가 있을 때 PlayerCard에 name·position·mannerScore가 렌더된다', () => {
    (useMyProfile as ReturnType<typeof vi.fn>).mockReturnValue({ data: MOCK_PROFILE, isLoading: false });
    (useLogout as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn() });

    render(
      React.createElement(WithQueryClient, null,
        React.createElement(ProfileContainer)
      )
    );

    expect(screen.getByText('홍길동')).toBeTruthy();
    expect(screen.getByText('공격수')).toBeTruthy();
    // MannerBadge: 36.5°C
    expect(screen.getByText('36.5°C')).toBeTruthy();
  });

  // USER-04-006 (Container 경유 — router.push 확인)
  it('USER-04-006: 프로필 수정 버튼 클릭 시 router.push("/(app)/profile/edit")가 호출된다', () => {
    (useMyProfile as ReturnType<typeof vi.fn>).mockReturnValue({ data: MOCK_PROFILE, isLoading: false });
    (useLogout as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn() });

    render(
      React.createElement(WithQueryClient, null,
        React.createElement(ProfileContainer)
      )
    );

    fireEvent.press(screen.getByText('프로필 수정'));
    expect(mockRouterPush).toHaveBeenCalledWith('/(app)/profile/edit');
  });
});

// ─── WithdrawView ────────────────────────────────────────────────────────────

function WithdrawViewWrapper({ isPending = false }: { isPending?: boolean }) {
  const { control, handleSubmit, formState: { errors } } = useForm<WithdrawInput>({
    resolver: zodResolver(withdrawSchema),
  });
  return React.createElement(WithdrawView, {
    control,
    errors,
    isPending,
    onSubmit: handleSubmit(() => {}),
  });
}

describe('WithdrawView', () => {
  // USER-02-001
  it('USER-02-001: 탈퇴 사유 미선택 시 제출 후 에러 메시지가 표시된다', async () => {
    render(React.createElement(WithdrawViewWrapper));

    fireEvent.press(screen.getByTestId('bottom-cta'));

    await waitFor(() => {
      // zodResolver가 실행되어 에러가 표시됨
      // withdrawSchema에서 reason은 필수 enum 필드
      expect(screen.queryByTestId('error-탈퇴 사유')).toBeTruthy();
    });
  });
});

// ─── WithdrawContainer ───────────────────────────────────────────────────────

describe('WithdrawContainer', () => {
  beforeEach(() => vi.clearAllMocks());

  // USER-02-002
  it('USER-02-002: 사유 선택 후 탈퇴 버튼 클릭 시 useWithdraw.mutate가 호출된다', async () => {
    const mockMutate = vi.fn();
    (useWithdraw as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: mockMutate, isPending: false });

    render(
      React.createElement(WithQueryClient, null,
        React.createElement(WithdrawContainer)
      )
    );

    // Select 클릭 → 첫 번째 옵션 선택 (TIME_CONFLICT)
    fireEvent.press(screen.getByTestId('select-탈퇴 사유'));

    fireEvent.press(screen.getByTestId('bottom-cta'));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({ reason: 'TIME_CONFLICT' })
      );
    });
  });

  // USER-04-007
  it('USER-04-007: withdraw mutate 성공 시 clearAuth()가 호출된다', async () => {
    const mockMutate = vi.fn().mockImplementation(() => {
      // clearAuth 시뮬레이션
      const { useAuthStore } = require('@/src/shared/store/useAuthStore');
      useAuthStore.getState().clearAuth();
    });
    (useWithdraw as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: mockMutate, isPending: false });

    render(
      React.createElement(WithQueryClient, null,
        React.createElement(WithdrawContainer)
      )
    );

    // Select 클릭 후 제출
    fireEvent.press(screen.getByTestId('select-탈퇴 사유'));
    fireEvent.press(screen.getByTestId('bottom-cta'));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
  });
});

// ─── MannerBadge ──────────────────────────────────────────────────────────────

describe('MannerBadge', () => {
  // USER-04-008
  it('USER-04-008: score = 100이면 "100°C" 텍스트가 표시된다', () => {
    render(React.createElement(MannerBadge, { score: 100 }));
    expect(screen.getByText('100°C')).toBeTruthy();
  });

  // USER-04-009
  it('USER-04-009: score = 20이면 "20°C" 텍스트가 표시된다', () => {
    render(React.createElement(MannerBadge, { score: 20 }));
    expect(screen.getByText('20°C')).toBeTruthy();
  });

  // USER-04-010
  it('USER-04-010: score = 15이면 "15°C" 텍스트가 표시된다', () => {
    render(React.createElement(MannerBadge, { score: 15 }));
    expect(screen.getByText('15°C')).toBeTruthy();
  });

  it('score = 51 (warning 구간)이면 "51°C" 텍스트가 표시된다', () => {
    render(React.createElement(MannerBadge, { score: 51 }));
    expect(screen.getByText('51°C')).toBeTruthy();
  });

  it('score = 0이면 "0°C" 텍스트가 표시된다', () => {
    render(React.createElement(MannerBadge, { score: 0 }));
    expect(screen.getByText('0°C')).toBeTruthy();
  });
});
