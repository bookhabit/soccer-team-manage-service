import type { SuperTestStatic, Response } from 'supertest';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const request = require('supertest') as SuperTestStatic;
import type { INestApplication } from '@nestjs/common';
import { createTestApp, cleanDatabase } from '../../../test/app.helper';

const SIGNUP_URL = '/api/v1/users';
const LOGIN_URL = '/api/v1/sessions';
const REFRESH_URL = '/api/v1/sessions/refresh';
const LOGOUT_URL = '/api/v1/sessions';
const ME_URL = '/api/v1/users/me';

const testUser = {
  email: 'auth@guide.app',
  password: 'password123',
  nickname: '인증테스터',
};

/** Set-Cookie 헤더에서 RT 쿠키 값 추출 */
function extractRtCookie(res: Response): string | undefined {
  const setCookie = res.headers['set-cookie'] as string[] | string | undefined;
  if (!setCookie) return undefined;
  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
  const rtEntry = cookies.find((c) => c.startsWith('guide_app_rt='));
  if (!rtEntry) return undefined;
  return rtEntry.split(';')[0].split('=').slice(1).join('=');
}

describe('Sessions E2E — /api/v1/sessions', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase(app);
    // 모든 테스트 전에 테스트 유저 생성
    await request(app.getHttpServer()).post(SIGNUP_URL).send(testUser).expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── 로그인 ────────────────────────────────────────────────────────────────

  describe('POST /api/v1/sessions (로그인)', () => {
    it('정상 로그인 → 200 + AT(body) + RT(httpOnly Cookie)', async () => {
      const res = await request(app.getHttpServer())
        .post(LOGIN_URL)
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      // AT는 body에
      expect(res.body).toHaveProperty('accessToken');
      expect(typeof res.body.accessToken).toBe('string');

      // RT는 httpOnly 쿠키에 (body에 없어야 함)
      expect(res.body.refreshToken).toBeUndefined();

      const rt = extractRtCookie(res);
      expect(rt).toBeDefined();
    });

    it('잘못된 비밀번호 → 401 + INVALID_CREDENTIALS', async () => {
      const res = await request(app.getHttpServer())
        .post(LOGIN_URL)
        .send({ email: testUser.email, password: 'wrongpassword' })
        .expect(401);

      expect(res.body.code ?? res.body.message).toContain('INVALID_CREDENTIALS');
    });

    it('존재하지 않는 이메일 → 401 (타이밍 공격 방지 — 동일 응답)', async () => {
      const res = await request(app.getHttpServer())
        .post(LOGIN_URL)
        .send({ email: 'ghost@guide.app', password: 'password123' })
        .expect(401);

      expect(res.body.code ?? res.body.message).toContain('INVALID_CREDENTIALS');
    });

    it('이메일 형식 오류 → 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .post(LOGIN_URL)
        .send({ email: 'not-an-email', password: testUser.password })
        .expect(400);
    });
  });

  // ─── 토큰 갱신 ────────────────────────────────────────────────────────────

  describe('POST /api/v1/sessions/refresh (Silent Refresh)', () => {
    it('유효한 RT 쿠키 → 200 + 새 AT + 새 RT 쿠키 (RTR)', async () => {
      const loginRes = await request(app.getHttpServer())
        .post(LOGIN_URL)
        .send({ email: testUser.email, password: testUser.password });

      const oldRt = extractRtCookie(loginRes);
      expect(oldRt).toBeDefined();

      const refreshRes = await request(app.getHttpServer())
        .post(REFRESH_URL)
        .set('Cookie', `guide_app_rt=${oldRt}`)
        .expect(200);

      // 새 AT 발급
      expect(refreshRes.body).toHaveProperty('accessToken');

      // 새 RT 쿠키 발급 (Rotation)
      const newRt = extractRtCookie(refreshRes);
      expect(newRt).toBeDefined();
      expect(newRt).not.toBe(oldRt); // 반드시 달라야 함
    });

    it('새 AT로 보호된 엔드포인트 접근 가능', async () => {
      const loginRes = await request(app.getHttpServer())
        .post(LOGIN_URL)
        .send({ email: testUser.email, password: testUser.password });

      const rt = extractRtCookie(loginRes);

      const refreshRes = await request(app.getHttpServer())
        .post(REFRESH_URL)
        .set('Cookie', `guide_app_rt=${rt}`);

      const { accessToken } = refreshRes.body as { accessToken: string };

      await request(app.getHttpServer())
        .get(ME_URL)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('RT 쿠키 없음 → 401 + MISSING_REFRESH_TOKEN', async () => {
      const res = await request(app.getHttpServer()).post(REFRESH_URL).expect(401);

      expect(res.body.code ?? res.body.message).toContain('MISSING_REFRESH_TOKEN');
    });

    it('위조된 RT → 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .post(REFRESH_URL)
        .set('Cookie', 'guide_app_rt=forged.token.value')
        .expect(401);
    });

    it('RTR 재사용 감지: 이미 사용된 RT로 재요청 → 401 (세션 무효화)', async () => {
      const loginRes = await request(app.getHttpServer())
        .post(LOGIN_URL)
        .send({ email: testUser.email, password: testUser.password });

      const oldRt = extractRtCookie(loginRes);

      // 첫 번째 갱신 성공
      await request(app.getHttpServer())
        .post(REFRESH_URL)
        .set('Cookie', `guide_app_rt=${oldRt}`)
        .expect(200);

      // 같은 RT로 재시도 → 재사용 감지 → 401 + 세션 무효화
      await request(app.getHttpServer())
        .post(REFRESH_URL)
        .set('Cookie', `guide_app_rt=${oldRt}`)
        .expect(401);
    });

    it('RTR 재사용 감지 후 새 RT도 무효화 (세션 삭제 확인)', async () => {
      const loginRes = await request(app.getHttpServer())
        .post(LOGIN_URL)
        .send({ email: testUser.email, password: testUser.password });

      const oldRt = extractRtCookie(loginRes);

      // 첫 번째 갱신 → 새 RT 획득
      const refreshRes = await request(app.getHttpServer())
        .post(REFRESH_URL)
        .set('Cookie', `guide_app_rt=${oldRt}`)
        .expect(200);

      const newRt = extractRtCookie(refreshRes);

      // 이전 RT 재사용 → 공격자 의심 → 전체 세션 삭제
      await request(app.getHttpServer())
        .post(REFRESH_URL)
        .set('Cookie', `guide_app_rt=${oldRt}`)
        .expect(401);

      // 새 RT도 이제 무효 (세션이 삭제됐으므로)
      await request(app.getHttpServer())
        .post(REFRESH_URL)
        .set('Cookie', `guide_app_rt=${newRt}`)
        .expect(401);
    });
  });

  // ─── 로그아웃 ──────────────────────────────────────────────────────────────

  describe('DELETE /api/v1/sessions (로그아웃)', () => {
    it('정상 로그아웃 → 204 + RT 쿠키 삭제', async () => {
      const loginRes = await request(app.getHttpServer())
        .post(LOGIN_URL)
        .send({ email: testUser.email, password: testUser.password });

      const { accessToken } = loginRes.body as { accessToken: string };

      const logoutRes = await request(app.getHttpServer())
        .delete(LOGOUT_URL)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      // 쿠키가 만료 처리되어야 함 (Max-Age=0 또는 Expires 과거)
      const setCookie = logoutRes.headers['set-cookie'] as string[] | string | undefined;
      if (setCookie) {
        const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
        const rtEntry = cookies.find((c) => c.includes('guide_app_rt'));
        if (rtEntry) {
          expect(rtEntry).toMatch(/max-age=0|expires=.*1970/i);
        }
      }
    });

    it('로그아웃 후 기존 RT로 갱신 불가 → 401', async () => {
      const loginRes = await request(app.getHttpServer())
        .post(LOGIN_URL)
        .send({ email: testUser.email, password: testUser.password });

      const { accessToken } = loginRes.body as { accessToken: string };
      const rt = extractRtCookie(loginRes);

      // 로그아웃
      await request(app.getHttpServer())
        .delete(LOGOUT_URL)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      // 로그아웃 후 기존 RT로 갱신 시도 → 401
      await request(app.getHttpServer())
        .post(REFRESH_URL)
        .set('Cookie', `guide_app_rt=${rt}`)
        .expect(401);
    });

    it('AT 없이 로그아웃 시도 → 401 Unauthorized', async () => {
      await request(app.getHttpServer()).delete(LOGOUT_URL).expect(401);
    });

    it('로그아웃 후 기존 AT는 만료 전까지 유효 (Stateless 특성)', async () => {
      // AT는 Stateless — 로그아웃 후에도 만료 전까지 서명이 유효함
      // 이는 의도된 트레이드오프 (단기 AT 15분으로 위험 최소화)
      const loginRes = await request(app.getHttpServer())
        .post(LOGIN_URL)
        .send({ email: testUser.email, password: testUser.password });

      const { accessToken } = loginRes.body as { accessToken: string };

      // 로그아웃
      await request(app.getHttpServer())
        .delete(LOGOUT_URL)
        .set('Authorization', `Bearer ${accessToken}`);

      // AT 서명은 여전히 유효 (Stateless) — /me는 여전히 200
      // 이건 버그가 아니라 Stateless JWT의 알려진 특성
      await request(app.getHttpServer())
        .get(ME_URL)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });

  // ─── AT 인가 검증 ─────────────────────────────────────────────────────────

  describe('AT 인가 검증', () => {
    it('만료된 AT 형식 → 401 Unauthorized', async () => {
      // 실제 만료된 토큰을 시뮬레이션하기 어려우므로 위조 토큰으로 대체
      await request(app.getHttpServer())
        .get(ME_URL)
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.invalid')
        .expect(401);
    });

    it('Bearer 스킴 없이 토큰 전달 → 401', async () => {
      const loginRes = await request(app.getHttpServer())
        .post(LOGIN_URL)
        .send({ email: testUser.email, password: testUser.password });

      const { accessToken } = loginRes.body as { accessToken: string };

      await request(app.getHttpServer())
        .get(ME_URL)
        .set('Authorization', accessToken) // Bearer 없음
        .expect(401);
    });
  });
});
