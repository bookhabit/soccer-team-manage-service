import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserStatus } from '@prisma/client';
import { ErrorCode } from '../../common/constants/error-codes';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateUserDto } from './dto/create-user.dto';
import type { OnboardingDto } from './dto/onboarding.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import type { WithdrawDto } from './dto/withdraw.dto';

const SALT_ROUNDS = 12;

/** 프로필 조회 시 반환할 필드 목록 */
const PROFILE_SELECT = {
  id: true,
  provider: true,
  email: true,
  name: true,
  birthYear: true,
  gender: true,
  position: true,
  foot: true,
  years: true,
  level: true,
  preferredRegionId: true,
  avatarUrl: true,
  mannerScore: true,
  isOnboarded: true,
  status: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** 회원가입 */
  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) {
      throw new ConflictException({
        code: ErrorCode.EMAIL_ALREADY_EXISTS,
        message: '이미 사용 중인 이메일입니다.',
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    return this.prisma.user.create({
      data: { email: dto.email, passwordHash, name: dto.name },
      select: { id: true, email: true, name: true, createdAt: true },
    });
  }

  /** 내 프로필 조회 */
  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: PROFILE_SELECT,
    });
  }

  /** 온보딩 정보 저장 — 한 번만 가능 */
  async saveOnboarding(id: string, dto: OnboardingDto) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { isOnboarded: true } });

    if (!user) {
      throw new NotFoundException({ code: ErrorCode.USER_NOT_FOUND, message: '유저를 찾을 수 없습니다.' });
    }
    if (user.isOnboarded) {
      throw new ConflictException({
        code: ErrorCode.ONBOARDING_ALREADY_DONE,
        message: '이미 온보딩이 완료된 계정입니다.',
      });
    }

    return this.prisma.user.update({
      where: { id },
      data: { ...dto, isOnboarded: true },
      select: PROFILE_SELECT,
    });
  }

  /** 프로필 수정 */
  async updateProfile(id: string, dto: UpdateProfileDto) {
    // preferredRegionId가 제공된 경우 존재 여부 확인
    if (dto.preferredRegionId) {
      const region = await this.prisma.region.findUnique({ where: { id: dto.preferredRegionId } });
      if (!region) {
        throw new NotFoundException({ code: ErrorCode.REGION_NOT_FOUND, message: '존재하지 않는 지역입니다.' });
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: PROFILE_SELECT,
    });
  }

  /** 회원 탈퇴 — Soft Delete + PII 즉시 파기 */
  async withdraw(id: string, _dto: WithdrawDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { status: true, deletedAt: true },
    });

    if (!user) {
      throw new NotFoundException({ code: ErrorCode.USER_NOT_FOUND, message: '유저를 찾을 수 없습니다.' });
    }
    if (user.status === UserStatus.DELETED || user.deletedAt !== null) {
      throw new ForbiddenException({ code: ErrorCode.USER_DELETED, message: '이미 탈퇴한 계정입니다.' });
    }

    await this.prisma.$transaction([
      // 세션 삭제 (자동 로그아웃)
      this.prisma.session.deleteMany({ where: { userId: id } }),
      // PII 즉시 파기 + Soft Delete
      this.prisma.user.update({
        where: { id },
        data: {
          status: UserStatus.DELETED,
          deletedAt: new Date(),
          // PII null 처리
          name: null,
          email: null,
          passwordHash: null,
          avatarUrl: null,
          birthYear: null,
        },
      }),
    ]);
  }

  /** 로그인 시 bcrypt 비교용 */
  async findByEmailForAuth(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
