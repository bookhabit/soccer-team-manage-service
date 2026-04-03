# 성능 최적화 가이드

이 문서는 **FC Flow** 앱의 부드러운 사용자 경험(60fps)을 유지하기 위한 성능 지표 분석 및 최적화 기법을 정의합니다.

---

## 1️⃣ 성능 지표 분석 도구 (Expo/Native)

- **React DevTools Profiler**: 컴포넌트별 리렌더링 횟수 및 시간 측정
- **Expo DevTools (Network 탭)**: API 요청 시간 및 데이터 크기 분석
- **Flashlight**: React Native 앱의 FPS, CPU, 메모리 사용량 측정 (Lighthouse의 네이티브 버전)
- **Flashlight Score**: 실기기에서의 사용자 경험 지표 수집

---

## 2️⃣ 주요 최적화 기법

### 1. 렌더링 최적화 (JS Thread 부담 완화)

불필요한 리렌더링은 JS 스레드 점유율을 높여 터치 반응성을 떨어뜨립니다.

```tsx
// ✅ 불필요한 리렌더 방지 (React.memo)
// 득점자 목록처럼 데이터가 빈번히 바뀌지 않는 컴포넌트에 적용
const MemoizedPlayerRow = memo(PlayerRow, (prev, next) => {
  return prev.id === next.id && prev.goals === next.goals;
});

// ✅ 콜백 및 값 안정화 (useCallback, useMemo)
const handlePress = useCallback((id: string) => {
  router.push(`/player/${id}`);
}, []);
```

#### 모니터링 방법: React DevTools Profiler

React Native 앱을 디버그 모드로 실행하고, 브라우저의 React DevTools를 연결합니다.

- **Flamegraph**: 특정 인터랙션 시 어떤 컴포넌트가 다시 그려지는지 시각적으로 확인
- **Ranked Chart**: 렌더링에 가장 오랜 시간(ms)을 쓴 컴포넌트 순서 확인
- **Why did this render?**: 컴포넌트 리렌더링 사유(예: `props.teamData` 변경) 확인

**전/후 비교 방법**:
1. **최적화 전**: 버튼 클릭 시 트리 전체가 노란색(긴 시간 소요)으로 변하는 구간 캡처
2. **최적화 후 (`memo`, `useCallback` 적용)**: 불필요한 컴포넌트가 '회색(Did not render)'으로 표시되는지 확인하고 전체 Render Time(ms) 비교

---

### 2. 리스트 최적화 (가상화)

축구팀원 목록이나 경기 기록처럼 긴 리스트는 반드시 최적화된 컴포넌트를 사용합니다.

- **FlatList / SectionList**: 화면에 보이는 부분만 렌더링
- **FlashList (Shopify)**: `FlatList`보다 성능이 뛰어난 대안으로, 메모리 사용량을 획기적으로 절감

```tsx
// ✅ FlashList 사용 예시
<FlashList
  data={matchRecords}
  renderItem={({ item }) => <MatchCard item={item} />}
  estimatedItemSize={120} // 평균 높이를 미리 제공하여 성능 향상
/>
```

#### 모니터링 방법: Flashlight (Native 전용)

실제 기기에서 리스트 스크롤 성능을 측정하는 데 가장 정확한 도구입니다.

- **FPS**: 초당 프레임이 60fps에 가깝게 유지되는지 확인 (30fps 이하면 '버벅임' 발생)
- **JS Thread Usage (%)**: 스크롤 중 JS 스레드 점유율이 100%를 치는지 확인
- **Memory Usage**: 리스트를 끝까지 내렸을 때 메모리가 계속 치솟는지 확인

**전/후 비교 방법**:
1. **최적화 전**: 대량 데이터 스크롤 시 하얀 화면(Blank)이 자주 나타나거나 FPS가 요동치는 그래프 기록
2. **최적화 후 (`FlashList` + `estimatedItemSize` 적용)**: FPS 그래프가 안정적인 일직선을 그리는지 시각적 점수(Score)로 비교

