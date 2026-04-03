# 입력값 보안 및 검증

---

## 1. SQL Injection 방어 (Prisma & Validation)

- **Prisma의 기본 방어:** Prisma는 내부적으로 **Parameterized Queries(매개변수화된 쿼리)**를 사용합니다. 유저가 입력한 값을 쿼리문 자체가 아닌 '데이터'로만 취급하기 때문에, 기본적인 SQL Injection은 자동으로 방어됩니다.
- **Type Safety:** `class-validator`를 통해 입력값이 숫자인지, 문자열인지 엄격히 제한하여 비정상적인 쿼리 주입 시도를 입구에서 차단합니다.

```ts
// DTO 레벨에서 타입 강제
export class JoinTeamDto {
  @IsUUID()
  teamId: string;

  @IsString()
  @MaxLength(50)
  message: string;
}
```

---

## 2. XSS(Cross-Site Scripting) 방어 (Sanitization)

유저가 채팅이나 팀 소개 글에 `<script>alert('hack')</script>` 같은 코드를 넣는 것을 막아야 합니다.

### 방법 A: class-transformer 활용 (추천)

NestJS의 `class-transformer`를 사용하여 DTO 단계에서 특수문자를 이스케이프(Escape)하거나 제거합니다.

- `<` → `&lt;`
- `>` → `&gt;`

```ts
import { Transform } from 'class-transformer';
import { escape } from 'he'; // HTML 이스케이프 라이브러리

export class CreateTeamDto {
  @Transform(({ value }) => escape(value))
  @IsString()
  description: string;
}
```

### 방법 B: 전역 미들웨어 (Helmet.js)

`app.use(helmet())`을 적용하면 브라우저 수준에서 실행되는 보안 헤더를 설정하여 XSS 위험을 낮춰줍니다.

```ts
// main.ts
import helmet from 'helmet';
app.use(helmet());
```

---

## 3. class-validator 주요 보안 전략

DTO에서 단순히 존재 여부만 체크하지 말고, **범위와 형식**을 제한하세요.

| 데코레이터 | 목적 |
| --- | --- |
| `@IsAlphanumeric()` | 아이디 등에 특수문자 주입 방지 |
| `@MaxLength(100)` | 대량의 텍스트를 이용한 Buffer Overflow나 DoS 공격 방지 |
| `@IsUUID()` | ID 파라미터에 임의 문자열 삽입 방지 |
| `@IsEnum(Role)` | 허용된 값 이외의 역할 주입 방지 |

```ts
// ValidationPipe whitelist 옵션
// DTO에 정의되지 않은 불필요한 속성이 들어오면 자동으로 제거 (Mass Assignment 공격 방지)
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
```
