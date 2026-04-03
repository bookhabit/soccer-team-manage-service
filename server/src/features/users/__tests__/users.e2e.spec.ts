import type { SuperTestStatic } from 'supertest';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const request = require('supertest') as SuperTestStatic;
import type { INestApplication } from '@nestjs/common';
import { createTestApp, cleanDatabase } from '../../../test/app.helper';

describe('Users E2E — /api/v1/users', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase(app);
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── 회원가입 ───────────────────────────────────────────────────────────────

  describe('POST /api/v1/users (회원가입)', () => {
    const validPayload = {
      email: 'test@guide.app',
      password: 'password123',
      nickname: '테스터',
    };

    it('정상 회원가입 → 201 + 유저 정보 반환 (passwordHash 미노출)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(validPayload)
        .expect(201);

      expect(res.body).toMatchObject({
        email: 'test@guide.app',
        nickname: '테스터',
      });
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('createdAt');

      // 보안: 비밀번호 해시가 응답에 포함되면 안 됨
      expect(res.body.passwordHash).toBeUndefined();
      expect(res.body.password).toBeUndefined();
    });

    it('중복 이메일 → 409 + EMAIL_ALREADY_EXISTS 에러 코드', async () => {
      await request(app.getHttpServer()).post('/api/v1/users').send(validPayload).expect(201);

      const res = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(validPayload)
        .expect(409);

      expect(res.body.code ?? res.body.message).toContain('EMAIL_ALREADY_EXISTS');
    });

    it('이메일 형식 오류 → 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({ ...validPayload, email: 'not-an-email' })
        .expect(400);
    });

    it('비밀번호 8자 미만 → 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({ ...validPayload, password: '1234' })
        .expect(400);
    });

    it('DTO 외 필드는 자동 제거 (whitelist)', async () => {
      // forbidNonWhitelisted가 적용되므로 외부 필드가 있으면 400
      const res = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({ ...validPayload, maliciousField: 'hack' });

      expect(res.status).toBe(400);
    });

    it('인증 없이 접근 → 정상 동작 (@Public 데코레이터 확인)', async () => {
      // Authorization 헤더 없이도 201이어야 함
      const res = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(validPayload);

      expect(res.status).toBe(201);
    });
  });

  // ─── 내 정보 조회 ────────────────────────────────────────────────────────────

  describe('GET /api/v1/users/me (내 정보 조회)', () => {
    it('유효한 AT → 200 + 유저 정보', async () => {
      // 회원가입 + 로그인으로 AT 획득
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({ email: 'me@guide.app', password: 'password123', nickname: '나야나' });

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/sessions')
        .send({ email: 'me@guide.app', password: 'password123' });

      const { accessToken } = loginRes.body as { accessToken: string };

      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toMatchObject({ email: 'me@guide.app', nickname: '나야나' });
    });

    it('AT 없이 접근 → 401 Unauthorized', async () => {
      await request(app.getHttpServer()).get('/api/v1/users/me').expect(401);
    });

    it('잘못된 AT → 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });
  });
});
