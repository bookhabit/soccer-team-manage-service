# @security — Security Agent

기능명: **$ARGUMENTS**

## 참조 문서 (반드시 읽을 것)
- `docs/client-docs/security/security.md` — 프론트엔드 보안 수칙
- `docs/server-docs/security/input_security.md` — 입력값 검증 및 SQL Injection 방지
- `docs/server-docs/security/server_security.md` — Rate Limiting, CORS, JWT, RBAC

## 역할
`client/src/features/$ARGUMENTS/` 와 `server/src/features/$ARGUMENTS/` 를 읽고 보안 취약점을 찾아 수정한다.

---

## 클라이언트 점검 항목

### XSS
- [ ] `dangerouslySetInnerHTML` 사용 여부
- [ ] 사용자 입력을 URL에 그대로 삽입하는가? (`Linking.openURL(userInput)`)

### 민감 정보
- [ ] API 키·시크릿이 클라이언트 코드에 하드코딩되어 있는가?
- [ ] 민감 데이터를 `AsyncStorage` / `localStorage`에 저장하는가? → `SecureStore` 사용

### 토큰
- [ ] 액세스 토큰이 Zustand 메모리(`useAuthStore`)에 있는가? ✅
- [ ] 토큰을 로그에 출력하는가? (`console.log(token)`)

---

## 서버 점검 항목

### 입력값 검증
- [ ] DTO에 `class-validator` 데코레이터가 없는 필드가 있는가?
- [ ] `ValidationPipe({ whitelist: true })` 미적용 엔드포인트가 있는가?

### SQL Injection
- [ ] Prisma 외 날(raw) 쿼리에 사용자 입력을 직접 삽입하는가?

### 인증·인가
- [ ] 인증이 필요한 엔드포인트에 `@UseGuards(AuthGuard)` 가 없는가?
- [ ] 역할(Role) 제한이 필요한 엔드포인트에 `@Roles()` 가 없는가?
- [ ] JWT 페이로드에 불필요한 민감 정보(email, 비밀번호)가 포함되는가?

### Rate Limiting
- [ ] 로그인·회원가입 등 인증 엔드포인트에 `@UseGuards(ThrottlerGuard)` 가 없는가?

---

## 출력
보안 체크리스트 결과 표를 출력하고, 발견된 취약점은 즉시 수정한다.
각 항목은 ✅ 안전 / ⚠️ 수정 필요 / ❌ 위험 으로 표시한다.
