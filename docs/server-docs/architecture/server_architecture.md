# 서버 아키텍처 (계층형 & 기능별 구조)

단순한 레이어 분리를 넘어, **의존성 역전(DIP)**과 **응집도**를 고려한 설계 규칙입니다.

---

## 핵심 원칙: 도메인 중심의 캡슐화

- **Feature-based Module:** `src/modules/{domain}` 구조를 따릅니다. (예: `users`, `teams`, `matches`)
- **Layered Flow:** `Controller (Entry) → Service (Business) → Repository (Persistence)`
- **Interface 기반 분리:** 서비스는 구체적인 Repository 구현체가 아닌 인터페이스(또는 추상 클래스)에 의존합니다. 이는 나중에 DB를 교체하거나 Mock 테스트를 작성할 때 매우 유리합니다.

---

## 디렉토리 구조

```
src/
├── modules/
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.repository.ts
│   │   ├── users.module.ts
│   │   └── dto/
│   ├── teams/
│   ├── matches/
│   └── votes/
├── shared/              # 공통 모듈 (알림, 이미지 업로드 등)
├── infrastructure/      # DB, 외부 서비스 연결
└── common/              # 공통 Guard, Filter, Interceptor
```

---

## 의존성 주입(DI) 규칙

- 모든 비즈니스 로직은 `Service`에 위치하며, `Controller`는 오직 요청 검증 및 응답 반환만 담당합니다.
- 공통 로직(예: 이미지 업로드, 알림 발송)은 `SharedModule`이나 `InfrastructureModule`로 분리하여 주입받습니다.

### 레이어별 책임 요약

| **레이어** | **역할** | **금지 사항** |
| --- | --- | --- |
| **Controller** | 요청 수신, DTO 검증, 응답 반환 | 비즈니스 로직 직접 작성 |
| **Service** | 비즈니스 로직 처리 | DB 쿼리 직접 작성 |
| **Repository** | DB 접근 (Prisma) | 비즈니스 판단 로직 포함 |
| **SharedModule** | 공통 기능 제공 (알림, 파일 등) | 특정 도메인 로직 의존 |
