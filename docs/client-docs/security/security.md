# 보안 수칙: 프론트엔드 / 백엔드

## 프론트엔드 보안

### 1. XSS (Cross-Site Scripting) 방지

React는 기본적으로 JSX 내 값을 이스케이프하지만, 예외 케이스를 주의한다.

```tsx
// ✕ 위험: 사용자 입력을 그대로 HTML에 삽입
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✓ 안전: 텍스트 노드로 렌더링 (React 기본 동작)
<div>{userInput}</div>

// ✕ 위험: URL에 javascript: 삽입 가능
<a href={userProvidedUrl}>링크</a>

// ✓ 안전: href 화이트리스트 검증
const isSafeUrl = (url: string) => url.startsWith('https://') || url.startsWith('/');
<a href={isSafeUrl(url) ? url : '#'}>링크</a>
```

---

### 2. 민감 정보 노출 방지

```ts
// ✕ 위험: 환경변수를 클라이언트 번들에 포함
const SECRET_KEY = process.env.SECRET_KEY; // 빌드 시 번들에 포함됨

// ✓ Next.js: NEXT_PUBLIC_ 접두사 없는 변수는 서버에서만 접근
const apiKey = process.env.API_KEY; // 서버 컴포넌트 / API Route에서만

// ✓ Vite: import.meta.env.VITE_ 접두사 붙은 것만 클라이언트에 노출
// 민감 정보는 절대 VITE_ 접두사 사용 금지
```

---

### 3. 토큰 저장 전략

| 저장소 | XSS 취약 | CSRF 취약 | 권장 용도 |
|--------|---------|---------|---------|
| localStorage | O | X | 비민감 설정값 |
| sessionStorage | O | X | 임시 상태 |
| HttpOnly Cookie | X | O | 인증 토큰 (권장) |
| Memory (변수) | X | X | 단기 액세스 토큰 |

```ts
// ✓ 권장: 액세스 토큰은 메모리, 리프레시 토큰은 HttpOnly Cookie
// 서버에서 Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict
```

---

### 4. CSRF 방지

```ts
// Next.js API Route에서 Origin 헤더 검증
export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  if (origin !== process.env.ALLOWED_ORIGIN) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
}
```

---

## 백엔드(NestJS) 보안

### 1. 입력값 검증 — ValidationPipe

```ts
// main.ts — 전역 파이프로 모든 요청 검증
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,            // DTO에 없는 필드 자동 제거
    forbidNonWhitelisted: true, // 허용되지 않은 필드 오면 400 에러
    transform: true,            // 타입 자동 변환 (string → number 등)
  }),
);
```

---

### 2. SQL Injection / NoSQL Injection 방지

```ts
// ✕ 위험: 날 쿼리에 사용자 입력 직접 삽입
const users = await db.query(`SELECT * FROM users WHERE id = ${userId}`);

// ✓ 안전: 파라미터 바인딩 사용
const users = await userRepository.findOne({ where: { id: userId } });

// ✓ 안전: TypeORM QueryBuilder 파라미터
const result = await repo
  .createQueryBuilder('loan')
  .where('loan.applicantId = :id', { id: applicantId })
  .getMany();
```

---

### 3. 인증(Authentication) — JWT

```ts
// JWT 페이로드에는 최소한의 정보만
interface JwtPayload {
  sub: string;   // userId
  role: UserRole;
  iat: number;
  exp: number;
}

// ✕ 위험: 민감 정보를 페이로드에 포함
// { email, password, creditScore, ... }

// 액세스 토큰: 단명 (15분 ~ 1시간)
// 리프레시 토큰: 장명 (7일 ~ 30일), DB에 저장하여 무효화 가능
```

---

### 4. 인가(Authorization) — RBAC

```ts
// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}

// 사용
@Get('admin')
@Roles('admin')
getAdminData() { ... }
```

---

### 5. Rate Limiting (무차별 대입 공격 방지)

```ts
// npm i @nestjs/throttler
// app.module.ts
ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]) // 60초에 10회

// 컨트롤러에 적용
@UseGuards(ThrottlerGuard)
@Post('auth/login')
login(@Body() dto: LoginDto) { ... }
```

---

### 6. CORS 설정

```ts
// main.ts — 허용 출처를 명시적으로 지정
app.enableCors({
  origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});

// ✕ 위험: origin: '*' + credentials: true 조합은 불가
```

---

### 7. 환경변수 관리

```ts
// .env.example — 키 목록만 커밋, 실제 값은 커밋하지 않음
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
CLIENT_ORIGIN=

// .gitignore에 반드시 포함
.env
.env.local
.env.production
```

---

## 보안 체크리스트

- [ ] DTO에 `ValidationPipe({ whitelist: true })` 적용
- [ ] JWT 시크릿 환경변수로 분리 (하드코딩 금지)
- [ ] 인증이 필요한 엔드포인트에 Guard 적용
- [ ] CORS origin 화이트리스트 설정
- [ ] `dangerouslySetInnerHTML` 미사용
- [ ] 민감 정보 localStorage 저장 금지
- [ ] `.env` 파일 `.gitignore` 등록 확인
