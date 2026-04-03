# 기능 개발 프로세스

이 문서는 **FC Flow** 프로젝트에서 새로운 기능을 추가할 때 반드시 따라야 하는 표준 개발 흐름(Flow)을 정의합니다.

---

## 1️⃣ 단계: 기획 및 설계 (Planning & Design)

코드를 작성하기 전, 기능의 명세와 예외 상황을 먼저 정의합니다.

1. **기획 확정**: 서비스 정의서(`specs/`)를 바탕으로 세부 기능 확정
2. **사용자 시나리오 및 테스트 케이스 작성**: `GIVEN-WHEN-THEN` 구조로 유저의 이동 경로와 엣지 케이스 정의
3. **화면 설계 및 디자인**: Figma를 통한 UI/UX 설계 및 컴포넌트 단위 분리
4. **개발 설계 (Technical Spec)**:
    - **DB/API 설계**: 필요한 ERD 수정 및 API 엔드포인트 정의
    - **상태 관리 설계**: Server State(Query)와 Client State(Zod/Store) 정의

---

## 2️⃣ 단계: 환경 구축 (Scaffolding)

자동화 스크립트를 사용하여 표준화된 폴더 구조를 생성합니다.

1. **Feature 폴더 생성 스크립트 실행**:

    ```bash
    npm run feature {기능이름}  # 예: npm run feature team
    ```

2. **구조 확인**: `ui/`와 `data/` 계층이 정상적으로 생성되었는지 확인합니다.

---

## 3️⃣ 단계: 기능 구현 (Implementation)

데이터 레이어부터 시작하여 UI 레이어로 올라가는 순서로 구현합니다.

### 🔹 3-1. Data Layer 구현 (`data/`)

1. **Schema 정의**: Zod를 사용하여 API 응답 및 폼 입력 검증 로직 작성
2. **Service 작성**: Axios 인스턴스를 활용한 순수 통신 함수 작성
3. **Data Hooks 작성**: `useQuery`, `useMutation` 등을 활용한 서버 상태 관리

### 🔹 3-2. UI Layer 구현 (`ui/`)

1. **View & Components 구현**: Props 기반의 순수 UI 컴포넌트 구현 (디자인 시스템 준수)
2. **Container 조립**: Hooks에서 데이터를 가져와 View에 주입하고, **로딩/에러/빈 데이터 상태** 분기 처리
3. **Exception Handling**: `QueryErrorBoundary` 및 `Suspense` 적용

---

## 4️⃣ 단계: 안정성 및 최적화 (Optimization & Security)

구현된 기능의 품질을 높이고 보안 취약점을 점검합니다.

1. **에러 및 예외 처리**: 클라이언트와 서버 양측에서 유효성 검사 및 예외 상황 대응
2. **테스트 코드 작성**: 정의된 테스트 케이스를 바탕으로 Unit/Integration 테스트 수행
3. **보안 점검**:
    - **Client**: XSS 방지, JWT 토큰의 안전한 관리(SecureStore)
    - **Server**: SQL Injection 방지(Prisma 활용), CSRF 대응
4. **성능 최적화**:
    - **Client**: 리렌더링 방지, 이미지 최적화, 리스트 가상화(`FlashList`) 적용
    - **Server**: 쿼리 최적화 및 API 응답 속도 점검

---

## 5️⃣ 단계: 리뷰 및 완료 (Review & Done)

1. **코드 리뷰**: SRP 원칙 준수 여부 및 클린 코드 규칙(설명용 변수 등) 확인
2. **주석 정리**: 주요 컴포넌트 및 함수에 JSDoc 주석 작성 확인
3. **문서 업데이트**: 개발 과정에서 변경된 사양을 `docs/specs/`에 반영
