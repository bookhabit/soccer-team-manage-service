import {
  Controller, Post, Delete,
  Body, HttpCode, HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiUnauthorizedResponse, ApiConflictResponse,
} from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { ErrorCode } from '../../common/constants/error-codes';
import { SessionsService } from './sessions.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AccessTokenResponseDto } from './dto/session-response.dto';

@ApiTags('Sessions')
@Controller('api/v1/sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  /** 회원가입 — 유저 생성 + 세션 발급 */
  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공. accessToken과 refreshToken이 발급됩니다.', type: AccessTokenResponseDto })
  @ApiConflictResponse({ description: '이미 사용 중인 이메일 (EMAIL_ALREADY_EXISTS)' })
  async signup(@Body() dto: CreateUserDto): Promise<AccessTokenResponseDto> {
    const { accessToken, refreshToken } = await this.sessionsService.signup(dto);
    return { accessToken, refreshToken };
  }

  /**
   * 로그인
   * AT, RT 모두 response body로 반환 (React Native — SecureStore에 저장)
   */
  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({
    status: 200,
    description: '로그인 성공. accessToken과 refreshToken 모두 body로 발급됩니다.',
    type: AccessTokenResponseDto,
  })
  @ApiUnauthorizedResponse({ description: '이메일 또는 비밀번호 불일치' })
  async login(
    @Body() dto: LoginDto,
  ): Promise<AccessTokenResponseDto> {
    const { accessToken, refreshToken } = await this.sessionsService.login(dto);
    return { accessToken, refreshToken };
  }

  /**
   * 토큰 갱신 (Silent Refresh + RT Rotation)
   * RT는 request body로 수신 (React Native — SecureStore에서 전달)
   * 새 AT, 새 RT 모두 body로 반환
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '토큰 갱신 (Silent Refresh)', description: 'body의 refreshToken으로 새 accessToken과 refreshToken을 발급합니다. (RT Rotation)' })
  @ApiResponse({
    status: 200,
    description: '갱신 성공. 새 accessToken과 refreshToken 모두 body로 발급됩니다.',
    type: AccessTokenResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'refreshToken 없음 또는 유효하지 않은 토큰' })
  async refresh(
    @Body() dto: RefreshDto,
  ): Promise<AccessTokenResponseDto> {
    if (!dto.refreshToken) {
      throw new UnauthorizedException({
        code: ErrorCode.MISSING_REFRESH_TOKEN,
        message: '리프레시 토큰이 없습니다.',
      });
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.sessionsService.refresh(dto.refreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * 로그아웃
   * DB 세션 삭제
   */
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 204, description: '로그아웃 성공. DB 세션 삭제.' })
  @ApiUnauthorizedResponse({ description: '유효하지 않은 accessToken' })
  async logout(
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.sessionsService.logout(user.sub);
  }
}
