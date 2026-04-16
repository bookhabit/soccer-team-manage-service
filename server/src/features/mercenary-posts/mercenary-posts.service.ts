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
  MercenaryPostStatus,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorCode } from '../../common/constants/error-codes';
import type { CreateMercenaryPostDto } from './dto/create-mercenary-post.dto';
import type { UpdateMercenaryPostDto } from './dto/update-mercenary-post.dto';
import type { FilterMercenaryPostDto } from './dto/filter-mercenary-post.dto';
import type { CreateMercenaryApplicationDto } from './dto/create-mercenary-application.dto';

const DEFAULT_LIMIT = 20;

// ─── Select 상수 ─────────────────────────────────────────────────────────────

const MERCENARY_POST_SELECT = {
  id: true,
  clubId: true,
  matchDate: true,
  startTime: true,
  endTime: true,
  location: true,
  address: true,
  positions: true,
  requiredCount: true,
  acceptedCount: true,
  level: true,
  fee: true,
  status: true,
  createdAt: true,
  club: {
    select: { name: true, logoUrl: true, level: true },
  },
  region: {
    select: { name: true, sigungu: true },
  },
} as const;

// ─── 헬퍼 ────────────────────────────────────────────────────────────────────

function buildPostCard(post: any) {
  return {
    id: post.id,
    clubId: post.clubId,
    clubName: post.club.name,
    clubLogoUrl: post.club.logoUrl ?? null,
    clubLevel: post.club.level,
    positions: post.positions,
    requiredCount: post.requiredCount,
    acceptedCount: post.acceptedCount,
    matchDate: post.matchDate,
    startTime: post.startTime,
    endTime: post.endTime,
    location: post.location,
    address: post.address ?? null,
    level: post.level,
    fee: post.fee,
    status: post.status,
    isExpired: new Date(post.matchDate) < new Date(),
    createdAt: post.createdAt,
    regionName: post.region.name,
    regionSigungu: post.region.sigungu,
  };
}

@Injectable()
export class MercenaryPostsService {
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

  async getList(userId: string, dto: FilterMercenaryPostDto) {
    const limit = dto.limit ?? DEFAULT_LIMIT;
    const now = new Date();

    // 블랙리스트 유저 목록 조회 (제외 대상)
    const blacklistedUsers = await this.prisma.user.findMany({
      where: {
        OR: [
          { mannerScore: { lte: 20 } },
          { status: UserStatus.RESTRICTED },
        ],
      },
      select: { id: true },
    });
    // 노쇼 3회 이상 유저 추가
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
      createdBy: { notIn: blacklistedUserIds },
    };

    if (!dto.includeExpired) {
      where.matchDate = { gte: now };
    }
    if (!dto.includeClosed) {
      where.status = MercenaryPostStatus.OPEN;
    }

    if (dto.dateFrom || dto.dateTo) {
      where.matchDate = {
        ...(where.matchDate ?? {}),
        ...(dto.dateFrom ? { gte: new Date(dto.dateFrom) } : {}),
        ...(dto.dateTo ? { lte: new Date(dto.dateTo) } : {}),
      };
    }

    if (dto.regionId) where.regionId = dto.regionId;
    if (dto.level) where.level = dto.level;
    if (dto.positions?.length) {
      where.positions = { hasSome: dto.positions };
    }

    const posts = await this.prisma.mercenaryPost.findMany({
      where,
      select: MERCENARY_POST_SELECT,
      orderBy: { matchDate: 'asc' },
      take: limit + 1,
      ...(dto.cursor ? { cursor: { id: dto.cursor }, skip: 1 } : {}),
    });

    const hasNext = posts.length > limit;
    const items = hasNext ? posts.slice(0, limit) : posts;
    const nextCursor = hasNext ? items[items.length - 1].id : null;

