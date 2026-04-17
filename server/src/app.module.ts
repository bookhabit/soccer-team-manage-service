import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
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
import { MatchFeedModule } from './features/match-feed/match-feed.module';
import { HeadToHeadModule } from './features/head-to-head/head-to-head.module';
import { UploadModule } from './features/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      exclude: ['/api*'],
    }),
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
    MatchFeedModule,
    HeadToHeadModule,
    UploadModule,
  ],
  providers: [
    // Guard 순서 보장: JWT 검증 → Roles 검사
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
