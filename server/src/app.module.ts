import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './features/users/users.module';
import { SessionsModule } from './features/sessions/sessions.module';
import { RegionsModule } from './features/regions/regions.module';
import { ClubModule } from './features/club/club.module';
import { PostModule } from './features/post/post.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    SessionsModule,
    RegionsModule,
    ClubModule,
    PostModule,
  ],
  providers: [
    // Guard 순서 보장: JWT 검증 → Roles 검사
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