    return { items: items.map(buildPostCard), nextCursor };
  }

  // ─── 내 팀 게시글 목록 ────────────────────────────────────────────────────

  async getMyPosts(userId: string) {
    const myClub = await this.prisma.clubMember.findFirst({
      where: { userId, role: { in: [ClubRole.CAPTAIN, ClubRole.VICE_CAPTAIN] } },
      select: { clubId: true },
    });
    if (!myClub) return { items: [] };

    const posts = await this.prisma.mercenaryPost.findMany({
      where: { clubId: myClub.clubId, isDeleted: false },
      select: MERCENARY_POST_SELECT,
      orderBy: { matchDate: 'desc' },
    });

    return { items: posts.map(buildPostCard) };
  }

  // ─── 상세 조회 ────────────────────────────────────────────────────────────

  async getDetail(id: string, userId: string) {
    const post = await this.prisma.mercenaryPost.findFirst({
      where: { id, isDeleted: false },
      select: {
        ...MERCENARY_POST_SELECT,
        description: true,
        contactName: true,
        contactPhone: true,
        createdBy: true,
        applications: {
          where: { applicantId: userId },
          select: { status: true },
        },
      },
    });

    if (!post) {
      throw new NotFoundException({
        code: ErrorCode.MERCENARY_POST_001,
        message: '존재하지 않는 게시글입니다.',
      });
    }

    const myClub = await this.prisma.clubMember.findFirst({
      where: { userId, role: { in: [ClubRole.CAPTAIN, ClubRole.VICE_CAPTAIN] } },
      select: { clubId: true },
    });

    const isExpired = new Date(post.matchDate) < new Date();
    const isOwnPost = post.clubId === myClub?.clubId;
    const myApp = post.applications[0] ?? null;
    const alreadyApplied = !!myApp;
    const canApply =
      !isExpired &&
      post.status === MercenaryPostStatus.OPEN &&
      !isOwnPost &&
      !alreadyApplied;

    const { applications: _apps, ...rest } = post;
    return {
      ...buildPostCard(rest),
      description: post.description ?? null,
      contactName: post.contactName,
      contactPhone: post.contactPhone,
      isOwnPost,
      canApply,
      alreadyApplied,
      myApplicationStatus: myApp?.status ?? null,
    };
  }

  // ─── 등록 ──────────────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateMercenaryPostDto) {
    const myClub = await this.prisma.clubMember.findFirst({
      where: { userId, role: { in: [ClubRole.CAPTAIN, ClubRole.VICE_CAPTAIN] } },
      select: { clubId: true },
    });
    if (!myClub) {
      throw new ForbiddenException({
        code: ErrorCode.CLUB_NO_PERMISSION,
        message: '주장 또는 부주장만 등록할 수 있습니다.',
      });
    }

    if (await this.isBlacklisted(userId)) {
      throw new ForbiddenException({
        code: ErrorCode.MERCENARY_BLACKLIST,
        message: '블랙리스트 상태에서는 게시글을 등록할 수 없습니다.',
      });
    }

    return this.prisma.mercenaryPost.create({
      data: {
        clubId: myClub.clubId,
        createdBy: userId,
        regionId: dto.regionId,
        positions: dto.positions,
        requiredCount: dto.requiredCount,
        matchDate: new Date(dto.matchDate),
        startTime: dto.startTime,
        endTime: dto.endTime,
        location: dto.location,
        address: dto.address,
        level: dto.level,
        fee: dto.fee,
        description: dto.description,
        contactName: dto.contactName,
        contactPhone: dto.contactPhone,
      },
      select: { id: true },
    });
  }

  // ─── 수정 ──────────────────────────────────────────────────────────────────

  async update(id: string, userId: string, dto: UpdateMercenaryPostDto) {
    const post = await this.prisma.mercenaryPost.findFirst({
      where: { id, isDeleted: false },
      select: { createdBy: true, clubId: true, status: true },
    });
    if (!post) {
      throw new NotFoundException({
        code: ErrorCode.MERCENARY_POST_001,
        message: '존재하지 않는 게시글입니다.',
      });
    }
    if (post.createdBy !== userId) {
      throw new ForbiddenException({
        code: ErrorCode.MERCENARY_POST_002,
        message: '게시글 등록자만 수정할 수 있습니다.',
      });
    }
    if (post.status !== MercenaryPostStatus.OPEN) {
      throw new ConflictException({
        code: ErrorCode.MERCENARY_POST_003,
        message: 'OPEN 상태에서만 수정할 수 있습니다.',
      });
    }

    await this.prisma.mercenaryPost.update({
      where: { id },
      data: {
        ...(dto.positions !== undefined && { positions: dto.positions }),
        ...(dto.requiredCount !== undefined && { requiredCount: dto.requiredCount }),
        ...(dto.matchDate !== undefined && { matchDate: new Date(dto.matchDate) }),
        ...(dto.startTime !== undefined && { startTime: dto.startTime }),
        ...(dto.endTime !== undefined && { endTime: dto.endTime }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.regionId !== undefined && { regionId: dto.regionId }),
        ...(dto.level !== undefined && { level: dto.level }),
        ...(dto.fee !== undefined && { fee: dto.fee }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.contactName !== undefined && { contactName: dto.contactName }),
        ...(dto.contactPhone !== undefined && { contactPhone: dto.contactPhone }),
      },
    });
  }

  // ─── 삭제 ──────────────────────────────────────────────────────────────────

  async softDelete(id: string, userId: string) {
    const post = await this.prisma.mercenaryPost.findFirst({
      where: { id, isDeleted: false },
      select: { createdBy: true },
    });
    if (!post) {
      throw new NotFoundException({
        code: ErrorCode.MERCENARY_POST_001,
        message: '존재하지 않는 게시글입니다.',
      });
    }
    if (post.createdBy !== userId) {
      throw new ForbiddenException({
        code: ErrorCode.MERCENARY_POST_002,
        message: '게시글 등록자만 삭제할 수 있습니다.',
      });
    }

    await this.prisma.mercenaryPost.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  // ─── 입단 신청 ────────────────────────────────────────────────────────────

  async apply(postId: string, userId: string, dto: CreateMercenaryApplicationDto) {
    const post = await this.prisma.mercenaryPost.findFirst({
      where: { id: postId, isDeleted: false },
      select: { clubId: true, status: true, matchDate: true, createdBy: true },
    });
    if (!post) {
      throw new NotFoundException({
        code: ErrorCode.MERCENARY_POST_001,
        message: '존재하지 않는 게시글입니다.',
      });
    }
    if (new Date(post.matchDate) < new Date()) {
      throw new GoneException({
        code: ErrorCode.MERCENARY_POST_004,
        message: '만료된 게시글입니다.',
      });
    }
    if (post.status !== MercenaryPostStatus.OPEN) {
      throw new ConflictException({
        code: ErrorCode.MERCENARY_POST_003,
        message: '이미 마감된 게시글입니다.',
      });
    }

    // 본인 팀 게시글 지원 불가
    const myMembership = await this.prisma.clubMember.findFirst({
      where: { userId },
      select: { clubId: true },
    });
    if (myMembership?.clubId === post.clubId) {
      throw new ForbiddenException({
        code: ErrorCode.MERCENARY_POST_005,
        message: '본인 팀 게시글에는 지원할 수 없습니다.',
      });
    }

    // 블랙리스트 체크
    if (await this.isBlacklisted(userId)) {
      throw new ForbiddenException({
        code: ErrorCode.MERCENARY_BLACKLIST,
        message: '지원이 제한된 계정입니다.',
      });
    }

    // 중복 지원 체크
    const existing = await this.prisma.mercenaryApplication.findUnique({
      where: { postId_applicantId: { postId, applicantId: userId } },
    });
    if (existing) {
      throw new ConflictException({
        code: ErrorCode.MERCENARY_POST_006,
        message: '이미 지원한 게시글입니다.',
      });
    }

    await this.prisma.mercenaryApplication.create({
      data: {
        postId,
        applicantId: userId,
        message: dto.message,
      },
    });

    // TODO: 팀 관리자에게 알림 (콘솔 로그)
    console.log(`[MERCENARY] 입단 신청 — postId: ${postId}, applicantId: ${userId}`);
  }

  // ─── 지원자 목록 ─────────────────────────────────────────────────────────

  async getApplications(postId: string, userId: string) {
    const post = await this.prisma.mercenaryPost.findFirst({
      where: { id: postId, isDeleted: false },
      select: { createdBy: true },
    });
    if (!post) {
      throw new NotFoundException({
        code: ErrorCode.MERCENARY_POST_001,
        message: '존재하지 않는 게시글입니다.',
      });
    }
    if (post.createdBy !== userId) {
      throw new ForbiddenException({
        code: ErrorCode.MERCENARY_POST_007,
        message: '지원자 목록은 게시글 등록자만 조회할 수 있습니다.',
      });
    }

    const apps = await this.prisma.mercenaryApplication.findMany({
      where: { postId },
      select: {
        id: true,
        postId: true,
        applicantId: true,
        message: true,
        status: true,
        createdAt: true,
        applicant: {
          select: {
            name: true,
            avatarUrl: true,
            level: true,
            position: true,
            mannerScore: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const items = await Promise.all(
      apps.map(async (app) => {
        const mercenaryCount = await this.prisma.mercenaryApplication.count({
          where: { applicantId: app.applicantId, status: MercenaryApplicationStatus.ACCEPTED },
        });
        return {
          id: app.id,
          postId: app.postId,
          applicantId: app.applicantId,
          applicantName: app.applicant.name ?? '',
          applicantLevel: app.applicant.level ?? null,
          applicantPosition: app.applicant.position ?? null,
          applicantAvatarUrl: app.applicant.avatarUrl ?? null,
          applicantMannerScore: app.applicant.mannerScore,
          mercenaryMatchCount: mercenaryCount,
          message: app.message ?? null,
          status: app.status,
          createdAt: app.createdAt,
        };
      }),
    );

    return { items };
  }

  // ─── 수락 ──────────────────────────────────────────────────────────────────

  async accept(postId: string, appId: string, userId: string) {
    const post = await this.prisma.mercenaryPost.findFirst({
      where: { id: postId, isDeleted: false },
      select: { createdBy: true, status: true, requiredCount: true, acceptedCount: true },
    });
    if (!post) {
      throw new NotFoundException({
        code: ErrorCode.MERCENARY_POST_001,
        message: '존재하지 않는 게시글입니다.',
      });
    }
    if (post.createdBy !== userId) {
      throw new ForbiddenException({
        code: ErrorCode.MERCENARY_POST_007,
        message: '권한이 없습니다.',
      });
    }

    const app = await this.prisma.mercenaryApplication.findFirst({
      where: { id: appId, postId },
      select: { status: true, applicantId: true },
    });
    if (!app) {
      throw new NotFoundException({
        code: ErrorCode.MERCENARY_APP_001,
        message: '존재하지 않는 신청입니다.',
      });
    }
    if (app.status !== MercenaryApplicationStatus.PENDING) {
      throw new ConflictException({
        code: ErrorCode.MERCENARY_APP_002,
        message: '이미 처리된 신청입니다.',
      });
    }

    const newAcceptedCount = post.acceptedCount + 1;
    const willClose = newAcceptedCount >= post.requiredCount;

    await this.prisma.$transaction(async (tx) => {
      // 수락 처리
      await tx.mercenaryApplication.update({
        where: { id: appId },
        data: { status: MercenaryApplicationStatus.ACCEPTED },
      });

      // acceptedCount +1
      await tx.mercenaryPost.update({
        where: { id: postId },
        data: { acceptedCount: { increment: 1 } },
      });

      if (willClose) {
        // 게시글 자동 CLOSED
        await tx.mercenaryPost.update({
          where: { id: postId },
          data: { status: MercenaryPostStatus.CLOSED },
        });
        // 잔여 PENDING 일괄 거절
        const rejected = await tx.mercenaryApplication.updateMany({
          where: {
            postId,
            status: MercenaryApplicationStatus.PENDING,
            id: { not: appId },
          },
          data: { status: MercenaryApplicationStatus.REJECTED },
        });
        // TODO: 거절 알림 (콘솔 로그)
        console.log(`[MERCENARY] 게시글 자동 CLOSED — postId: ${postId}, 거절된 신청: ${rejected.count}건`);
      }
    });

    // TODO: 양측 연락처 인앱 알림
    console.log(`[MERCENARY] 수락 완료 — postId: ${postId}, appId: ${appId}, applicantId: ${app.applicantId}`);

    // 수락된 지원자와 등록자 연락처 반환
    const [applicantUser, postCreator] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: app.applicantId },
        select: { name: true, phone: true },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, phone: true },
      }),
    ]);

    return {
      contact: {
        applicant: { name: applicantUser?.name ?? '', phone: applicantUser?.phone ?? '' },
        postCreator: { name: postCreator?.name ?? '', phone: postCreator?.phone ?? '' },
      },
    };
  }

  // ─── 거절 ──────────────────────────────────────────────────────────────────

  async reject(postId: string, appId: string, userId: string) {
    const post = await this.prisma.mercenaryPost.findFirst({
      where: { id: postId, isDeleted: false },
      select: { createdBy: true },
    });
    if (!post) {
      throw new NotFoundException({
        code: ErrorCode.MERCENARY_POST_001,
        message: '존재하지 않는 게시글입니다.',
      });
    }
    if (post.createdBy !== userId) {
      throw new ForbiddenException({
        code: ErrorCode.MERCENARY_POST_007,
        message: '권한이 없습니다.',
      });
    }

    const app = await this.prisma.mercenaryApplication.findFirst({
      where: { id: appId, postId },
      select: { status: true, applicantId: true },
    });
    if (!app) {
      throw new NotFoundException({
        code: ErrorCode.MERCENARY_APP_001,
        message: '존재하지 않는 신청입니다.',
      });
    }
    if (app.status !== MercenaryApplicationStatus.PENDING) {
      throw new ConflictException({
        code: ErrorCode.MERCENARY_APP_002,
        message: '이미 처리된 신청입니다.',
      });
    }

    await this.prisma.mercenaryApplication.update({
      where: { id: appId },
      data: { status: MercenaryApplicationStatus.REJECTED },
    });

    // TODO: 지원자에게 거절 알림
    console.log(`[MERCENARY] 거절 — appId: ${appId}, applicantId: ${app.applicantId}`);
  }
}
