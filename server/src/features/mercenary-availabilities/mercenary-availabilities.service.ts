import {
  ConflictException,
  ForbiddenException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ClubRole,
  MercenaryApplicationStatus,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorCode } from '../../common/constants/error-codes';
import type { CreateMercenaryAvailabilityDto } from './dto/create-mercenary-availability.dto';
import type { UpdateMercenaryAvailabilityDto } from './dto/update-mercenary-availability.dto';
import type { FilterMercenaryAvailabilityDto } from './dto/filter-mercenary-availability.dto';
import type { CreateMercenaryRecruitmentDto } from './dto/create-mercenary-recruitment.dto';

const DEFAULT_LIMIT = 20;

// ─── 헬퍼 ────────────────────────────────────────────────────────────────────

function isAvailabilityExpired(availableDates: Date[]): boolean {
  if (!availableDates.length) return true;
  const maxDate = new Date(Math.max(...availableDates.map((d) => new Date(d).getTime())));
  return maxDate < new Date();
}

@Injectable()
export class MercenaryAvailabilitiesService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── 블랙리스트 판단 헬퍼 ─────────────────────────────────────────────────

  private async isBlacklisted(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { mannerScore: true, status: true },
    });
    if (!user) return false;
    if (user.mannerScore <= 20) return true;
    if (user.status === UserStatus.RESTRICTED) return true;

    const noShowCount = await this.prisma.noShowReport.count({
      where: { reportedUserId: userId, status: 'APPROVED' },
    });
    return noShowCount >= 3;
  }

  // ─── 목록 조회 ────────────────────────────────────────────────────────────

  async getList(userId: string, dto: FilterMercenaryAvailabilityDto) {
    const limit = dto.limit ?? DEFAULT_LIMIT;
    const now = new Date();

    // 블랙리스트 유저 제외
    const blacklistedUsers = await this.prisma.user.findMany({
      where: {
        OR: [
          { mannerScore: { lte: 20 } },
          { status: UserStatus.RESTRICTED },
        ],
      },
      select: { id: true },
    });
    const noShowUsers = await this.prisma.noShowReport.groupBy({
      by: ['reportedUserId'],
      where: { status: 'APPROVED' },
      having: { reportedUserId: { _count: { gte: 3 } } },
    });
    const blacklistedUserIds = [
      ...blacklistedUsers.map((u) => u.id),
      ...noShowUsers.map((u) => u.reportedUserId),
    ];

    const where: any = {
      isDeleted: false,
      userId: { notIn: blacklistedUserIds },
    };

    // 만료 제외: availableDates 배열의 MAX가 now 이상인 것
    if (!dto.includeExpired) {
      where.availableDates = { hasSome: [] }; // 최소 1개 이상
      // Prisma에서 배열 MAX 필터는 raw query가 필요하므로 후처리로 필터링
    }

    if (dto.positions?.length) {
      where.positions = { hasSome: dto.positions };
    }
    if (dto.regionId) {
      where.regionIds = { has: dto.regionId };
    }
    if (dto.date) {
      where.availableDates = { has: new Date(dto.date) };
    }

    const avails = await this.prisma.mercenaryAvailability.findMany({
      where,
      select: {
        id: true,
        userId: true,
        positions: true,
        availableDates: true,
        regionIds: true,
        timeSlot: true,
        acceptsFee: true,
        isDeleted: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            avatarUrl: true,
            level: true,
            mannerScore: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: (limit + 1) * 2, // 만료 필터 후처리를 위해 여분 조회
      ...(dto.cursor ? { cursor: { id: dto.cursor }, skip: 1 } : {}),
    });

    // 레벨 필터 (user.level 기반)
    let filtered = avails;
    if (dto.level) {
      filtered = avails.filter((a) => a.user.level === dto.level);
    }
    // 만료 필터 후처리
    if (!dto.includeExpired) {
      filtered = filtered.filter((a) => !isAvailabilityExpired(a.availableDates));
    }

    const hasNext = filtered.length > limit;
    const items = hasNext ? filtered.slice(0, limit) : filtered;
    const nextCursor = hasNext ? items[items.length - 1].id : null;

    // mercenaryMatchCount는 N+1을 피하기 위해 별도 집계
    const userIds = items.map((a) => a.userId);
    const matchCounts = await this.prisma.mercenaryApplication.groupBy({
      by: ['applicantId'],
      where: {
        applicantId: { in: userIds },
        status: MercenaryApplicationStatus.ACCEPTED,
      },
      _count: { applicantId: true },
    });
    const matchCountMap = Object.fromEntries(
      matchCounts.map((m) => [m.applicantId, m._count.applicantId]),
    );

    // 지역명 조회
    const allRegionIds = [...new Set(items.flatMap((a) => a.regionIds))];
    const regions = await this.prisma.region.findMany({
      where: { id: { in: allRegionIds } },
      select: { id: true, name: true, sigungu: true },
    });
    const regionMap = Object.fromEntries(regions.map((r) => [r.id, r]));

    return {
      items: items.map((a) => ({
        id: a.id,
        userId: a.userId,
        userName: a.user.name ?? '',
        userAvatarUrl: a.user.avatarUrl ?? null,
        userLevel: a.user.level ?? null,
        positions: a.positions,
        availableDates: a.availableDates,
        regionNames: a.regionIds.map((rid) => regionMap[rid]?.sigungu ?? rid),
        timeSlot: a.timeSlot ?? null,
        acceptsFee: a.acceptsFee,
        isExpired: isAvailabilityExpired(a.availableDates),
        mannerScore: a.user.mannerScore,
        mercenaryMatchCount: matchCountMap[a.userId] ?? 0,
        createdAt: a.createdAt,
      })),
      nextCursor,
    };
  }

  // ─── 내 게시글 목록 ───────────────────────────────────────────────────────

  async getMyAvailabilities(userId: string) {
    const avails = await this.prisma.mercenaryAvailability.findMany({
      where: { userId, isDeleted: false },
      select: {
        id: true,
        userId: true,
        positions: true,
        availableDates: true,
        regionIds: true,
        timeSlot: true,
        bio: true,
        acceptsFee: true,
        createdAt: true,
        user: {
          select: { name: true, avatarUrl: true, level: true, mannerScore: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const allRegionIds = [...new Set(avails.flatMap((a) => a.regionIds))];
    const regions = await this.prisma.region.findMany({
      where: { id: { in: allRegionIds } },
      select: { id: true, name: true, sigungu: true },
    });
    const regionMap = Object.fromEntries(regions.map((r) => [r.id, r]));

    return {
      items: avails.map((a) => ({
        id: a.id,
        userId: a.userId,
        userName: a.user.name ?? '',
        userAvatarUrl: a.user.avatarUrl ?? null,
        userLevel: a.user.level ?? null,
        positions: a.positions,
        availableDates: a.availableDates,
        regionNames: a.regionIds.map((rid) => regionMap[rid]?.sigungu ?? rid),
        timeSlot: a.timeSlot ?? null,
        bio: a.bio ?? null,
        acceptsFee: a.acceptsFee,
        isExpired: isAvailabilityExpired(a.availableDates),
        mannerScore: a.user.mannerScore,
        createdAt: a.createdAt,
      })),
    };
  }

  // ─── 내가 받은 영입 신청 ──────────────────────────────────────────────────

  async getMyRecruitments(userId: string) {
    const recruitments = await this.prisma.mercenaryRecruitment.findMany({
      where: { availability: { userId, isDeleted: false } },
      select: {
        id: true,
        availabilityId: true,
        recruitingClubId: true,
        message: true,
        contactName: true,
        contactPhone: true,
        status: true,
        createdAt: true,
        recruitingClub: { select: { name: true, level: true, logoUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      items: recruitments.map((r) => ({
        id: r.id,
        availabilityId: r.availabilityId,
        recruitingClubId: r.recruitingClubId,
        recruitingClubName: r.recruitingClub.name,
        recruitingClubLevel: r.recruitingClub.level,
        recruitingClubLogoUrl: r.recruitingClub.logoUrl ?? null,
        message: r.message ?? null,
        contactName: r.contactName,
        contactPhone: r.contactPhone,
        status: r.status,
        createdAt: r.createdAt,
      })),
    };
  }

  // ─── 상세 조회 ────────────────────────────────────────────────────────────

  async getDetail(id: string, userId: string) {
    const avail = await this.prisma.mercenaryAvailability.findFirst({
      where: { id, isDeleted: false },
      select: {
        id: true,
        userId: true,
        positions: true,
        availableDates: true,
        regionIds: true,
        timeSlot: true,
        bio: true,
        acceptsFee: true,
        createdAt: true,
        user: {
          select: { name: true, avatarUrl: true, level: true, mannerScore: true, birthYear: true },
        },
      },
    });

    if (!avail) {
      throw new NotFoundException({
        code: ErrorCode.MERCENARY_AVAIL_001,
        message: '존재하지 않는 게시글입니다.',
      });
    }

    const isExpired = isAvailabilityExpired(avail.availableDates);

    const myClub = await this.prisma.clubMember.findFirst({
      where: { userId, role: { in: [ClubRole.CAPTAIN, ClubRole.VICE_CAPTAIN] } },
      select: { clubId: true },
    });

    const isOwnPost = avail.userId === userId;
    let alreadyRecruited = false;
    if (myClub) {
      const existing = await this.prisma.mercenaryRecruitment.findUnique({
        where: {
          availabilityId_recruitingClubId: {
            availabilityId: id,
            recruitingClubId: myClub.clubId,
          },
        },
      });
      alreadyRecruited = !!existing;
    }

    const canRecruit = !!myClub && !isOwnPost && !isExpired && !alreadyRecruited;

    const allRegionIds = avail.regionIds;
    const regions = await this.prisma.region.findMany({
      where: { id: { in: allRegionIds } },
      select: { id: true, name: true, sigungu: true },
    });
    const regionMap = Object.fromEntries(regions.map((r) => [r.id, r]));

    const mercenaryMatchCount = await this.prisma.mercenaryApplication.count({
      where: { applicantId: avail.userId, status: MercenaryApplicationStatus.ACCEPTED },
    });

    const currentYear = new Date().getFullYear();
    const age = avail.user.birthYear ? currentYear - avail.user.birthYear : null;

    return {
      id: avail.id,
      userId: avail.userId,
      userName: avail.user.name ?? '',
      userAvatarUrl: avail.user.avatarUrl ?? null,
      userLevel: avail.user.level ?? null,
      age,
      positions: avail.positions,
      availableDates: avail.availableDates,
      regionNames: allRegionIds.map((rid) => regionMap[rid]?.sigungu ?? rid),
      timeSlot: avail.timeSlot ?? null,
      bio: avail.bio ?? null,
      acceptsFee: avail.acceptsFee,
      isExpired,
      mannerScore: avail.user.mannerScore,
      mercenaryMatchCount,
      createdAt: avail.createdAt,
      isOwnPost,
      canRecruit,
      alreadyRecruited,
    };
  }

  // ─── 등록 ──────────────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateMercenaryAvailabilityDto) {
    if (await this.isBlacklisted(userId)) {
      throw new ForbiddenException({
        code: ErrorCode.MERCENARY_BLACKLIST,
        message: '블랙리스트 상태에서는 게시글을 등록할 수 없습니다.',
      });
    }

    return this.prisma.mercenaryAvailability.create({
      data: {
        userId,
        positions: dto.positions,
        availableDates: dto.availableDates.map((d) => new Date(d)),
        regionIds: dto.regionIds,
        timeSlot: dto.timeSlot,
        bio: dto.bio,
        acceptsFee: dto.acceptsFee,
      },
      select: { id: true },
    });
  }

  // ─── 수정 ──────────────────────────────────────────────────────────────────

  async update(id: string, userId: string, dto: UpdateMercenaryAvailabilityDto) {
    const avail = await this.prisma.mercenaryAvailability.findFirst({
      where: { id, isDeleted: false },
      select: { userId: true, availableDates: true },
    });
    if (!avail) {
      throw new NotFoundException({
        code: ErrorCode.MERCENARY_AVAIL_001,
        message: '존재하지 않는 게시글입니다.',
      });
    }
    if (avail.userId !== userId) {
      throw new ForbiddenException({
        code: ErrorCode.MERCENARY_AVAIL_002,
        message: '게시글 등록자만 수정할 수 있습니다.',
      });
    }
    if (isAvailabilityExpired(avail.availableDates)) {
      throw new GoneException({
        code: ErrorCode.MERCENARY_AVAIL_003,
        message: '만료된 게시글입니다.',
      });
    }

    await this.prisma.mercenaryAvailability.update({
      where: { id },
      data: {
        ...(dto.positions !== undefined && { positions: dto.positions }),
        ...(dto.availableDates !== undefined && {
          availableDates: dto.availableDates.map((d) => new Date(d)),
        }),
        ...(dto.regionIds !== undefined && { regionIds: dto.regionIds }),
        ...(dto.timeSlot !== undefined && { timeSlot: dto.timeSlot }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.acceptsFee !== undefined && { acceptsFee: dto.acceptsFee }),
      },
    });
  }

  // ─── 삭제 ──────────────────────────────────────────────────────────────────

  async softDelete(id: string, userId: string) {
    const avail = await this.prisma.mercenaryAvailability.findFirst({
      where: { id, isDeleted: false },
      select: { userId: true },
    });
    if (!avail) {
      throw new NotFoundException({
        code: ErrorCode.MERCENARY_AVAIL_001,
        message: '존재하지 않는 게시글입니다.',
      });
    }
    if (avail.userId !== userId) {
      throw new ForbiddenException({
        code: ErrorCode.MERCENARY_AVAIL_002,
        message: '게시글 등록자만 삭제할 수 있습니다.',
      });
    }

    await this.prisma.mercenaryAvailability.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  // ─── 영입 신청 ────────────────────────────────────────────────────────────

  async recruit(availId: string, userId: string, dto: CreateMercenaryRecruitmentDto) {
    const avail = await this.prisma.mercenaryAvailability.findFirst({
      where: { id: availId, isDeleted: false },
      select: { userId: true, availableDates: true },
    });
    if (!avail) {
      throw new NotFoundException({
        code: ErrorCode.MERCENARY_AVAIL_001,
        message: '존재하지 않는 게시글입니다.',
      });
    }
    if (isAvailabilityExpired(avail.availableDates)) {
      throw new GoneException({
        code: ErrorCode.MERCENARY_AVAIL_003,
        message: '만료된 게시글입니다.',
      });
    }
    if (avail.userId === userId) {
      throw new ForbiddenException({
        code: ErrorCode.MERCENARY_AVAIL_005,
        message: '본인 게시글에는 영입 신청을 할 수 없습니다.',
      });
    }

    const myClub = await this.prisma.clubMember.findFirst({
      where: { userId, role: { in: [ClubRole.CAPTAIN, ClubRole.VICE_CAPTAIN] } },
      select: { clubId: true },
    });
    if (!myClub) {
      throw new ForbiddenException({
        code: ErrorCode.CLUB_NO_PERMISSION,
        message: '주장 또는 부주장만 영입 신청할 수 있습니다.',
      });
    }

    if (await this.isBlacklisted(userId)) {
      throw new ForbiddenException({
        code: ErrorCode.MERCENARY_BLACKLIST,
        message: '영입 신청이 제한된 계정입니다.',
      });
    }

    // 중복 영입 신청 체크
    const existing = await this.prisma.mercenaryRecruitment.findUnique({
      where: {
        availabilityId_recruitingClubId: {
          availabilityId: availId,
          recruitingClubId: myClub.clubId,
        },
      },
    });
    if (existing) {
      throw new ConflictException({
        code: ErrorCode.MERCENARY_AVAIL_004,
        message: '이미 영입 신청한 게시글입니다.',
      });
    }

    await this.prisma.mercenaryRecruitment.create({
      data: {
        availabilityId: availId,
        recruitingClubId: myClub.clubId,
        recruitedBy: userId,
        message: dto.message,
        contactName: dto.contactName,
        contactPhone: dto.contactPhone,
      },
    });

    // TODO: 개인 플레이어에게 영입 신청 알림
    console.log(`[MERCENARY] 영입 신청 — availId: ${availId}, clubId: ${myClub.clubId}`);
  }

  // ─── 영입 신청 수락 ───────────────────────────────────────────────────────

  async acceptRecruitment(availId: string, recId: string, userId: string) {
    const avail = await this.prisma.mercenaryAvailability.findFirst({
      where: { id: availId, isDeleted: false },
      select: { userId: true },
    });
    if (!avail) {
      throw new NotFoundException({
        code: ErrorCode.MERCENARY_AVAIL_001,
        message: '존재하지 않는 게시글입니다.',
      });
    }
    if (avail.userId !== userId) {
      throw new ForbiddenException({
        code: ErrorCode.MERCENARY_AVAIL_002,
        message: '게시글 등록자만 수락/거절할 수 있습니다.',
      });
    }

    const rec = await this.prisma.mercenaryRecruitment.findFirst({
      where: { id: recId, availabilityId: availId },
      select: { status: true, recruitedBy: true, contactName: true, contactPhone: true },
    });
    if (!rec) {
      throw new NotFoundException({
        code: ErrorCode.MERCENARY_APP_001,
        message: '존재하지 않는 신청입니다.',
      });
    }
    if (rec.status !== MercenaryApplicationStatus.PENDING) {
      throw new ConflictException({
        code: ErrorCode.MERCENARY_APP_002,
        message: '이미 처리된 신청입니다.',
      });
    }

    await this.prisma.mercenaryRecruitment.update({
      where: { id: recId },
      data: { status: MercenaryApplicationStatus.ACCEPTED },
    });

    // TODO: 팀 관리자에게 수락 알림
    console.log(`[MERCENARY] 영입 신청 수락 — recId: ${recId}, recruiter: ${rec.recruitedBy}`);

    // 양측 연락처 반환
    const player = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, phone: true },
    });

    return {
      contact: {
        player: { name: player?.name ?? '', phone: player?.phone ?? '' },
        club: { name: rec.contactName, phone: rec.contactPhone },
      },
    };
  }

  // ─── 영입 신청 거절 ───────────────────────────────────────────────────────

  async rejectRecruitment(availId: string, recId: string, userId: string) {
    const avail = await this.prisma.mercenaryAvailability.findFirst({
      where: { id: availId, isDeleted: false },
      select: { userId: true },
    });
    if (!avail) {
      throw new NotFoundException({
        code: ErrorCode.MERCENARY_AVAIL_001,
        message: '존재하지 않는 게시글입니다.',
      });
    }
    if (avail.userId !== userId) {
      throw new ForbiddenException({
        code: ErrorCode.MERCENARY_AVAIL_002,
        message: '권한이 없습니다.',
      });
    }

    const rec = await this.prisma.mercenaryRecruitment.findFirst({
      where: { id: recId, availabilityId: availId },
      select: { status: true, recruitedBy: true },
    });
    if (!rec) {
      throw new NotFoundException({
        code: ErrorCode.MERCENARY_APP_001,
        message: '존재하지 않는 신청입니다.',
      });
    }
    if (rec.status !== MercenaryApplicationStatus.PENDING) {
      throw new ConflictException({
        code: ErrorCode.MERCENARY_APP_002,
        message: '이미 처리된 신청입니다.',
      });
    }

    await this.prisma.mercenaryRecruitment.update({
      where: { id: recId },
      data: { status: MercenaryApplicationStatus.REJECTED },
    });

    // TODO: 팀 관리자에게 거절 알림
    console.log(`[MERCENARY] 영입 신청 거절 — recId: ${recId}`);
  }
}
