import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule, // secret은 서비스에서 직접 지정 (accessToken/refreshToken 별도 secret 사용)
    UsersModule,
  ],
  controllers: [SessionsController],
  providers: [SessionsService, JwtStrategy],
})
export class SessionsModule {}
