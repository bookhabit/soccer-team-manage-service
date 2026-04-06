# @performance — Performance Agent

기능명: **$ARGUMENTS**

## 참조 문서 (반드시 읽을 것)
- `docs/client-docs/guides/performance_guide.md` — 최적화 기법 및 모니터링 방법

## 역할
`client/src/features/$ARGUMENTS/` 를 읽고 **측정 가능한 성능 문제**를 찾아 수정한다.
추측으로 최적화하지 않는다 — 실제 문제가 있는 코드만 수정한다.

---

## 점검 항목

### 1. 불필요한 리렌더링
- [ ] props/state가 바뀌지 않는데 리렌더되는 컴포넌트에 `React.memo` 적용
- [ ] 렌더 함수 내부에서 새 객체/함수를 생성하는 콜백 → `useCallback` / `useMemo`
- [ ] Context value가 매 렌더링마다 새 객체로 생성되는가?

### 2. 리스트 렌더링
- [ ] 10개 이상 아이템을 `ScrollView`로 렌더링 → `FlatList` 또는 `FlashList`로 전환
- [ ] `FlashList` 사용 시 `estimatedItemSize` 설정 여부
- [ ] `keyExtractor`가 index 기반인가? → 고유 ID 사용으로 변경

### 3. TanStack Query 캐싱
- [ ] 자주 바뀌지 않는 데이터에 `staleTime` 설정이 없는가?
- [ ] 탭 전환 시 화면 깜빡임 → `placeholderData: keepPreviousData` 적용
- [ ] 다음 화면 데이터 prefetch 가능한 지점이 있는가?

### 4. 이미지
- [ ] `<Image>` 직접 사용 → `<DfImage>` / `<ThumbnailImage>` 등으로 교체 (캐싱 포함)
- [ ] 고해상도 이미지를 원본 크기 그대로 렌더링하는가?

### 5. 실시간 데이터
- [ ] 폴링/소켓 업데이트가 너무 잦은가? → throttle 적용

---

## 출력
발견된 문제 항목, 적용한 최적화 기법, 수정 전/후 코드를 나열한다.
문제가 없는 항목은 "✅ 이상 없음"으로 표시한다.