#### ScrollView vs FlatList 차이 (Expo Perf Monitor)

에뮬레이터나 실기기에서 Dev Menu(`Cmd + D` 또는 흔들기) → **"Show Perf Monitor"**

- **ScrollView**: 데이터가 1,000개라면 앱 시작 시 RAM이 크게 점프 → 화면 밖 데이터까지 한꺼번에 렌더링
- **FlatList**: 처음에 RAM이 조금만 올라가고, 스크롤할수록 실시간으로 조금씩 증가 → 필요한 시점에만 메모리에 적재

---

### 3. 실시간 데이터 인터벌 제어 (Throttle)

투표 현황이나 실시간 채팅 등 데이터 업데이트가 잦은 경우 업데이트 주기를 조절합니다.

```tsx
// ✅ 100ms 단위로 업데이트 제한 (Throttle)
const throttledAttendance = useThrottle(attendanceData, 500);
```

#### 모니터링 방법: Expo Perf Monitor

투표 인원 드래그나 포메이션 변경 시 **JS 숫자가 급격히 떨어지는지** 실시간으로 체크합니다.

---

### 4. TanStack Query 캐싱 전략

네이티브 앱은 네트워크 환경이 가변적이므로 캐싱 전략이 더욱 중요합니다.

- **staleTime**: 팀 정보나 내 프로필처럼 자주 바뀌지 않는 데이터는 길게 설정
- **placeholderData**: 탭 전환 시 이전 데이터를 보여주어 '화면 멈춤' 현상 방지

---

### 5. 번들 및 이미지 최적화

- **이미지 캐싱**: `expo-image` 라이브러리를 사용하여 고성능 이미지 렌더링 및 디스크 캐싱 구현
- **코드 스플리팅**: 모바일 앱에서는 라우트 단위 스플리팅보다 **에셋 사전 로딩(Preloading)** 전략이 더 중요

---

## 3️⃣ 병목 현상 파악 및 개선 순서

1. **지표 측정**: Flashlight 또는 React Profiler로 성능 저하 지점 특정
2. **Long Task 확인**: JS 스레드가 50ms 이상 점유되는 구간 찾기
3. **원인 분석**: 과도한 리렌더링, 대량의 데이터 렌더링, 또는 무거운 연산 확인
4. **최적화 적용**: `memo`, `FlashList`, `Throttle`, 이미지 캐싱 등 적용
5. **검증**: 개선 후 다시 측정하여 FPS 회복 여부 확인

---

## 4️⃣ 이미지 및 아이콘 최적화 (Native 특화)

- **SVG 사용**: 아이콘은 `react-native-svg`를 사용하여 크기에 상관없이 선명하게 유지하고 용량 최소화
- **이미지 사이즈 제한**: 서버에서 이미지를 가져올 때 `ResizeMode`를 활용하여 원본 크기 그대로 메모리에 올리지 않도록 주의

---

## 5️⃣ 리소스 및 번들 최적화 전략

### 1. 전략별 정의 및 적용 케이스

| **전략** | **설명** | **적용 케이스 (FC Flow 예시)** |
| --- | --- | --- |
| **지연 로딩 (Lazy Loading)** | 필요한 시점(화면에 보일 때)에 리소스를 로드 | 상세 정보 내의 무거운 이미지, 하단 스크롤 리스트 아이템 |
| **사전 로딩 (Preloading)** | 사용자가 요청하기 전에 핵심 리소스를 미리 로드 | 앱 초기 진입 시 필요한 폰트, 로고, 메인 탭 아이콘 |
| **프리페칭 (Prefetching)** | 다음 행동을 예측하여 데이터를 미리 가져와 캐싱 | 경기 목록에서 특정 경기 클릭 전, 해당 경기의 상세 데이터 |

