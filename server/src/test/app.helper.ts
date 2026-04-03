import { Test } from '@nestjs/testing';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');

/**
 * 테스트용 NestJS 앱 인스턴스를 생성합니다.
 * 실제 app.module을 그대로 사용해 prod와 동일한 환경에서 테스트.
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  await app.init();
  return app;
}

/**
 * 각 테스트 전에 DB를 초기화합니다.
 * 테스트 간 데이터 간섭을 방지합니다.
 */
export async function cleanDatabase(app: INestApplication): Promise<void> {
  const prisma = app.get(PrismaService);
  // 외래키 의존 순서로 삭제
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
}
