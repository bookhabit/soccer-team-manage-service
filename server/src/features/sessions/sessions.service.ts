import { createHash, timingSafeEqual, randomUUID } from "crypto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import { UserStatus } from "@prisma/client";
import { ErrorCode } from "../../common/constants/error-codes";
import { PrismaService } from "../../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import type { LoginDto } from "./dto/login.dto";
import type { CreateUserDto } from "../users/dto/create-user.dto";

/** RefreshToken 원문을 SHA256으로 해시 — DB에는 해시만 저장 */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** 타이밍 공격 방지용 안전한 해시 비교 */
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

const DUMMY_HASH = "$2b$12$dummyhashfordummycomparison000000000000000000";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<TokenPair> {
    const user = await this.usersService.findByEmailForAuth(dto.email);

    const hashToCompare = user?.passwordHash ?? DUMMY_HASH;
    const isValid = await bcrypt.compare(dto.password, hashToCompare);

    if (!user || !isValid) {
      throw new UnauthorizedException({
        code: ErrorCode.INVALID_CREDENTIALS,
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    if (user.deletedAt !== null || user.status === UserStatus.DELETED) {
      throw new UnauthorizedException({
        code: ErrorCode.USER_DELETED,
        message: "탈퇴한 계정입니다.",
      });
    }

    if (user.status === UserStatus.RESTRICTED) {
      throw new UnauthorizedException({
        code: ErrorCode.USER_RESTRICTED,
        message: "매너 온도가 너무 낮아 이용이 제한된 계정입니다.",
      });
    }

    return this.issueTokens(user.id, user.email ?? '');
  }

  async signup(dto: CreateUserDto): Promise<TokenPair> {
    const user = await this.usersService.create(dto);
    return this.issueTokens(user.id, user.email ?? '');
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: { sub: string; email: string };

    try {
      payload = this.jwtService.verify<{ sub: string; email: string }>(
        refreshToken,
        {
          secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
        },
      );
    } catch {
      throw new UnauthorizedException({
        code: ErrorCode.INVALID_REFRESH_TOKEN,
        message: "유효하지 않은 리프레시 토큰입니다.",
      });
    }

    const session = await this.prisma.session.findUnique({
      where: { userId: payload.sub },
    });
    const sessionExists = session !== null;
    if (!sessionExists) {
      throw new UnauthorizedException({
        code: ErrorCode.SESSION_NOT_FOUND,
        message: "세션이 만료되었습니다. 다시 로그인해주세요.",
      });
    }

    const incomingHash = hashToken(refreshToken);

    // Refresh Token Rotation: 해시 불일치 = 재사용 감지 → 세션 강제 삭제
    const tokenHashesMatch = safeCompare(
      incomingHash,
      session.refreshTokenHash,
    );
    const isTokenReused = !tokenHashesMatch;
    if (isTokenReused) {
      await this.prisma.session.delete({ where: { userId: payload.sub } });
      throw new UnauthorizedException({
        code: ErrorCode.TOKEN_REUSE_DETECTED,
        message: "비정상적인 접근이 감지되었습니다. 다시 로그인해주세요.",
      });
    }

    return this.issueTokens(payload.sub, payload.email);
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { userId } });
  }

  private async issueTokens(userId: string, email: string): Promise<TokenPair> {
    // jti(JWT ID)로 같은 초에 발급된 토큰도 고유하게 구분 → RTR 재사용 감지 정확도 보장
    const payload = { sub: userId, email, jti: randomUUID() };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
      expiresIn: this.config.get<string>("JWT_ACCESS_EXPIRES_IN") ?? "15m",
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
      expiresIn: this.config.get<string>("JWT_REFRESH_EXPIRES_IN") ?? "7d",
    });

    // 1인 1세션: upsert (기존 세션 교체)
    await this.prisma.session.upsert({
      where: { userId },
      update: { refreshTokenHash: hashToken(refreshToken) },
      create: { userId, refreshTokenHash: hashToken(refreshToken) },
    });

    return { accessToken, refreshToken };
  }
}
