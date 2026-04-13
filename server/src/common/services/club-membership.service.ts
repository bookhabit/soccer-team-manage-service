import { ForbiddenException, Injectable } from '@nestjs/common';
import { ClubRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorCode } from '../constants/error-codes';

@Injectable()
export class ClubMembershipService {
  constructor(private readonly prisma: PrismaService) {}

  async assertMember(clubId: string, userId: string) {
    const member = await this.prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } },
      select: { role: true },
    });
    if (!member) {
      throw new ForbiddenException({
        code: ErrorCode.CLUB_NO_PERMISSION,
        message: '해당 클럽의 팀원이 아닙니다.',
      });
    }
    return member;
  }

  async assertCaptainOrVice(clubId: string, userId: string) {
    const member = await this.assertMember(clubId, userId);
    if (member.role !== ClubRole.CAPTAIN && member.role !== ClubRole.VICE_CAPTAIN) {
      throw new ForbiddenException({
        code: ErrorCode.CLUB_NO_PERMISSION,
        message: '주장 또는 부주장만 수행할 수 있습니다.',
      });
    }
    return member;
  }

  async assertCaptain(clubId: string, userId: string) {
    const member = await this.assertMember(clubId, userId);
    if (member.role !== ClubRole.CAPTAIN) {
      throw new ForbiddenException({
        code: ErrorCode.CLUB_NO_PERMISSION,
        message: '주장만 수행할 수 있습니다.',
      });
    }
    return member;
  }
}
