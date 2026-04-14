import {
  ConflictException,
  ForbiddenException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ClubRole,
  MatchApplicationStatus,
  MatchGender,
  MatchPostStatus,
  MatchType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ClubMembershipService } from '../../common/services/club-membership.service';
import { ErrorCode } from '../../common/constants/error-codes';
import type { CreateMatchPostDto } from './dto/create-match-post.dto';
import type { UpdateMatchPostDto } from './dto/update-match-post.dto';
import type { FilterMatchPostDto } from './dto/filter-match-post.dto';
import type { CreateMatchApplicationDto } from './dto/create-match-application.dto';

const DEFAULT_LIMIT = 20;

// ─── Select 상수 ─────────────────────────────────────────────────────────────

const MATCH_POST_SELECT = {
  id: true,
  clubId: true,
  matchDate: true,
  startTime: true,
  endTime: true,
  location: true,
  address: true,
  playerCount: true,
  gender: true,
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

function buildMatchPostCard(post: any) {
  return {
    id: post.id,
    clubId: post.clubId,
    clubName: post.club.name,
    clubLogoUrl: post.club.logoUrl ?? null,
    clubLevel: post.club.level,
    matchDate: post.matchDate,
    startTime: post.startTime,
    endTime: post.endTime,
    location: post.location,
    address: post.address ?? null,
    playerCount: post.playerCount,
    gender: post.gender,
    level: post.level,
    fee: post.fee,
    status: post.status,
    isExpired: new Date(post.matchDate) < new Date(),
    createdAt: post.createdAt,
    regionName: post.region.name,
    regionSigungu: post.region.sigungu,
  };
}

function combineDateTime(matchDate: string, time: string): Date {
  const datePart = new Date(matchDate).toISOString().slice(0, 10);
  return new Date(`${datePart}T${time}:00`);
}

@Injectable()
export class MatchPostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly membership: ClubMembershipService,
  ) {}

  // ─── 목록 조회 ────────────────────────────────────────────────────────────

  async getList(userId: string, dto: FilterMatchPostDto) {
    const limit = dto.limit ?? DEFAULT_LIMIT;
    const now = new Date();

    const where: any = { isDeleted: false };

    if (!dto.includeExpired) {
      where.matchDate = { gte: now };
    }

    if (!dto.includeMatched) {
      where.status = MatchPostStatus.OPEN;
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
    if (dto.gender) where.gender = dto.gender as MatchGender;
    if (dto.hasFee === true) where.fee = { gt: 0 };
    if (dto.hasFee === false) where.fee = 0;

    const posts = await this.prisma.matchPost.findMany({
      where,
      select: MATCH_POST_SELECT,
      orderBy: { matchDate: 'asc' },
      take: limit + 1,
      ...(dto.cursor ? { cursor: { id: dto.cursor }, skip: 1 } : {}),
    });

    const hasNext = posts.length > limit;
    const items = hasNext ? posts.slice(0, limit) : posts;
    const nextCursor = hasNext ? items[items.length - 1].id : null;

    return {
      items: items.map(buildMatchPostCard),
      nextCursor,
    };
  }

  // ─── 내 팀 게시글 목록 ────────────────────────────────────────────────────

  async getMyPosts(userId: string) {
    const myClub = await this.prisma.clubMember.findFirst({
      where: { userId, role: { in: [ClubRole.CAPTAIN, ClubRole.VICE_CAPTAIN] } },
      select: { clubId: true },
    });

    if (!myClub) return { items: [] };

    const posts = await this.prisma.matchPost.findMany({
      where: { clubId: myClub.clubId, isDeleted: false },
      select: MATCH_POST_SELECT,
      orderBy: { matchDate: 'desc' },
    });

    return { items: posts.map(buildMatchPostCard) };
  }

  // ─── 상세 조회 ────────────────────────────────────────────────────────────

  async getDetail(id: string, userId: string) {
    const post = await this.prisma.matchPost.findFirst({
      where: { id, isDeleted: false },
      select: {
        ...MATCH_POST_SELECT,
        contactName: true,
        contactPhone: true,
        status: true,
        applications: {
          where: { applicantUserId: userId },
          select: { status: true },
        },
      },
    });

    if (!post) {
      throw new NotFoundException({ code: ErrorCode.MATCH_POST_001, message: '존재하지 않는 매칭 게시글입니다.' });
    }

    const myMembership = await this.prisma.clubMember.findFirst({
      where: { userId, clubId: post.clubId },
    });
    const isOwnPost = !!myMembership;

    const isExpired = new Date(post.matchDate) < new Date();
    const alreadyApplied = post.applications.length > 0;
    const canApply = !isOwnPost && !isExpired && post.status === MatchPostStatus.OPEN && !alreadyApplied;

    let contactName: string | null = null;
    let contactPhone: string | null = null;

    if (post.status === MatchPostStatus.MATCHED) {
      const isPostOwnerAdmin = await this.prisma.clubMember.findFirst({
        where: { userId, clubId: post.clubId, role: { in: [ClubRole.CAPTAIN, ClubRole.VICE_CAPTAIN] } },
      });

      if (isPostOwnerAdmin) {
        const acceptedApp = await this.prisma.matchApplication.findFirst({
          where: { postId: id, status: MatchApplicationStatus.ACCEPTED },
          select: { contactName: true, contactPhone: true },
        });
        if (acceptedApp) {
          contactName = acceptedApp.contactName;
          contactPhone = acceptedApp.contactPhone;
        }
      } else {
        const acceptedApp = await this.prisma.matchApplication.findFirst({
          where: { postId: id, applicantUserId: userId, status: MatchApplicationStatus.ACCEPTED },
        });
        if (acceptedApp) {
          contactName = post.contactName;
          contactPhone = post.contactPhone;
        }
      }
    }

    return {
      ...buildMatchPostCard(post),
      isOwnPost,
      canApply,
      contactName,
      contactPhone,
    };
  }

  // ─── 게시글 등록 ──────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateMatchPostDto) {
    const memberClub = await this.prisma.clubMember.findFirst({
      where: { userId, role: { in: [ClubRole.CAPTAIN, ClubRole.VICE_CAPTAIN] } },
      select: { clubId: true },
    });

    if (!memberClub) {
      throw new ForbiddenException({ code: ErrorCode.CLUB_NO_PERMISSION, message: '주장·부주장만 매칭을 등록할 수 있습니다.' });
    }

    const post = await this.prisma.matchPost.create({
      data: {
        clubId: memberClub.clubId,
        createdBy: userId,
        regionId: dto.regionId,
        matchDate: new Date(dto.matchDate),
        startTime: dto.startTime,
        endTime: dto.endTime,
        location: dto.location,
        address: dto.address,
        playerCount: dto.playerCount,
        gender: dto.gender,
        level: dto.level,
        fee: dto.fee,
        contactName: dto.contactName,
        contactPhone: dto.contactPhone,
      },
      select: MATCH_POST_SELECT,
    });

    return buildMatchPostCard(post);
  }

  // ─── 게시글 수정 ──────────────────────────────────────────────────────────

  async update(id: string, userId: string, dto: UpdateMatchPostDto) {
    const post = await this.prisma.matchPost.findFirst({
      where: { id, isDeleted: false },
      select: { createdBy: true, status: true },
    });

    if (!post) {
      throw new NotFoundException({ code: ErrorCode.MATCH_POST_001, message: '존재하지 않는 매칭 게시글입니다.' });
    }
    if (post.createdBy !== userId) {
      throw new ForbiddenException({ code: ErrorCode.MATCH_POST_002, message: '수정 권한이 없습니다.' });
    }
    if (post.status === MatchPostStatus.MATCHED) {
      throw new ConflictException({ code: ErrorCode.MATCH_POST_003, message: '매칭 완료된 게시글은 수정할 수 없습니다.' });
    }

    const updated = await this.prisma.matchPost.update({
      where: { id },
      data: {
        ...(dto.matchDate !== undefined && { matchDate: new Date(dto.matchDate) }),
        ...(dto.startTime !== undefined && { startTime: dto.startTime }),
        ...(dto.endTime !== undefined && { endTime: dto.endTime }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.playerCount !== undefined && { playerCount: dto.playerCount }),
        ...(dto.gender !== undefined && { gender: dto.gender }),
        ...(dto.level !== undefined && { level: dto.level }),
        ...(dto.fee !== undefined && { fee: dto.fee }),
        ...(dto.contactName !== undefined && { contactName: dto.contactName }),
        ...(dto.contactPhone !== undefined && { contactPhone: dto.contactPhone }),
        ...(dto.regionId !== undefined && { regionId: dto.regionId }),
      },
      select: MATCH_POST_SELECT,
    });

    return buildMatchPostCard(updated);
  }

  // ─── 게시글 soft delete ───────────────────────────────────────────────────

  async softDelete(id: string, userId: string) {
    const post = await this.prisma.matchPost.findFirst({
      where: { id, isDeleted: false },
      select: { createdBy: true },
    });

    if (!post) {
      throw new NotFoundException({ code: ErrorCode.MATCH_POST_001, message: '존재하지 않는 매칭 게시글입니다.' });
    }
    if (post.createdBy !== userId) {
      throw new ForbiddenException({ code: ErrorCode.MATCH_POST_002, message: '삭제 권한이 없습니다.' });
    }

    await this.prisma.matchPost.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  // ─── 연락처 조회 ──────────────────────────────────────────────────────────

  async getContact(id: string, userId: string) {
    const post = await this.prisma.matchPost.findFirst({
      where: { id, isDeleted: false },
      select: { clubId: true, status: true, contactName: true, contactPhone: true },
    });

    if (!post) {
      throw new NotFoundException({ code: ErrorCode.MATCH_POST_001, message: '존재하지 않는 매칭 게시글입니다.' });
    }
    if (post.status !== MatchPostStatus.MATCHED) {
      throw new ForbiddenException({ code: ErrorCode.MATCH_POST_009, message: '연락처는 매칭 수락 후에만 조회할 수 있습니다.' });
    }

    const isPostOwnerAdmin = await this.prisma.clubMember.findFirst({
      where: { userId, clubId: post.clubId, role: { in: [ClubRole.CAPTAIN, ClubRole.VICE_CAPTAIN] } },
    });

    if (isPostOwnerAdmin) {
      const accepted = await this.prisma.matchApplication.findFirst({
        where: { postId: id, status: MatchApplicationStatus.ACCEPTED },
        select: { contactName: true, contactPhone: true },
      });
      if (!accepted) {
        throw new ForbiddenException({ code: ErrorCode.MATCH_POST_008, message: '연락처를 조회할 권한이 없습니다.' });
      }
      return { contactName: accepted.contactName, contactPhone: accepted.contactPhone };
    }

    const acceptedApp = await this.prisma.matchApplication.findFirst({
      where: { postId: id, applicantUserId: userId, status: MatchApplicationStatus.ACCEPTED },
    });

    if (!acceptedApp) {
      throw new ForbiddenException({ code: ErrorCode.MATCH_POST_008, message: '연락처를 조회할 권한이 없습니다.' });
    }

    return { contactName: post.contactName, contactPhone: post.contactPhone };
  }

  // ─── 매칭 신청 ────────────────────────────────────────────────────────────

  async apply(postId: string, userId: string, dto: CreateMatchApplicationDto) {
    const memberClub = await this.prisma.clubMember.findFirst({
      where: { userId, role: { in: [ClubRole.CAPTAIN, ClubRole.VICE_CAPTAIN] } },
      select: { clubId: true },
    });

    if (!memberClub) {
      throw new ForbiddenException({ code: ErrorCode.CLUB_NO_PERMISSION, message: '주장·부주장만 매칭을 신청할 수 있습니다.' });
    }

    const post = await this.prisma.matchPost.findFirst({
      where: { id: postId, isDeleted: false },
      select: { clubId: true, status: true, matchDate: true },
    });

    if (!post) {
      throw new NotFoundException({ code: ErrorCode.MATCH_POST_001, message: '존재하지 않는 매칭 게시글입니다.' });
    }
    if (post.clubId === memberClub.clubId) {
      throw new ForbiddenException({ code: ErrorCode.MATCH_POST_005, message: '본인 팀 게시글에는 신청할 수 없습니다.' });
    }
    if (post.status === MatchPostStatus.MATCHED) {
      throw new ConflictException({ code: ErrorCode.MATCH_POST_003, message: '이미 매칭이 완료된 게시글입니다.' });
    }
    if (new Date(post.matchDate) < new Date()) {
      throw new GoneException({ code: ErrorCode.MATCH_POST_004, message: '만료된 매칭 게시글입니다.' });
    }

    const existing = await this.prisma.matchApplication.findFirst({
      where: { postId, applicantClubId: memberClub.clubId },
    });
    if (existing) {
      throw new ConflictException({ code: ErrorCode.MATCH_POST_006, message: '이미 신청한 매칭입니다.' });
    }

    const application = await this.prisma.matchApplication.create({
      data: {
        postId,
        applicantClubId: memberClub.clubId,
        applicantUserId: userId,
        message: dto.message,
        contactName: dto.contactName,
        contactPhone: dto.contactPhone,
      },
      select: {
        id: true,
        postId: true,
        applicantClubId: true,
        message: true,
        contactName: true,
        contactPhone: true,
        status: true,
        createdAt: true,
        applicantClub: { select: { name: true, logoUrl: true, level: true } },
      },
    });

    console.log(`[TODO] 매칭 신청 알림 → 등록팀 관리자, postId=${postId}, applicantClub=${application.applicantClub.name}`);

    return {
      id: application.id,
      postId: application.postId,
      applicantClubId: application.applicantClubId,
      applicantClubName: application.applicantClub.name,
      applicantClubLogoUrl: application.applicantClub.logoUrl ?? null,
      applicantClubLevel: application.applicantClub.level,
      message: application.message ?? null,
      contactName: application.contactName,
      contactPhone: application.contactPhone,
      status: application.status,
      createdAt: application.createdAt,
    };
  }

  // ─── 신청 목록 조회 ───────────────────────────────────────────────────────

  async getApplications(postId: string, userId: string) {
    const post = await this.prisma.matchPost.findFirst({
      where: { id: postId, isDeleted: false },
      select: { createdBy: true },
    });

    if (!post) {
      throw new NotFoundException({ code: ErrorCode.MATCH_POST_001, message: '존재하지 않는 매칭 게시글입니다.' });
    }
    if (post.createdBy !== userId) {
      throw new ForbiddenException({ code: ErrorCode.MATCH_POST_007, message: '신청 목록을 볼 권한이 없습니다.' });
    }

    const applications = await this.prisma.matchApplication.findMany({
      where: { postId },
      select: {
        id: true,
        postId: true,
        applicantClubId: true,
        message: true,
        contactName: true,
        contactPhone: true,
        status: true,
        createdAt: true,
        applicantClub: { select: { name: true, logoUrl: true, level: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      items: applications.map((app) => ({
        id: app.id,
        postId: app.postId,
        applicantClubId: app.applicantClubId,
        applicantClubName: app.applicantClub.name,
        applicantClubLogoUrl: app.applicantClub.logoUrl ?? null,
        applicantClubLevel: app.applicantClub.level,
        message: app.message ?? null,
        contactName: app.contactName,
        contactPhone: app.contactPhone,
        status: app.status,
        createdAt: app.createdAt,
      })),
    };
  }

  // ─── 신청 수락 (트랜잭션) ─────────────────────────────────────────────────

  async accept(postId: string, appId: string, userId: string) {
    const post = await this.prisma.matchPost.findFirst({
      where: { id: postId, isDeleted: false },
      select: {
        createdBy: true,
        clubId: true,
        status: true,
        matchDate: true,
        startTime: true,
        endTime: true,
        location: true,
        address: true,
        level: true,
        club: { select: { name: true } },
      },
    });

    if (!post) {
      throw new NotFoundException({ code: ErrorCode.MATCH_POST_001, message: '존재하지 않는 매칭 게시글입니다.' });
    }
    if (post.createdBy !== userId) {
      throw new ForbiddenException({ code: ErrorCode.MATCH_POST_007, message: '수락 권한이 없습니다.' });
    }
    if (post.status === MatchPostStatus.MATCHED) {
      throw new ConflictException({ code: ErrorCode.MATCH_POST_003, message: '이미 매칭이 완료된 게시글입니다.' });
    }

    const app = await this.prisma.matchApplication.findFirst({
      where: { id: appId, postId },
      select: { status: true, applicantClubId: true, applicantClub: { select: { name: true, level: true } } },
    });

    if (!app) {
      throw new NotFoundException({ code: ErrorCode.MATCH_APPLICATION_001, message: '존재하지 않는 신청입니다.' });
    }
    if (app.status !== MatchApplicationStatus.PENDING) {
      throw new ConflictException({ code: ErrorCode.MATCH_APPLICATION_002, message: '이미 처리된 신청입니다.' });
    }

    const startAt = combineDateTime(post.matchDate.toISOString(), post.startTime);
    const endAt = combineDateTime(post.matchDate.toISOString(), post.endTime);
    const voteDeadline = new Date(startAt.getTime() - 24 * 60 * 60 * 1000);

    await this.prisma.$transaction(async (tx) => {
      await tx.matchApplication.update({
        where: { id: appId },
        data: { status: MatchApplicationStatus.ACCEPTED },
      });

      const rejectedApps = await tx.matchApplication.findMany({
        where: { postId, status: MatchApplicationStatus.PENDING, id: { not: appId } },
        select: { applicantClub: { select: { name: true } } },
      });

      await tx.matchApplication.updateMany({
        where: { postId, status: MatchApplicationStatus.PENDING, id: { not: appId } },
        data: { status: MatchApplicationStatus.REJECTED },
      });

      await tx.matchPost.update({
        where: { id: postId },
        data: { status: MatchPostStatus.MATCHED },
      });

      await tx.match.create({
        data: {
          clubId: post.clubId,
          matchPostId: postId,
          type: MatchType.SELF,
          title: `vs ${app.applicantClub.name}`,
          location: post.location,
          address: post.address,
          startAt,
          endAt,
          voteDeadline,
          opponentName: app.applicantClub.name,
          opponentLevel: app.applicantClub.level,
        },
      });

      await tx.match.create({
        data: {
          clubId: app.applicantClubId,
          matchPostId: postId,
          type: MatchType.SELF,
          title: `vs ${post.club.name}`,
          location: post.location,
          address: post.address,
          startAt,
          endAt,
          voteDeadline,
          opponentName: post.club.name,
          opponentLevel: post.level,
        },
      });

      console.log(`[TODO] 매칭 수락 알림 → 수락팀: ${app.applicantClub.name}, postId=${postId}`);
      for (const rejected of rejectedApps) {
        console.log(`[TODO] 매칭 거절 알림 → ${rejected.applicantClub.name}, postId=${postId}`);
      }
    });
  }

  // ─── 신청 거절 ────────────────────────────────────────────────────────────

  async reject(postId: string, appId: string, userId: string) {
    const post = await this.prisma.matchPost.findFirst({
      where: { id: postId, isDeleted: false },
      select: { createdBy: true },
    });

    if (!post) {
      throw new NotFoundException({ code: ErrorCode.MATCH_POST_001, message: '존재하지 않는 매칭 게시글입니다.' });
    }
    if (post.createdBy !== userId) {
      throw new ForbiddenException({ code: ErrorCode.MATCH_POST_007, message: '거절 권한이 없습니다.' });
    }

    const app = await this.prisma.matchApplication.findFirst({
      where: { id: appId, postId },
      select: { status: true, applicantClub: { select: { name: true } } },
    });

    if (!app) {
      throw new NotFoundException({ code: ErrorCode.MATCH_APPLICATION_001, message: '존재하지 않는 신청입니다.' });
    }
    if (app.status !== MatchApplicationStatus.PENDING) {
      throw new ConflictException({ code: ErrorCode.MATCH_APPLICATION_002, message: '이미 처리된 신청입니다.' });
    }

    await this.prisma.matchApplication.update({
      where: { id: appId },
      data: { status: MatchApplicationStatus.REJECTED },
    });

    console.log(`[TODO] 매칭 거절 알림 → ${app.applicantClub.name}, postId=${postId}`);
  }

  // ─── 내 신청 목록 ─────────────────────────────────────────────────────────

  async getMyApplications(userId: string) {
    const memberClub = await this.prisma.clubMember.findFirst({
      where: { userId, role: { in: [ClubRole.CAPTAIN, ClubRole.VICE_CAPTAIN] } },
      select: { clubId: true },
    });

    if (!memberClub) return { items: [] };

    const applications = await this.prisma.matchApplication.findMany({
      where: { applicantClubId: memberClub.clubId },
      select: {
        id: true,
        message: true,
        status: true,
        createdAt: true,
        post: { select: MATCH_POST_SELECT },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      items: applications.map((app) => ({
        id: app.id,
        message: app.message ?? null,
        status: app.status,
        createdAt: app.createdAt,
        post: buildMatchPostCard(app.post),
      })),
    };
  }
}
