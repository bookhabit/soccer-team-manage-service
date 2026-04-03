# NestJS 생명주기 (미들웨어 및 실행 흐름)

NestJS의 생명주기를 활용해 비즈니스 로직을 보호하고 공통 기능을 자동화합니다.

---

## 요청 처리 흐름

```
Request
  → Middleware
  → Guard (AuthGuard → RolesGuard)
  → Interceptor (before)
  → Pipe (ValidationPipe)
  → Controller
  → Service
  → Interceptor (after)
  → Response
```

---

## Guard: 다단계 보안

### 1. AuthGuard (Authentication)

요청 헤더의 JWT를 파싱하여 유효성을 검증하고 `request.user`에 유저 객체를 주입합니다.

```ts
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException();

    request.user = await this.jwtService.verifyAsync(token);
    return true;
  }
}
```

### 2. RolesGuard (Authorization)

`Reflector`를 사용하여 핸들러나 클래스에 선언된 `@Roles()` 메타데이터와 유저의 권한을 비교합니다.

```ts
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
```

---

## Interceptor & Pipe

### LoggingInterceptor

모든 API의 응답 시간(ms)과 요청 경로를 로깅하여 성능 병목 지점을 추적합니다.

```ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const req = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        console.log(`[${req.method}] ${req.url} - ${ms}ms`);
      }),
    );
  }
}
```

### ValidationPipe

`transform: true` 옵션을 켜서 DTO의 타입을 자동으로 형변환(String → Number 등)하고 `class-validator`로 유효성을 강제합니다.

```ts
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```
