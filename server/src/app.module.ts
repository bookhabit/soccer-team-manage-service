import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './features/users/users.module';
import { SessionsModule } from './features/sessions/sessions.module';
import { RegionsModule } from './features/regions/regions.module';
import { ClubModule } from './features/club/club.module';
import { PostModule } from './features/post/post.module';
import { MatchModule } from './features/match/match.module';
import { MatchPostsModule } from './features/match-posts/match-posts.module';
import { MercenaryPostsModule } from './features/mercenary-posts/mercenary-posts.module';
import { MercenaryAvailabilitiesModule } from './features/mercenary-availabilities/mercenary-availabilities.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    UsersModule,
    SessionsModule,
    RegionsModule,
    ClubModule,
    PostModule,
    MatchModule,
    MatchPostsModule,
    MercenaryPostsModule,
    MercenaryAvailabilitiesModule,
  ],
  providers: [
    // Guard 순서 보장: JWT 검증 → Roles 검사
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
