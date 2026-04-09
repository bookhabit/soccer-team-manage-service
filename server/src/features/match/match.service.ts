import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ClubRole, MatchType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorCode } from '../../common/constants/error-codes';
import type {
  CreateMatchDto,
  UpdateMatchDto,
  SubmitAttendanceDto,
  SaveLineupDto,
  SubmitRecordDto,
  UpdateRecordDto,
  SubmitMomVoteDto,
  CreateCommentDto,
  RegisterVideoDto,
  SubmitOpponentRatingDto,
  GetMatchesQueryDto,
  GetCommentsQueryDto,
} from './dto/match.dto';

const CURSOR_DEFAULT_LIMIT = 20;

/** 경기 요약 select (목록용) */
const MATCH_SUMMARY_SELECT = {
  id: true,
  type: true,
  title: true,
  location: true,
  startAt: true,
  endAt: true,
  voteDeadline: true,
  opponentName: true,
  opponentLevel: true,
  homeScore: true,
  awayScore: true,
  isRecordSubmitted: true,
} as const;

@Injectable()
export class MatchService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── 내부 헬퍼 ─────────────────────────────────────────────────────────────

  private async assertMember(clubId: string, userId: string) {
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

  private async assertAdmin(clubId: string, userId: string) {
    const member = await this.assertMember(clubId, userId);
    if (member.role === ClubRole.MEMBER) {
      throw new ForbiddenException({
        code: ErrorCode.MATCH_002,
        message: '관리자(주장·부주장)만 이 작업을 수행할 수 있습니다.',
      });
    }
    return member;
  }

  private async findMatch(clubId: string, matchId: string) {
    const match = await this.prisma.match.findFirst({
      where: { id: matchId, clubId, isDeleted: false },
    });
    if (!match) {
      throw new NotFoundException({
        code: ErrorCode.MATCH_001,
        message: '존재하지 않는 경기입니다.',
      });
    }
    return match;
  }

  // ─── 경기 CRUD ─────────────────────────────────────────────────────────────

  async createMatch(clubId: string, userId: string, dto: CreateMatchDto) {
    await this.assertAdmin(clubId, userId);
    return this.prisma.match.create({
      data: {
        clubId,
        type: dto.type,
        title: dto.title,
        location: dto.location,
        address: dto.address,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        voteDeadline: new Date(dto.voteDeadline),
        opponentName: dto.opponentName,
        opponentLevel: dto.opponentLevel,
      },
      select: MATCH_SUMMARY_SELECT,
    });
  }

  async getMatches(clubId: string, userId: string, query: GetMatchesQueryDto) {
    await this.assertMember(clubId, userId);
    const limit = query.limit ?? CURSOR_DEFAULT_LIMIT;
    const where = {
      clubId,
      isDeleted: false,
      ...(query.type ? { type: query.type } : {}),
      ...(query.cursor ? { id: { lt: query.cursor } } : {}),
    };

    const matches = await this.prisma.match.findMany({
      where,
      orderBy: { startAt: 'desc' },
      take: limit + 1,
      select: {
        ...MATCH_SUMMARY_SELECT,
        id: true,
        attendances: {
          select: { userId: true, response: true },
        },
      },
    });

    const hasMore = matches.length > limit;
    const items = hasMore ? matches.slice(0, limit) : matches;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
      items: items.map((m) => {
        const myAttendance = m.attendances.find((a) => a.userId === userId);
        const attendCount = m.attendances.filter((a) => a.response === 'ATTEND').length;
        const absentCount = m.attendances.filter((a) => a.response === 'ABSENT').length;
        const { attendances: _, ...rest } = m;
        return { ...rest, myResponse: myAttendance?.response ?? null, attendCount, absentCount };
      }),
      nextCursor,
    };
  }

  async getMatchDetail(clubId: string, matchId: string, userId: string) {
    await this.assertMember(clubId, userId);
    const match = await this.prisma.match.findFirst({
      where: { id: matchId, clubId, isDeleted: false },
      select: {
        ...MATCH_SUMMARY_SELECT,
        recordedAt: true,
        attendances: {
          select: {
            userId: true,
            response: true,
            user: { select: { name: true, avatarUrl: true } },
          },
        },
      },
    });
    if (!match) {
      throw new NotFoundException({ code: ErrorCode.MATCH_001, message: '존재하지 않는 경기입니다.' });
    }

    const myAttendance = match.attendances.find((a) => a.userId === userId);
    const attendCount = match.attendances.filter((a) => a.response === 'ATTEND').length;
    const absentCount = match.attendances.filter((a) => a.response === 'ABSENT').length;
    const undecidedCount = match.attendances.filter((a) => a.response === 'UNDECIDED').length;

    const { attendances: _, ...rest } = match;
    return {
      ...rest,
      myResponse: myAttendance?.response ?? null,
      attendCount,
      absentCount,
      undecidedCount,
    };
  }

  async updateMatch(clubId: string, matchId: string, userId: string, dto: UpdateMatchDto) {
    await this.assertAdmin(clubId, userId);
    const match = await this.findMatch(clubId, matchId);
    if (new Date() > match.voteDeadline) {
      throw new UnprocessableEntityException({
        code: ErrorCode.MATCH_009,
        message: '투표가 마감된 경기는 수정할 수 없습니다.',
      });
    }
    return this.prisma.match.update({
      where: { id: matchId },
      data: {
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.location !== undefined ? { location: dto.location } : {}),
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.startAt !== undefined ? { startAt: new Date(dto.startAt) } : {}),
        ...(dto.endAt !== undefined ? { endAt: new Date(dto.endAt) } : {}),
        ...(dto.voteDeadline !== undefined ? { voteDeadline: new Date(dto.voteDeadline) } : {}),
        ...(dto.opponentName !== undefined ? { opponentName: dto.opponentName } : {}),
        ...(dto.opponentLevel !== undefined ? { opponentLevel: dto.opponentLevel } : {}),
      },
      select: MATCH_SUMMARY_SELECT,
    });
  }

  async deleteMatch(clubId: string, matchId: string, userId: string) {
    await this.assertAdmin(clubId, userId);
    await this.findMatch(clubId, matchId);
    await this.prisma.match.update({
      where: { id: matchId },
      data: { isDeleted: true },
    });
  }

  // ─── 투표 응답 ─────────────────────────────────────────────────────────────

  async submitAttendance(clubId: string, matchId: string, userId: string, dto: SubmitAttendanceDto) {
    await this.assertMember(clubId, userId);
    const match = await this.findMatch(clubId, matchId);
    if (new Date() > match.voteDeadline) {
      throw new UnprocessableEntityException({
        code: ErrorCode.MATCH_003,
        message: '투표 마감 후에는 응답을 변경할 수 없습니다.',
      });
    }
    return this.prisma.matchAttendance.upsert({
      where: { matchId_userId: { matchId, userId } },
      create: { matchId, userId, response: dto.response },
      update: { response: dto.response },
      select: { id: true, matchId: true, userId: true, response: true, updatedAt: true },
    });
  }

  async getAttendances(clubId: string, matchId: string, userId: string) {
    await this.assertMember(clubId, userId);
    await this.findMatch(clubId, matchId);
    return this.prisma.matchAttendance.findMany({
      where: { matchId },
      select: {
        userId: true,
        response: true,
        user: { select: { name: true, avatarUrl: true } },
      },
    });
  }

  // ─── 포지션 배정 ───────────────────────────────────────────────────────────

  async getLineup(clubId: string, matchId: string, userId: string) {
    await this.assertMember(clubId, userId);
    await this.findMatch(clubId, matchId);
    return this.prisma.matchQuarter.findMany({
      where: { matchId },
      orderBy: [{ quarterNumber: 'asc' }, { team: 'asc' }],
      select: {
        id: true,
        quarterNumber: true,
        formation: true,
        team: true,
        assignments: {
          select: {
            userId: true,
            position: true,
          },
        },
      },
    });
  }

  async saveLineup(clubId: string, matchId: string, userId: string, dto: SaveLineupDto) {
    await this.assertAdmin(clubId, userId);
    await this.findMatch(clubId, matchId);

    // 참여 선수 검증
    const participantIds = new Set(
      (await this.prisma.matchParticipant.findMany({
        where: { matchId },
        select: { userId: true },
      })).map((p) => p.userId),
    );

    for (const quarter of dto.quarters) {
      for (const assignment of quarter.assignments) {
        if (!participantIds.has(assignment.userId)) {
          throw new NotFoundException({
            code: ErrorCode.MATCH_010,
            message: `참여 선수 목록에 없는 유저입니다: ${assignment.userId}`,
          });
        }
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // 기존 쿼터 전체 삭제
      await tx.matchQuarter.deleteMany({ where: { matchId } });

      // 새 쿼터 생성
      for (const quarter of dto.quarters) {
        await tx.matchQuarter.create({
          data: {
            matchId,
            quarterNumber: quarter.quarterNumber,
            formation: quarter.formation,
            team: quarter.team,
            assignments: {
              create: quarter.assignments.map((a) => ({
                userId: a.userId,
                position: a.position,
              })),
            },
          },
        });
      }

      return tx.matchQuarter.findMany({
        where: { matchId },
        orderBy: [{ quarterNumber: 'asc' }, { team: 'asc' }],
        select: {
          id: true,
          quarterNumber: true,
          formation: true,
          team: true,
          assignments: { select: { userId: true, position: true } },
        },
      });
    });
  }

  async addParticipant(clubId: string, matchId: string, userId: string, targetId: string) {
    await this.assertAdmin(clubId, userId);
    await this.findMatch(clubId, matchId);
    await this.assertMember(clubId, targetId);

    return this.prisma.matchParticipant.upsert({
      where: { matchId_userId: { matchId, userId: targetId } },
      create: { matchId, userId: targetId },
      update: {},
      select: { id: true, matchId: true, userId: true },
    });
  }

  async removeParticipant(clubId: string, matchId: string, userId: string, targetId: string) {
    await this.assertAdmin(clubId, userId);
    await this.findMatch(clubId, matchId);
    await this.prisma.matchParticipant.deleteMany({
      where: { matchId, userId: targetId },
    });
  }

  // ─── 경기 기록 ─────────────────────────────────────────────────────────────

  async submitRecord(clubId: string, matchId: string, userId: string, dto: SubmitRecordDto) {
    await this.assertAdmin(clubId, userId);
    const match = await this.findMatch(clubId, matchId);

    if (new Date() <= match.endAt) {
      throw new UnprocessableEntityException({
        code: ErrorCode.MATCH_004,
        message: '경기 종료 후에만 기록을 입력할 수 있습니다.',
      });
    }

    return this.prisma.$transaction(async (tx) => {
      // 기존 득점 기록 삭제
      await tx.matchGoal.deleteMany({ where: { matchId } });

      // 득점 기록 생성
      if (dto.goals.length > 0) {
        await tx.matchGoal.createMany({
          data: dto.goals.map((g) => ({
            matchId,
            scorerUserId: g.scorerUserId,
            assistUserId: g.assistUserId,
            quarterNumber: g.quarterNumber,
            team: g.team,
          })),
        });
      }

      // 경기 결과 업데이트
      return tx.match.update({
        where: { id: matchId },
        data: {
          homeScore: dto.homeScore,
          awayScore: dto.awayScore,
          isRecordSubmitted: true,
          recordedBy: userId,
          recordedAt: new Date(),
        },
        select: { id: true, homeScore: true, awayScore: true, isRecordSubmitted: true, recordedAt: true },
      });
    });
  }

  async updateRecord(clubId: string, matchId: string, userId: string, dto: UpdateRecordDto) {
    await this.assertAdmin(clubId, userId);
    const match = await this.findMatch(clubId, matchId);

    // 변경 이력 저장용 현재 데이터
    const currentGoals = await this.prisma.matchGoal.findMany({ where: { matchId } });

    return this.prisma.$transaction(async (tx) => {
      // 이력 저장
      await tx.matchRecordHistory.create({
        data: {
          matchId,
          editedBy: userId,
          beforeData: JSON.parse(JSON.stringify({
            homeScore: match.homeScore,
            awayScore: match.awayScore,
            goals: currentGoals,
          })),
          afterData: JSON.parse(JSON.stringify({
            homeScore: dto.homeScore ?? match.homeScore,
            awayScore: dto.awayScore ?? match.awayScore,
            goals: dto.goals ?? currentGoals,
          })),
        },
      });

      if (dto.goals !== undefined) {
        await tx.matchGoal.deleteMany({ where: { matchId } });
        if (dto.goals.length > 0) {
          await tx.matchGoal.createMany({
            data: dto.goals.map((g) => ({
              matchId,
              scorerUserId: g.scorerUserId,
              assistUserId: g.assistUserId,
              quarterNumber: g.quarterNumber,
              team: g.team,
            })),
          });
        }
      }

      return tx.match.update({
        where: { id: matchId },
        data: {
          ...(dto.homeScore !== undefined ? { homeScore: dto.homeScore } : {}),
          ...(dto.awayScore !== undefined ? { awayScore: dto.awayScore } : {}),
          recordedBy: userId,
          recordedAt: new Date(),
        },
        select: { id: true, homeScore: true, awayScore: true, isRecordSubmitted: true, recordedAt: true },
      });
    });
  }

  async getRecordHistories(clubId: string, matchId: string, userId: string) {
    await this.assertAdmin(clubId, userId);
    await this.findMatch(clubId, matchId);
    return this.prisma.matchRecordHistory.findMany({
      where: { matchId },
      orderBy: { editedAt: 'desc' },
      select: {
        id: true,
        editedBy: true,
        editedAt: true,
        beforeData: true,
        afterData: true,
      },
    });
  }

  // ─── MOM 투표 ─────────────────────────────────────────────────────────────

  async submitMomVote(clubId: string, matchId: string, userId: string, dto: SubmitMomVoteDto) {
    await this.assertMember(clubId, userId);
    const match = await this.findMatch(clubId, matchId);

    if (!match.isRecordSubmitted) {
      throw new UnprocessableEntityException({
        code: ErrorCode.MATCH_004,
        message: '경기 기록이 등록된 후에만 MOM 투표가 가능합니다.',
      });
    }

    // 경기 당일 자정 이후 마감
    const deadline = new Date(match.startAt);
    deadline.setHours(23, 59, 59, 999);
    if (new Date() > deadline) {
      throw new UnprocessableEntityException({
        code: ErrorCode.MATCH_005,
        message: 'MOM 투표가 마감되었습니다.',
      });
    }

    const existing = await this.prisma.momVote.findUnique({
      where: { matchId_voterId: { matchId, voterId: userId } },
    });
    if (existing) {
      throw new ConflictException({
        code: ErrorCode.MATCH_006,
        message: '이미 MOM 투표를 완료하였습니다.',
      });
    }

    return this.prisma.momVote.create({
      data: { matchId, voterId: userId, targetUserId: dto.targetUserId },
      select: { id: true, matchId: true, targetUserId: true, createdAt: true },
    });
  }

  async getMomResult(clubId: string, matchId: string, userId: string) {
    await this.assertMember(clubId, userId);
    await this.findMatch(clubId, matchId);

    const votes = await this.prisma.momVote.findMany({
      where: { matchId },
      select: { targetUserId: true },
    });

    const countMap: Record<string, number> = {};
    for (const v of votes) {
      countMap[v.targetUserId] = (countMap[v.targetUserId] ?? 0) + 1;
    }

    // 유저 정보 조회
    const userIds = Object.keys(countMap);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });

    const winners = users
      .map((u) => ({ userId: u.id, name: u.name ?? '', votes: countMap[u.id] ?? 0 }))
      .sort((a, b) => b.votes - a.votes);

    return { winners, totalVoters: votes.length };
  }

  // ─── 댓글 ─────────────────────────────────────────────────────────────────

  async getComments(clubId: string, matchId: string, userId: string, query: GetCommentsQueryDto) {
    await this.assertMember(clubId, userId);
    await this.findMatch(clubId, matchId);
    const limit = query.limit ?? CURSOR_DEFAULT_LIMIT;

    const comments = await this.prisma.matchComment.findMany({
      where: {
        matchId,
        ...(query.cursor ? { id: { lt: query.cursor } } : {}),
      },
      orderBy: { createdAt: 'asc' },
      take: limit + 1,
      select: {
        id: true,
        authorId: true,
        content: true,
        createdAt: true,
        author: { select: { name: true, avatarUrl: true } },
      },
    });

    const hasMore = comments.length > limit;
    const items = hasMore ? comments.slice(0, limit) : comments;
    return { items, nextCursor: hasMore ? items[items.length - 1].id : null };
  }

  async createComment(clubId: string, matchId: string, userId: string, dto: CreateCommentDto) {
    await this.assertMember(clubId, userId);
    await this.findMatch(clubId, matchId);
    return this.prisma.matchComment.create({
      data: { matchId, authorId: userId, content: dto.content },
      select: {
        id: true,
        authorId: true,
        content: true,
        createdAt: true,
        author: { select: { name: true, avatarUrl: true } },
      },
    });
  }

  async deleteComment(clubId: string, matchId: string, commentId: string, userId: string) {
    await this.assertMember(clubId, userId);
    await this.findMatch(clubId, matchId);

    const comment = await this.prisma.matchComment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    });
    if (!comment) {
      throw new NotFoundException({ code: ErrorCode.MATCH_001, message: '댓글이 존재하지 않습니다.' });
    }

    const member = await this.prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } },
      select: { role: true },
    });
    const isAdmin = member?.role !== ClubRole.MEMBER;
    if (comment.authorId !== userId && !isAdmin) {
      throw new ForbiddenException({ code: ErrorCode.MATCH_002, message: '삭제 권한이 없습니다.' });
    }

    await this.prisma.matchComment.delete({ where: { id: commentId } });
  }

  // ─── 영상 ─────────────────────────────────────────────────────────────────

  async registerVideo(clubId: string, matchId: string, userId: string, dto: RegisterVideoDto) {
    await this.assertMember(clubId, userId);
    await this.findMatch(clubId, matchId);
    return this.prisma.matchVideo.create({
      data: { matchId, youtubeUrl: dto.youtubeUrl, registeredBy: userId },
      select: { id: true, youtubeUrl: true, registeredBy: true, createdAt: true },
    });
  }

  async deleteVideo(clubId: string, matchId: string, videoId: string, userId: string) {
    await this.assertMember(clubId, userId);
    await this.findMatch(clubId, matchId);

    const video = await this.prisma.matchVideo.findUnique({
      where: { id: videoId },
      select: { registeredBy: true },
    });
    if (!video) {
      throw new NotFoundException({ code: ErrorCode.MATCH_001, message: '영상이 존재하지 않습니다.' });
    }

    const member = await this.prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } },
      select: { role: true },
    });
    const isAdmin = member?.role !== ClubRole.MEMBER;
    if (video.registeredBy !== userId && !isAdmin) {
      throw new ForbiddenException({ code: ErrorCode.MATCH_002, message: '삭제 권한이 없습니다.' });
    }

    await this.prisma.matchVideo.delete({ where: { id: videoId } });
  }

  // ─── 상대팀 평가 ───────────────────────────────────────────────────────────

  async submitOpponentRating(
    clubId: string,
    matchId: string,
    userId: string,
    dto: SubmitOpponentRatingDto,
  ) {
    await this.assertMember(clubId, userId);
    const match = await this.findMatch(clubId, matchId);

    if (match.type !== MatchType.LEAGUE) {
      throw new UnprocessableEntityException({
        code: ErrorCode.MATCH_007,
        message: '매칭전(LEAGUE) 경기에서만 상대팀 평가가 가능합니다.',
      });
    }
    if (!match.isRecordSubmitted) {
      throw new UnprocessableEntityException({
        code: ErrorCode.MATCH_007,
        message: '경기 기록이 등록된 후에만 상대팀 평가가 가능합니다.',
      });
    }

    const existing = await this.prisma.opponentRating.findUnique({ where: { matchId } });
    if (existing) {
      throw new ConflictException({
        code: ErrorCode.MATCH_008,
        message: '이미 상대팀 평가를 제출하였습니다.',
      });
    }

    return this.prisma.opponentRating.create({
      data: {
        matchId,
        ratedByUserId: userId,
        score: dto.score,
        review: dto.review,
        mvpName: dto.mvpName,
      },
      select: { id: true, matchId: true, score: true, review: true, mvpName: true, createdAt: true },
    });
  }
}
