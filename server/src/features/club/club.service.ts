import {
  ConflictException,
  ForbiddenException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { ClubRole, DissolveVoteStatus, JoinRequestStatus, RecruitmentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ClubMembershipService } from '../../common/services/club-membership.service';
import { ErrorCode } from '../../common/constants/error-codes';
import type { CreateClubDto } from './dto/create-club.dto';
import type { CreateJoinRequestDto } from './dto/create-join-request.dto';
import type { JoinByCodeDto } from './dto/join-by-code.dto';
import type { UpdateMemberStatsDto } from './dto/update-member-stats.dto';
import type { ChangeRoleDto } from './dto/change-role.dto';
import type { TransferCaptainDto } from './dto/transfer-captain.dto';
import type { LeaveClubDto } from './dto/leave-club.dto';
import type { RespondDissolveVoteDto } from './dto/respond-dissolve-vote.dto';

const INVITE_CODE_EXPIRE_DAYS = 7;
const DISSOLVE_VOTE_EXPIRE_HOURS = 48;
const CURSOR_DEFAULT_LIMIT = 20;

/** 클럽 상세 select 필드 */
const CLUB_SELECT = {
  id: true,
  name: true,
  level: true,
  maxMemberCount: true,
  currentMemberCount: true,
  mannerScoreAvg: true,
  recruitmentStatus: true,
  logoUrl: true,
  description: true,
  regionId: true,
  region: { select: { name: true, sigungu: true } },
  createdAt: true,
} as const;

@Injectable()
export class ClubService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly membership: ClubMembershipService,
  ) {}

  // ─── 내부 헬퍼 ─────────────────────────────────────────────────────────────

  private async recalcMannerScoreAvg(clubId: string) {
    const result = await this.prisma.clubMember.aggregate({
      where: { clubId },
      _avg: { user: { mannerScore: true } } as any,
    });

    // aggregate 후 평균이 없으면 100 유지
    const agg = await this.prisma.$queryRaw<{ avg: number | null }[]>`
      SELECT AVG(u."mannerScore") as avg
      FROM club_members cm
      JOIN users u ON u.id = cm."userId"
      WHERE cm."clubId" = ${clubId}
    `;
    const avg = agg[0]?.avg ?? 100;

    await this.prisma.club.update({
      where: { id: clubId },
      data: { mannerScoreAvg: avg },
    });
  }

  private generateInviteCode(): string {
    return randomBytes(4).toString('hex').toUpperCase(); // 8자리 대문자 hex
  }

  private formatClubDetail(club: any, myRole: ClubRole | null) {
    return {
      ...club,
      regionName: `${club.region.name} ${club.region.sigungu}`,
      myRole,
      createdAt: club.createdAt.toISOString(),
    };
  }

  // ─── 클럽 생성 ─────────────────────────────────────────────────────────────

  async createClub(userId: string, dto: CreateClubDto) {
    // 이미 소속 팀 있으면 거부
    const existing = await this.prisma.clubMember.findFirst({
      where: { userId, club: { isDeleted: false } },
    });
    if (existing) {
      throw new ConflictException({
        code: ErrorCode.CLUB_ALREADY_MEMBER,
        message: '이미 소속된 팀이 있습니다.',
      });
    }

    const region = await this.prisma.region.findUnique({ where: { id: dto.regionId } });
    if (!region) {
      throw new NotFoundException({ code: ErrorCode.REGION_NOT_FOUND, message: '존재하지 않는 지역입니다.' });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_CODE_EXPIRE_DAYS);

    const [club] = await this.prisma.$transaction(async (tx) => {
      const created = await tx.club.create({
        data: {
          name: dto.name,
          regionId: dto.regionId,
          level: dto.level,
          maxMemberCount: dto.maxMemberCount,
          description: dto.description,
          logoUrl: dto.logoUrl,
        },
        select: CLUB_SELECT,
      });

      // 생성자 → CAPTAIN으로 멤버십 생성
      await tx.clubMember.create({
        data: { clubId: created.id, userId, role: ClubRole.CAPTAIN },
      });

      // 초대 코드 최초 발급
      await tx.clubInviteCode.create({
        data: {
          clubId: created.id,
          code: this.generateInviteCode(),
          expiresAt,
          createdBy: userId,
        },
      });

      return [created];
    });

    return this.formatClubDetail(club, ClubRole.CAPTAIN);
  }

  // ─── 내 클럽 조회 ──────────────────────────────────────────────────────────

  async getMyClub(userId: string) {
    const membership = await this.prisma.clubMember.findFirst({
      where: { userId, club: { isDeleted: false } },
      select: { role: true, club: { select: CLUB_SELECT } },
    });
    if (!membership) return null;
    return this.formatClubDetail(membership.club, membership.role);
  }

  // ─── 클럽 상세 조회 ────────────────────────────────────────────────────────

  async getClubDetail(clubId: string, userId: string) {
    const club = await this.prisma.club.findUnique({
      where: { id: clubId, isDeleted: false },
      select: CLUB_SELECT,
    });
    if (!club) {
      throw new NotFoundException({ code: ErrorCode.CLUB_NOT_FOUND, message: '존재하지 않는 클럽입니다.' });
    }

    const membership = await this.prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } },
      select: { role: true },
    });

    return this.formatClubDetail(club, membership?.role ?? null);
  }

  // ─── 팀원 목록 조회 ────────────────────────────────────────────────────────

  async getClubMembers(
    clubId: string,
    userId: string,
    params: { cursor?: string; limit?: number; position?: string },
  ) {
    await this.membership.assertMember(clubId, userId);

    const limit = params.limit ?? CURSOR_DEFAULT_LIMIT;
    const members = await this.prisma.clubMember.findMany({
      where: {
        clubId,
        ...(params.position ? { user: { position: params.position as any } } : {}),
      },
      take: limit + 1,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
      select: {
        id: true,
        role: true,
        jerseyNumber: true,
        joinedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            position: true,
            mannerScore: true,
          },
        },
      },
    });

    const hasMore = members.length > limit;
    const data = members.slice(0, limit).map((m) => ({
      userId: m.user.id,
      name: m.user.name,
      avatarUrl: m.user.avatarUrl,
      jerseyNumber: m.jerseyNumber,
      role: m.role,
      position: m.user.position,
      mannerScore: m.user.mannerScore,
      stats: { goals: 0, assists: 0, momCount: 0, matchCount: 0 }, // TODO: 경기 도메인 연동 후 집계
      joinedAt: m.joinedAt.toISOString(),
    }));

    return {
      data,
      nextCursor: hasMore ? members[limit - 1]!.id : null,
    };
  }

  // ─── 팀원 강퇴 ─────────────────────────────────────────────────────────────

  async kickMember(clubId: string, kickerId: string, targetUserId: string) {
    await this.membership.assertCaptainOrVice(clubId,kickerId);

    const target = await this.prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId: targetUserId } },
    });
    if (!target) {
      throw new NotFoundException({ code: ErrorCode.CLUB_NOT_FOUND, message: '해당 팀원을 찾을 수 없습니다.' });
    }

    await this.prisma.$transaction([
      // 1. Role 제거 (MEMBER로 강등)
      this.prisma.clubMember.update({
        where: { clubId_userId: { clubId, userId: targetUserId } },
        data: { role: ClubRole.MEMBER },
      }),
      // 2. 멤버십 삭제
      this.prisma.clubMember.delete({
        where: { clubId_userId: { clubId, userId: targetUserId } },
      }),
      // 3. BanRecord 생성
      this.prisma.clubBanRecord.create({
        data: { clubId, userId: targetUserId, bannedBy: kickerId },
      }),
      // 4. 인원 수 감소
      this.prisma.club.update({
        where: { id: clubId },
        data: { currentMemberCount: { decrement: 1 } },
      }),
    ]);

    await this.recalcMannerScoreAvg(clubId);
  }

  // ─── 클럽 탈퇴 ─────────────────────────────────────────────────────────────

  async leaveClub(clubId: string, userId: string, _dto: LeaveClubDto) {
    const member = await this.membership.assertMember(clubId, userId);

    if (member.role === ClubRole.CAPTAIN) {
      throw new ForbiddenException({
        code: ErrorCode.CLUB_CAPTAIN_CANNOT_LEAVE,
        message: '주장은 권한 이전 후 탈퇴할 수 있습니다.',
      });
    }

    await this.prisma.$transaction([
      // 부주장이면 Role 먼저 해제
      ...(member.role === ClubRole.VICE_CAPTAIN
        ? [
            this.prisma.clubMember.update({
              where: { clubId_userId: { clubId, userId } },
              data: { role: ClubRole.MEMBER },
            }),
          ]
        : []),
      this.prisma.clubMember.delete({
        where: { clubId_userId: { clubId, userId } },
      }),
      this.prisma.club.update({
        where: { id: clubId },
        data: { currentMemberCount: { decrement: 1 } },
      }),
    ]);

    await this.recalcMannerScoreAvg(clubId);
  }

  // ─── 역할 변경 ─────────────────────────────────────────────────────────────

  async changeRole(clubId: string, captainId: string, targetUserId: string, dto: ChangeRoleDto) {
    await this.membership.assertCaptain(clubId,captainId);

    await this.prisma.clubMember.update({
      where: { clubId_userId: { clubId, userId: targetUserId } },
      data: { role: dto.role },
    });
  }

  // ─── 주장 권한 이전 ────────────────────────────────────────────────────────

  async transferCaptain(clubId: string, captainId: string, dto: TransferCaptainDto) {
    await this.membership.assertCaptain(clubId,captainId);

    await this.prisma.$transaction([
      this.prisma.clubMember.update({
        where: { clubId_userId: { clubId, userId: dto.targetUserId } },
        data: { role: ClubRole.CAPTAIN },
      }),
      this.prisma.clubMember.update({
        where: { clubId_userId: { clubId, userId: captainId } },
        data: { role: ClubRole.MEMBER },
      }),
    ]);
  }

  // ─── 능력치 수정 ───────────────────────────────────────────────────────────

  async updateMemberStats(
    clubId: string,
    requesterId: string,
    targetUserId: string,
    dto: UpdateMemberStatsDto,
  ) {
    const requester = await this.membership.assertMember(clubId, requesterId);

    // 본인이 아니면 Captain/Vice만 가능
    const isSelf = requesterId === targetUserId;
    const isAdmin =
      requester.role === ClubRole.CAPTAIN || requester.role === ClubRole.VICE_CAPTAIN;
    if (!isSelf && !isAdmin) {
      throw new ForbiddenException({
        code: ErrorCode.CLUB_NO_PERMISSION,
        message: '능력치는 본인 또는 관리자만 수정할 수 있습니다.',
      });
    }

    return this.prisma.clubMember.update({
      where: { clubId_userId: { clubId, userId: targetUserId } },
      data: dto,
    });
  }

  // ─── 가입 신청 ─────────────────────────────────────────────────────────────

  async createJoinRequest(clubId: string, userId: string, dto: CreateJoinRequestDto) {
    // 이미 소속된 팀 있는지
    const alreadyMember = await this.prisma.clubMember.findFirst({
      where: { userId, club: { isDeleted: false } },
    });
    if (alreadyMember) {
      throw new ConflictException({
        code: ErrorCode.CLUB_ALREADY_MEMBER,
        message: '이미 소속된 팀이 있습니다.',
      });
    }

    // 강퇴 이력 확인
    const banned = await this.prisma.clubBanRecord.findFirst({ where: { clubId, userId } });
    if (banned) {
      throw new ForbiddenException({
        code: ErrorCode.CLUB_BANNED,
        message: '강퇴된 팀에는 재가입할 수 없습니다.',
      });
    }

    // 중복 신청 확인
    const existing = await this.prisma.clubJoinRequest.findUnique({
      where: { clubId_userId: { clubId, userId } },
    });
    if (existing) {
      throw new ConflictException({
        code: ErrorCode.CLUB_JOIN_REQUEST_DUPLICATE,
        message: '이미 가입 신청 중입니다.',
      });
    }

    const club = await this.prisma.club.findUnique({
      where: { id: clubId, isDeleted: false },
      select: { recruitmentStatus: true, currentMemberCount: true, maxMemberCount: true },
    });
    if (!club) {
      throw new NotFoundException({ code: ErrorCode.CLUB_NOT_FOUND, message: '존재하지 않는 클럽입니다.' });
    }
    if (club.recruitmentStatus === RecruitmentStatus.CLOSED) {
      throw new ForbiddenException({
        code: ErrorCode.CLUB_FULL,
        message: '모집이 마감된 팀입니다.',
      });
    }

    return this.prisma.clubJoinRequest.create({
      data: { clubId, userId, message: dto.message },
      select: { id: true, status: true, createdAt: true },
    });
  }

  async cancelJoinRequest(clubId: string, userId: string) {
    const request = await this.prisma.clubJoinRequest.findUnique({
      where: { clubId_userId: { clubId, userId } },
    });
    if (!request) {
      throw new NotFoundException({ code: ErrorCode.CLUB_JOIN_REQUEST_NOT_FOUND, message: '신청 내역을 찾을 수 없습니다.' });
    }

    await this.prisma.clubJoinRequest.delete({
      where: { clubId_userId: { clubId, userId } },
    });
  }

  async getJoinRequests(
    clubId: string,
    requesterId: string,
    params: { cursor?: string; limit?: number },
  ) {
    await this.membership.assertCaptainOrVice(clubId,requesterId);

    const limit = params.limit ?? CURSOR_DEFAULT_LIMIT;
    const requests = await this.prisma.clubJoinRequest.findMany({
      where: { clubId, status: JoinRequestStatus.PENDING },
      take: limit + 1,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        message: true,
        status: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, avatarUrl: true, position: true, level: true, mannerScore: true },
        },
      },
    });

    const hasMore = requests.length > limit;
    const data = requests.slice(0, limit).map((r) => ({
      id: r.id,
      userId: r.user.id,
      userName: r.user.name,
      userAvatarUrl: r.user.avatarUrl,
      userPosition: r.user.position,
      userLevel: r.user.level,
      userMannerScore: r.user.mannerScore,
      message: r.message,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    }));

    return { data, nextCursor: hasMore ? requests[limit - 1]!.id : null };
  }

  async approveJoinRequest(clubId: string, requesterId: string, requestId: string) {
    await this.membership.assertCaptainOrVice(clubId,requesterId);

    const request = await this.prisma.clubJoinRequest.findUnique({
      where: { id: requestId },
      select: { userId: true, status: true, clubId: true },
    });
    if (!request || request.clubId !== clubId) {
      throw new NotFoundException({ code: ErrorCode.CLUB_JOIN_REQUEST_NOT_FOUND, message: '신청 내역을 찾을 수 없습니다.' });
    }

    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
      select: { currentMemberCount: true, maxMemberCount: true },
    });
    if (!club) {
      throw new NotFoundException({ code: ErrorCode.CLUB_NOT_FOUND, message: '존재하지 않는 클럽입니다.' });
    }
    if (club.currentMemberCount >= club.maxMemberCount) {
      throw new ConflictException({ code: ErrorCode.CLUB_FULL, message: '팀 정원이 초과되었습니다.' });
    }

    const willBeFull = club.currentMemberCount + 1 >= club.maxMemberCount;

    await this.prisma.$transaction([
      this.prisma.clubJoinRequest.update({
        where: { id: requestId },
        data: { status: JoinRequestStatus.APPROVED },
      }),
      this.prisma.clubMember.create({
        data: { clubId, userId: request.userId, role: ClubRole.MEMBER },
      }),
      this.prisma.club.update({
        where: { id: clubId },
        data: {
          currentMemberCount: { increment: 1 },
          ...(willBeFull ? { recruitmentStatus: RecruitmentStatus.CLOSED } : {}),
        },
      }),
    ]);

    await this.recalcMannerScoreAvg(clubId);
  }

  async rejectJoinRequest(clubId: string, requesterId: string, requestId: string) {
    await this.membership.assertCaptainOrVice(clubId,requesterId);

    const request = await this.prisma.clubJoinRequest.findUnique({
      where: { id: requestId },
      select: { clubId: true },
    });
    if (!request || request.clubId !== clubId) {
      throw new NotFoundException({ code: ErrorCode.CLUB_JOIN_REQUEST_NOT_FOUND, message: '신청 내역을 찾을 수 없습니다.' });
    }

    await this.prisma.clubJoinRequest.update({
      where: { id: requestId },
      data: { status: JoinRequestStatus.REJECTED },
    });
  }

  // ─── 초대 코드 ─────────────────────────────────────────────────────────────

  async getInviteCode(clubId: string, userId: string) {
    await this.membership.assertCaptainOrVice(clubId,userId);

    const code = await this.prisma.clubInviteCode.findFirst({
      where: { clubId },
      orderBy: { createdAt: 'desc' },
    });

    if (!code) {
      return this.renewInviteCode(clubId, userId);
    }

    return {
      code: code.code,
      expiresAt: code.expiresAt.toISOString(),
      isExpired: code.expiresAt < new Date(),
    };
  }

  async renewInviteCode(clubId: string, userId: string) {
    await this.membership.assertCaptainOrVice(clubId,userId);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_CODE_EXPIRE_DAYS);

    const newCode = await this.prisma.clubInviteCode.create({
      data: {
        clubId,
        code: this.generateInviteCode(),
        expiresAt,
        createdBy: userId,
      },
    });

    return {
      code: newCode.code,
      expiresAt: newCode.expiresAt.toISOString(),
      isExpired: false,
    };
  }

  async joinByCode(userId: string, dto: JoinByCodeDto) {
    const inviteCode = await this.prisma.clubInviteCode.findUnique({
      where: { code: dto.code },
    });
    if (!inviteCode) {
      throw new NotFoundException({
        code: ErrorCode.CLUB_INVITE_CODE_INVALID,
        message: '유효하지 않은 초대 코드입니다.',
      });
    }
    if (inviteCode.expiresAt < new Date()) {
      throw new GoneException({
        code: ErrorCode.CLUB_INVITE_CODE_EXPIRED,
        message: '초대 코드가 만료됐습니다. 팀 관리자에게 재발급을 요청하세요.',
      });
    }

    // 가입 신청 생성 (내부 검증 재활용)
    return this.createJoinRequest(inviteCode.clubId, userId, {});
  }

  // ─── 해체 투표 ─────────────────────────────────────────────────────────────

  async getDissolveVote(clubId: string, userId: string) {
    await this.membership.assertMember(clubId, userId);

    const vote = await this.prisma.clubDissolveVote.findFirst({
      where: { clubId, status: DissolveVoteStatus.IN_PROGRESS },
      include: {
        responses: { select: { userId: true, agreed: true } },
      },
    });
    if (!vote) return null;

    const totalCount = await this.prisma.clubMember.count({ where: { clubId } });
    const agreedCount = vote.responses.filter((r) => r.agreed).length;
    const myResponse = vote.responses.find((r) => r.userId === userId)?.agreed ?? null;

    return {
      id: vote.id,
      status: vote.status,
      expiresAt: vote.expiresAt.toISOString(),
      totalCount,
      agreedCount,
      myResponse,
    };
  }

  async startDissolveVote(clubId: string, captainId: string) {
    await this.membership.assertCaptain(clubId,captainId);

    // 이미 진행 중인 투표 확인
    const existing = await this.prisma.clubDissolveVote.findFirst({
      where: { clubId, status: DissolveVoteStatus.IN_PROGRESS },
    });
    if (existing) {
      throw new ConflictException({
        code: ErrorCode.CLUB_DISSOLVE_VOTE_IN_PROGRESS,
        message: '이미 해체 투표가 진행 중입니다.',
      });
    }

    const memberCount = await this.prisma.clubMember.count({ where: { clubId } });

    // 1인 팀: 즉시 해체
    if (memberCount === 1) {
      await this.dissolveClub(clubId);
      return {
        id: 'immediate',
        status: DissolveVoteStatus.APPROVED,
        expiresAt: new Date().toISOString(),
        totalCount: 1,
        agreedCount: 1,
        myResponse: true,
      };
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + DISSOLVE_VOTE_EXPIRE_HOURS);

    const vote = await this.prisma.clubDissolveVote.create({
      data: { clubId, initiatedBy: captainId, expiresAt },
    });

    // 주장은 자동 동의 처리
    await this.prisma.clubDissolveVoteResponse.create({
      data: { voteId: vote.id, userId: captainId, agreed: true },
    });

    return {
      id: vote.id,
      status: vote.status,
      expiresAt: vote.expiresAt.toISOString(),
      totalCount: memberCount,
      agreedCount: 1,
      myResponse: true,
    };
  }

  async respondDissolveVote(clubId: string, userId: string, dto: RespondDissolveVoteDto) {
    await this.membership.assertMember(clubId, userId);

    const vote = await this.prisma.clubDissolveVote.findFirst({
      where: { clubId, status: DissolveVoteStatus.IN_PROGRESS },
      include: { responses: { select: { userId: true, agreed: true } } },
    });
    if (!vote) {
      throw new NotFoundException({ code: ErrorCode.CLUB_NOT_FOUND, message: '진행 중인 해체 투표가 없습니다.' });
    }

    // 만료 체크 (클라이언트 요청 시점)
    if (vote.expiresAt < new Date()) {
      await this.prisma.clubDissolveVote.update({
        where: { id: vote.id },
        data: { status: DissolveVoteStatus.EXPIRED },
      });
      throw new GoneException({
        code: ErrorCode.CLUB_DISSOLVE_VOTE_EXPIRED,
        message: '해체 투표가 만료되었습니다.',
      });
    }

    // 응답 저장 (upsert)
    await this.prisma.clubDissolveVoteResponse.upsert({
      where: { voteId_userId: { voteId: vote.id, userId } },
      create: { voteId: vote.id, userId, agreed: dto.agreed },
      update: { agreed: dto.agreed },
    });

    // 거절 즉시 → 투표 취소
    if (!dto.agreed) {
      await this.prisma.clubDissolveVote.update({
        where: { id: vote.id },
        data: { status: DissolveVoteStatus.REJECTED },
      });
      return {
        id: vote.id,
        status: DissolveVoteStatus.REJECTED,
        expiresAt: vote.expiresAt.toISOString(),
        totalCount: vote.responses.length + 1,
        agreedCount: vote.responses.filter((r) => r.agreed).length,
        myResponse: false,
      };
    }

    // 전원 동의 여부 확인
    // 탈퇴·강퇴된 팀원은 제외 (잔류 인원 기준)
    const activeMemberCount = await this.prisma.clubMember.count({ where: { clubId } });
    const updatedResponses = await this.prisma.clubDissolveVoteResponse.findMany({
      where: { voteId: vote.id },
    });
    const agreedCount = updatedResponses.filter((r) => r.agreed).length;

    if (agreedCount >= activeMemberCount) {
      await this.prisma.clubDissolveVote.update({
        where: { id: vote.id },
        data: { status: DissolveVoteStatus.APPROVED },
      });
      await this.dissolveClub(clubId);
      return {
        id: vote.id,
        status: DissolveVoteStatus.APPROVED,
        expiresAt: vote.expiresAt.toISOString(),
        totalCount: activeMemberCount,
        agreedCount,
        myResponse: true,
      };
    }

    return {
      id: vote.id,
      status: DissolveVoteStatus.IN_PROGRESS,
      expiresAt: vote.expiresAt.toISOString(),
      totalCount: activeMemberCount,
      agreedCount,
      myResponse: true,
    };
  }

  /** 해체 확정 처리 — Pending 신청 자동 거절 */
  private async dissolveClub(clubId: string) {
    await this.prisma.$transaction([
      // Pending 신청 자동 거절
      this.prisma.clubJoinRequest.updateMany({
        where: { clubId, status: JoinRequestStatus.PENDING },
        data: { status: JoinRequestStatus.REJECTED },
      }),
      // Soft Delete
      this.prisma.club.update({
        where: { id: clubId },
        data: { isDeleted: true, deletedAt: new Date() },
      }),
    ]);
  }

  // ─── 클럽 검색 ─────────────────────────────────────────────────────────────

  async searchClubs(params: {
    name?: string;
    regionId?: string;
    cursor?: string;
    limit?: number;
  }) {
    const limit = params.limit ?? CURSOR_DEFAULT_LIMIT;
    const clubs = await this.prisma.club.findMany({
      where: {
        isDeleted: false,
        ...(params.name ? { name: { contains: params.name, mode: 'insensitive' } } : {}),
        ...(params.regionId ? { regionId: params.regionId } : {}),
      },
      take: limit + 1,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
      orderBy: { mannerScoreAvg: 'desc' },
      select: {
        id: true,
        name: true,
        level: true,
        mannerScoreAvg: true,
        currentMemberCount: true,
        maxMemberCount: true,
        recruitmentStatus: true,
        logoUrl: true,
        region: { select: { name: true, sigungu: true } },
      },
    });

    const hasMore = clubs.length > limit;
    const data = clubs.slice(0, limit).map((c) => ({
      id: c.id,
      name: c.name,
      level: c.level,
      mannerScoreAvg: c.mannerScoreAvg,
      regionName: `${c.region.name} ${c.region.sigungu}`,
      currentMemberCount: c.currentMemberCount,
      maxMemberCount: c.maxMemberCount,
      recruitmentStatus: c.recruitmentStatus,
      logoUrl: c.logoUrl,
    }));

    return { data, nextCursor: hasMore ? clubs[limit - 1]!.id : null };
  }

  async getRecommendedClubs(userId: string, params: { cursor?: string; limit?: number }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { preferredRegionId: true },
    });

    return this.searchClubs({
      regionId: user?.preferredRegionId ?? undefined,
      ...params,
    });
  }
}
