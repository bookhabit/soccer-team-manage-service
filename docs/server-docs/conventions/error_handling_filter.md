# 예외 처리 표준

에러 핸들링의 목적은 **"서버의 내부 로직을 감추면서, 클라이언트에게는 명확한 대응 방법을 제시하는 것"**입니다.

---

## 1. Global Exception Filter (전역 필터)

- **내부 에러 은폐:** 500번대 에러(Internal Server Error) 발생 시, DB 쿼리나 소스 코드 경로가 노출되지 않도록 차단합니다.
- **일관된 포맷:** 모든 에러 응답을 아래와 같이 통일합니다.

```json
{
  "success": false,
  "error": {
    "code": "TEAM_FULL",
    "message": "해당 팀의 정원이 초과되었습니다.",
    "timestamp": "2026-04-02T10:00:00Z"
  }
}
```

### 구현 예시

```ts
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : 500;

    // 500 에러는 내부 정보 노출 차단
    const message = isHttpException
      ? exception.message
      : '서버 내부 오류가 발생했습니다.';

    response.status(status).json({
      success: false,
      error: {
        code: isHttpException ? (exception.getResponse() as any).code : 'INTERNAL_ERROR',
        message,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
```

---

## 2. Domain Error Codes (비즈니스 에러 정의)

HTTP 상태 코드(400, 404 등)만으로는 부족합니다. 서비스 전용 에러 코드를 정의합니다.

### 유저 (USER)

| 코드 | 설명 | HTTP |
| --- | --- | --- |
| `USER_001` | 존재하지 않는 유저 | 404 |
| `USER_002` | 이미 사용 중인 이메일 | 409 |

### 팀 (TEAM)

| 코드 | 설명 | HTTP |
| --- | --- | --- |
| `TEAM_001` | 존재하지 않는 팀 | 404 |
| `TEAM_002` | 팀 가입 권한 없음 | 403 |
| `TEAM_003` | 팀 정원 초과 | 409 |

### 경기 (MATCH)

| 코드 | 설명 | HTTP |
| --- | --- | --- |
| `MATCH_001` | 존재하지 않는 경기 | 404 |
| `MATCH_002` | 이미 예약된 경기 시간대 | 409 |
| `MATCH_003` | 경기 수정 권한 없음 | 403 |

---

## 3. 커스텀 예외 클래스 사용

```ts
// common/exceptions/domain.exception.ts
export class DomainException extends HttpException {
  constructor(code: string, message: string, status: HttpStatus) {
    super({ code, message }, status);
  }
}

// 사용 예시
throw new DomainException('TEAM_003', '팀 정원이 초과되었습니다.', HttpStatus.CONFLICT);
```