---

### 2. 상세 최적화 방법

#### ① 지연 로딩 (Lazy Loading) — "메모리 아끼기"

화면에 보이지 않는 리소스를 미리 로드하지 않아 초기 로딩 속도와 메모리 점유율을 개선합니다.

- **리스트 가상화**: `FlatList`나 `FlashList`를 사용하여 화면 밖 아이템의 렌더링을 지연
- **이미지 지연 로딩**: `expo-image`를 사용하여 뷰포트에 들어올 때 이미지를 로드하고, 그 전에는 저해상도 플레이스홀더 표시

#### ② 사전 로딩 (Preloading) — "첫인상 속도업"

앱이 실행될 때 반드시 필요한 필수 에셋을 미리 로드하여 화이트 스크린을 방지합니다.

```tsx
// app/_layout.tsx
useEffect(() => {
  async function prepare() {
    try {
      await Font.loadAsync(customFonts); // 폰트 사전 로딩
      await Asset.loadAsync([require('@/assets/logo.png')]); // 이미지 사전 로딩
    } finally {
      setAppIsReady(true);
    }
  }
  prepare();
}, []);
```

#### ③ 프리페칭 (Prefetching) — "전환 속도 제로화"

사용자가 다음 화면으로 넘어갈 때 기다림이 없도록 백그라운드에서 데이터를 미리 캐싱합니다.

```tsx
const queryClient = useQueryClient();
const prefetchMatchDetail = (matchId: string) => {
  queryClient.prefetchQuery({
    queryKey: matchQueryKeys.detail(matchId),
    queryFn: () => matchService.getById(matchId),
    staleTime: 1000 * 60 * 5, // 5분간 유지
  });
};
```

#### ④ 코드 스플리팅 (Code Splitting)

당장 필요 없는 무거운 컴포넌트는 지연 로딩하여 초기 메인 화면 로딩 속도를 높입니다.

```tsx
// ✅ 무거운 컴포넌트 지연 로딩 예시
const HeavyChart = React.lazy(() => import('@/features/stats/components/MatchChart'));

function StatsScreen() {
  return (
    <Suspense fallback={<Skeleton />}>
      <HeavyChart />
    </Suspense>
  );
}
```

#### ⑤ 트리 쉐이킹 (Tree Shaking)

- **Lodash 대신 개별 모듈**: `import _ from 'lodash'` 대신 `import isEmpty from 'lodash/isEmpty'` 사용
- **Enum 대신 as const**: TypeScript의 `enum`은 런타임 코드를 생성하므로 `as const` 객체로 대체

#### ⑥ 에셋 최적화

- **이미지 압축**: `png` 대신 `webp` 포맷 사용, 해상도별(@2x, @3x) 최적화 이미지 제공
- **SVG 활용**: 단순한 그래픽은 비트맵 이미지 대신 SVG를 사용하여 용량 최소화
- **번들 분석**: `react-native-bundle-visualizer`로 용량이 큰 라이브러리를 특정하고 가벼운 대안(예: `moment` → `dayjs`)으로 교체

---

### 3. 최적화 결정 트리

- **앱 실행 시 즉시 필요한가?** → **Preloading** 적용
- **화면 스크롤 시 순차적으로 필요한가?** → **Lazy Loading** 적용
- **사용자가 90% 확률로 다음 클릭할 데이터인가?** → **Prefetching** 적용
- **데이터가 크고 로딩이 오래 걸리는가?** → **Skeleton UI** + **Lazy Loading** 병행

---

### 4. 모니터링 및 검증

- **네트워크 탭**: 프리페칭이 의도한 시점에 백그라운드에서 발생하는지 확인
- **번들 분석**: `react-native-bundle-visualizer`를 통해 용량이 큰 라이브러리 특정 및 최적화
- **메모리 프로파일러**: 지연 로딩 적용 전후의 메모리 적재량 차이 비교
