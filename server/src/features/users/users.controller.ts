import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiConflictResponse, ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
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

  /** 내 정보 조회 — 인증 필요 */
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 프로필 조회' })
  @ApiResponse({ status: 200, description: '조회 성공', type: UserProfileResponseDto })
  @ApiUnauthorizedResponse({ description: '유효하지 않은 토큰' })
  async getMe(@CurrentUser() user: JwtPayload): Promise<UserProfileResponseDto | null> {
    return this.usersService.findById(user.sub);
  }

  /** 프로필 수정 — 인증 필요 */
  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 프로필 수정' })
  @ApiResponse({ status: 200, description: '수정 성공', type: UserProfileResponseDto })
  @ApiUnauthorizedResponse({ description: '유효하지 않은 토큰' })
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateProfile(user.sub, dto);
  }
}
