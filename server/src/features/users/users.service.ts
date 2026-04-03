import { ConflictException, Injectable } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { ErrorCode } from "../../common/constants/error-codes";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateUserDto } from "./dto/create-user.dto";
import type { UpdateProfileDto } from "./dto/update-profile.dto";

const SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) {
      throw new ConflictException({
        code: ErrorCode.EMAIL_ALREADY_EXISTS,
        message: "이미 사용 중인 이메일입니다.",
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: { email: dto.email, passwordHash, nickname: dto.nickname },
      select: { id: true, email: true, nickname: true, createdAt: true },
    });

    return user;
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nickname: true,
        position: true,
        skillLevel: true,
      },
    });
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        nickname: true,
        position: true,
        skillLevel: true,
      },
    });
  }

  /** 로그인 시 bcrypt 비교용 — 타이밍 공격 방지를 위해 항상 compare 수행 */
  async findByEmailForAuth(email: string) {
    // 전체 유저를 한번 찍어봅니다 (데이터가 적을 때만 사용)
    const allUsers = await this.prisma.user.findMany();
    console.log(
      "📋 DB 내 전체 유저 이메일 목록:",
      allUsers.map((u) => `|${u.email}|`),
    );
    return this.prisma.user.findUnique({ where: { email } });
  }
}
