import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');
import { AppModule } from './app.module';

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`환경변수 ${key}가 설정되지 않았습니다. 서버를 시작할 수 없습니다.`);
  return value;
}

async function bootstrap() {
  requireEnv('JWT_ACCESS_SECRET');
  requireEnv('JWT_REFRESH_SECRET');
  requireEnv('DATABASE_URL');

  const app = await NestFactory.create(AppModule);

  // httpOnly Cookie를 읽기 위해 cookie-parser 필수
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env['CORS_ORIGIN']
      ? process.env['CORS_ORIGIN'].split(',').map((o) => o.trim())
      : /^http:\/\/(localhost|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+):3010$/,
    credentials: true, // withCredentials 쿠키 전송 허용
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Soccer Team App API')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('guide_app_rt')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env['PORT'] ?? 4000;
  await app.listen(port);
  console.log(`🚀 Guide App Server running on http://localhost:${port}`);
  console.log(`📄 Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
