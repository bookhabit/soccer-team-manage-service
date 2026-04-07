import {
  Body, Controller, Delete, Get,
  HttpCode, HttpStatus, Patch, Post,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiConflictResponse, ApiUnauthorizedResponse, ApiNotFoundResponse,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { OnboardingDto } from './dto/onboarding.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { SignupResponseDto, UserProfileResponseDto } from './dto/user-response.dto';

@ApiTags('Users')
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** 회원가입 — 인증 불필요 */
  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공', type: SignupResponseDto })
  @ApiConflictResponse({ description: '이미 사용 중인 이메일 (EMAIL_ALREADY_EXISTS)' })
  async signup(@Body() dto: CreateUserDto): Promise<SignupResponseDto> {
    return this.usersService.create(dto);
  }

  /** 내 정보 조회 */
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 프로필 조회' })
  @ApiResponse({ status: 200, description: '조회 성공', type: UserProfileResponseDto })
  @ApiUnauthorizedResponse({ description: '유효하지 않은 토큰' })
  async getMe(@CurrentUser() user: JwtPayload): Promise<UserProfileResponseDto | null> {
    return this.usersService.findById(user.sub);
  }

  /** 온보딩 정보 저장 — 가입 후 최초 1회 */
  @Patch('me/onboarding')
  @ApiBearerAuth()
  @ApiOperation({ summary: '온보딩 정보 저장 (최초 1회)' })
  @ApiResponse({ status: 200, description: '온보딩 완료', type: UserProfileResponseDto })
  @ApiConflictResponse({ description: '이미 온보딩 완료 (ONBOARDING_ALREADY_DONE)' })
  @ApiUnauthorizedResponse({ description: '유효하지 않은 토큰' })
  async saveOnboarding(
    @CurrentUser() user: JwtPayload,
    @Body() dto: OnboardingDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.saveOnboarding(user.sub, dto);
  }

  /** 프로필 수정 */
  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 프로필 수정' })
  @ApiResponse({ status: 200, description: '수정 성공', type: UserProfileResponseDto })
  @ApiNotFoundResponse({ description: '존재하지 않는 지역 ID (REGION_NOT_FOUND)' })
  @ApiUnauthorizedResponse({ description: '유효하지 않은 토큰' })
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateProfile(user.sub, dto);
  }

  /** 회원 탈퇴 — Soft Delete + PII 즉시 파기 */
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: '회원 탈퇴', description: 'PII 즉시 파기, 경기 기록은 "탈퇴 사용자"로 익명화 유지' })
  @ApiResponse({ status: 204, description: '탈퇴 성공' })
  @ApiUnauthorizedResponse({ description: '유효하지 않은 토큰' })
  async withdraw(
    @CurrentUser() user: JwtPayload,
    @Body() dto: WithdrawDto,
  ): Promise<void> {
    return this.usersService.withdraw(user.sub, dto);
  }
}
