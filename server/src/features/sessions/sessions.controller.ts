import {
  Controller, Post, Delete,
  Body, Req, Res, HttpCode, HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiUnauthorizedResponse, ApiCookieAuth,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { ErrorCode } from '../../common/constants/error-codes';
import { SessionsService } from './sessions.service';
import { LoginDto } from './dto/login.dto';
import { AccessTokenResponseDto } from './dto/session-response.dto';

const RT_COOKIE = 'guide_app_rt';

const RT_COOKIE_OPTIONS = {
  httpOnly: true,          // JS 접근 불가 — XSS 방어
  sameSite: 'strict' as const, // 외부 도메인 요청에서 쿠키 전송 차단 — CSRF 방어
  secure: process.env['NODE_ENV'] === 'production', // HTTPS에서만 전송 (프로덕션)
  path: '/',               // 모든 경로에서 접근 가능하게 (refresh + logout 모두 필요)
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7일 (ms)
};

@ApiTags('Sessions')
@Controller('api/v1/sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  /**
   * 로그인
   * AT → response body (클라이언트 메모리에 저장)
   * RT → httpOnly Cookie (JS 접근 불가)
   */
  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({
    status: 200,
    description: '로그인 성공. accessToken은 body로, refreshToken은 httpOnly 쿠키(guide_app_rt)로 발급됩니다.',
    type: AccessTokenResponseDto,
  })
  @ApiUnauthorizedResponse({ description: '이메일 또는 비밀번호 불일치' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessTokenResponseDto> {
    const { accessToken, refreshToken } = await this.sessionsService.login(dto);

    res.cookie(RT_COOKIE, refreshToken, RT_COOKIE_OPTIONS);

    return { accessToken };
  }

  /**
   * 토큰 갱신 (Silent Refresh)
   * RT는 httpOnly 쿠키에서 자동 수신 → body로 전달받지 않음
   * 새 AT → response body, 새 RT → Cookie (Rotation)
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('guide_app_rt')
  @ApiOperation({ summary: '토큰 갱신 (Silent Refresh)', description: 'httpOnly 쿠키(guide_app_rt)의 refreshToken으로 새 accessToken과 refreshToken을 발급합니다. (RT Rotation)' })
  @ApiResponse({
    status: 200,
    description: '갱신 성공. 새 accessToken은 body로, 새 refreshToken은 httpOnly 쿠키로 발급됩니다.',
    type: AccessTokenResponseDto,
  })
  @ApiUnauthorizedResponse({ description: '쿠키에 refreshToken 없음 또는 유효하지 않은 토큰' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessTokenResponseDto> {
    const refreshToken = req.cookies[RT_COOKIE] as string | undefined;

    if (!refreshToken) {
      throw new UnauthorizedException({
        code: ErrorCode.MISSING_REFRESH_TOKEN,
        message: '리프레시 토큰이 없습니다.',
      });
    }

    try {
      const { accessToken, refreshToken: newRefreshToken } =
        await this.sessionsService.refresh(refreshToken);

      res.cookie(RT_COOKIE, newRefreshToken, RT_COOKIE_OPTIONS);

      return { accessToken };
    } catch (error) {
      // 토큰이 있었지만 유효하지 않음 → 브라우저 쿠키도 즉시 삭제
      res.clearCookie(RT_COOKIE, { ...RT_COOKIE_OPTIONS, maxAge: 0 });
      throw error;
    }
  }

  /**
   * 로그아웃
   * DB 세션 삭제 + RT 쿠키 제거
   */
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 204, description: '로그아웃 성공. DB 세션 삭제 및 쿠키 제거.' })
  @ApiUnauthorizedResponse({ description: '유효하지 않은 accessToken' })
  async logout(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.sessionsService.logout(user.sub);
    res.clearCookie(RT_COOKIE, { ...RT_COOKIE_OPTIONS, maxAge: 0 });
  }
}
