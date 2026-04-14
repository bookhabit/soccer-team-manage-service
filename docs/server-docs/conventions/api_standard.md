# REST API & Swagger 표준

프론트엔드 개발자와의 **"계약(Contract)"**을 정의하는 문서입니다.

---

## 응답 규격 (Response Envelope)

모든 응답은 일관된 포맷을 유지해야 합니다.

### 성공 응답

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

### 실패 응답

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "TEAM_FULL",
    "message": "해당 팀의 정원이 초과되었습니다.",
    "timestamp": "2026-04-02T10:00:00Z"
  }
}
```

---

## URL 네이밍 규칙

| 방식                      | 예시                                                 |
| ------------------------- | ---------------------------------------------------- |
| 리소스는 복수 명사        | `GET /teams`, `GET /matches`                         |
| 계층 관계 표현            | `GET /teams/:teamId/members`                         |
| 동작은 HTTP 메서드로 표현 | `POST /matches` (생성), `DELETE /matches/:id` (삭제) |
| kebab-case 사용           | `GET /match-records`                                 |

---

## HTTP 메서드 규칙

| 메서드   | 용도      | 예시                                |
| -------- | --------- | ----------------------------------- |
| `GET`    | 조회      | `GET /teams/:id`                    |
| `POST`   | 생성      | `POST /teams`                       |
| `PATCH`  | 부분 수정 | `PATCH /teams/:id`                  |
| `DELETE` | 삭제      | `DELETE /teams/:id/members/:userId` |

---

## Swagger 작성 표준

모든 엔드포인트에는 아래 데코레이터를 필수로 작성합니다.
서버 기능 구현(코드 작성) 후 항상 Swagger 작성 필수

- `@ApiOperation`: 해당 엔드포인트가 무엇을 하는지 한 줄 요약
- `@ApiProperty`: DTO 필드별 예시 값(`example`)과 설명(`description`) 필수 작성
- `@ApiResponse`: 성공(200/201) 외에도 발생 가능한 에러(400, 403, 404)를 명시하여 프론트엔드에서 예외 처리를 대비하게 함

```ts
@ApiOperation({ summary: '팀 가입 신청' })
@ApiResponse({ status: 201, description: '가입 신청 성공' })
@ApiResponse({ status: 403, description: '이미 팀에 소속된 유저' })
@ApiResponse({ status: 404, description: '존재하지 않는 팀' })
@Post(':teamId/join')
async joinTeam(@Param('teamId') teamId: string, @User() user: UserEntity) {
  return this.teamsService.requestJoin(teamId, user.id);
}
```
