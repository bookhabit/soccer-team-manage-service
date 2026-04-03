# 서버 방어 전략

---

## 인프라 및 앱 보안

### Rate Limiting

`ThrottlerModule`을 사용하여 특정 IP에서의 무차별 대입 공격(Brute-force)이나 API 남용을 방지합니다.

```ts
// app.module.ts
ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]) // 1분당 100회 제한

// 로그인 엔드포인트는 더 엄격하게
@UseGuards(ThrottlerGuard)
@Throttle({ default: { ttl: 60_000, limit: 10 } }) // 1분당 10회
@Post('auth/login')
login(@Body() dto: LoginDto) { ... }
```

### CORS 설정

허용된 도메인(White-list)만 API에 접근할 수 있도록 화이트리스트를 관리합니다.

```ts
// main.ts
app.enableCors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});

// ✕ 절대 금지: origin: '*' + credentials: true 조합
```

### Security Headers (Helmet)

`helmet` 라이브러리를 적용해 XSS 및 클릭재킹 공격을 기본적으로 방어합니다.

```ts
import helmet from 'helmet';
app.use(helmet());
```

---

## 인증 보안 (JWT)

- **Access Token**: 만료 시간을 짧게 설정 (예: 1시간)
- **Refresh Token**: 만료 시간을 길게 설정하되 DB 또는 Redis에 저장하여 탈취 시 즉시 무효화(Revoke) 가능

```ts
// JWT 페이로드는 최소 정보만 포함
interface JwtPayload {
  sub: string;    // userId
  role: UserRole;
  iat: number;
  exp: number;
}

// Refresh Token 무효화 예시 (강제 로그아웃)
async revokeRefreshToken(userId: string) {
  await this.prisma.refreshToken.updateMany({
    where: { userId },
    data: { isRevoked: true },
  });
}
```

---

## 보안 체크리스트

- [ ] `ThrottlerModule` 로그인 엔드포인트에 적용
- [ ] CORS `origin` 화이트리스트 환경변수로 관리
- [ ] `helmet()` 전역 미들웨어 적용
- [ ] JWT Secret 환경변수로 분리 (하드코딩 금지)
- [ ] Refresh Token DB 저장 및 Revoke 로직 구현
- [ ] 인증이 필요한 모든 엔드포인트에 `AuthGuard` 적용
- [ ] `.env` 파일 `.gitignore` 등록 확인
