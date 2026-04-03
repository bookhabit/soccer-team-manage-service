# 데이터 관리 전략 (Prisma)

ORM은 편리하지만, 잘못 쓰면 성능의 주범이 됩니다.

---

## Query Strategy

### N+1 문제 방지

연관 데이터를 가져올 때 무분별한 `include`를 지양하고, 필요한 필드만 `select` 하거나 `findRaw`를 검토합니다.

```ts
// ✕ 위험: 팀 목록 조회 시 각 팀마다 members를 개별 쿼리로 로드 (N+1)
const teams = await prisma.team.findMany();
for (const team of teams) {
  team.members = await prisma.member.findMany({ where: { teamId: team.id } });
}

// ✓ 안전: include로 한 번에 조인
const teams = await prisma.team.findMany({
  include: {
    members: { select: { id: true, name: true } }, // 필요한 필드만 select
  },
});
```

### Transaction

여러 테이블을 수정할 때는 반드시 `prisma.$transaction([])`을 사용하여 데이터의 원자성(Atomicity)을 보장합니다.

```ts
// 경기 기록 저장 + 팀 전적 갱신을 하나의 트랜잭션으로 처리
await prisma.$transaction([
  prisma.matchRecord.create({ data: matchData }),
  prisma.team.update({
    where: { id: teamId },
    data: { wins: { increment: 1 } },
  }),
]);
```

---

## 마이그레이션 정책

- `prisma migrate dev` 실행 전, 반드시 팀원과 스키마 변경 사항을 공유합니다.
- 운영 환경(Production)에서는 절대 `migrate dev`를 쓰지 않고 `migrate deploy`만 사용합니다.

| 명령어 | 환경 | 설명 |
| --- | --- | --- |
| `prisma migrate dev` | 개발(Local) | 마이그레이션 파일 생성 + 적용 |
| `prisma migrate deploy` | 운영(Production) | 기존 마이그레이션 파일만 적용 |
| `prisma db push` | 프로토타이핑 | 마이그레이션 파일 없이 스키마 즉시 반영 (운영 사용 금지) |

---

## 개발 체크리스트

- [ ] `findMany` 사용 시 필요한 필드만 `select` 했는가?
- [ ] 연관 데이터 조회 시 N+1 문제가 없는가?
- [ ] 여러 테이블 수정 시 `$transaction` 처리를 했는가?
- [ ] 운영 배포 시 `migrate deploy`를 사용했는가?
