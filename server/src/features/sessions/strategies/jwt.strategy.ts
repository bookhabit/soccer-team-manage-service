import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import type { JwtPayload } from '../../../common/guards/jwt-auth.guard';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  /**
   * Stateless 검증 — JWT 서명 확인 후 user 존재 여부만 확인.
   * DB 세션 조회 없음 → 요청 당 1회 DB 읽기 제거.
   *
   * 강제 로그아웃은 /refresh 시점에 세션 삭제로 처리.
   * AT 수명(15분)이 짧기 때문에 즉각 무효화 필요가 없는 대부분의 케이스를 커버.
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }

    return { sub: user.id, email: user.email ?? '' };
  }
}
