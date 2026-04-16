import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorCode } from '../../common/constants/error-codes';
import type { GetMatchFeedDto } from './dto/get-match-feed.dto';
import type {
  MatchFeedPageResponseDto,
  MatchFeedDetailResponseDto,
  MatchFeedItemResponseDto,
  MatchGoalItemDto,
  MomItemDto,
} from './dto/match-feed-response.dto';

const DEFAULT_LIMIT = 20;
const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000; // 약 6개월 (180일)

@Injectable()
export class MatchFeedService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── 피드 목록 ──────────────────────────────────────────────────────────────

  async getFeed(dto: GetMatchFeedDto, userId: string): Promise<MatchFeedPageResponseDto> {
    // 검증: district만 있고 province 없음
    if (dto.district && !dto.province) {
      throw new BadRequestException({
        code: ErrorCode.MATCH_FEED_001,
        message: 'district 필터는 province와 함께 사용해야 합니다.',
      });
    }

    // 검증: 날짜 범위 6개월 초과
    if (dto.from && dto.to) {
      const fromMs = new Date(dto.from).getTime();
      const toMs = new Date(dto.to).getTime();
      if (toMs - fromMs > SIX_MONTHS_MS) {
        throw new BadRequestException({
          code: ErrorCode.MATCH_FEED_002,
          message: '날짜 범위는 최대 6개월까지 설정할 수 있습니다.',
        });
      }
    }

    const limit = dto.limit ?? DEFAULT_LIMIT;

    // myClub 필터: 소속 클럽 id 조회
    let myClubId: string | undefined;
    if (dto.myClub) {
      const membership = await this.prisma.clubMember.findFirst({
        where: { userId, club: { isDeleted: false } },
        select: { clubId: true },
      });
      if (membership) {
        myClubId = membership.clubId;
      }
      // 미소속이면 myClub 조건 무시 (myClubId = undefined)
    }

    // where 조건 조립
    const where: Record<string, unknown> = {
      isRecordSubmitted: true,
      isDeleted: false,
      ...(dto.type ? { type: dto.type } : {}),
      ...(myClubId ? { clubId: myClubId } : {}),
      ...(dto.myMatches ? { participants: { some: { userId } } } : {}),
      ...(dto.province || dto.district
        ? {
            club: {
              region: {
                ...(dto.province ? { name: dto.province } : {}),
                ...(dto.district ? { sigungu: dto.district } : {}),
              },
            },
          }
        : {}),
      ...(dto.from || dto.to
        ? {
            startAt: {
              ...(dto.from ? { gte: new Date(dto.from) } : {}),
              ...(dto.to ? { lte: new Date(dto.to) } : {}),
            },
          }
        : {}),
    };

    const matches = await this.prisma.match.findMany({
      where,
      ...(dto.cursor ? { cursor: { id: dto.cursor }, skip: 1 } : {}),
      take: limit + 1,
      orderBy: [{ startAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        type: true,
        clubId: true,
        location: true,
        startAt: true,
        homeScore: true,
        awayScore: true,
        opponentName: true,
        club: {
          select: {
            name: true,
            logoUrl: true,
            region: {
              select: { name: true, sigungu: true },
            },
          },
        },
        momVotes: {
          select: {
            targetUserId: true,
          },
        },
      },
    });

    // MOM 집계 (서비스 레이어에서 Map 집계 — N+1 방지)
    const hasMore = matches.length > limit;
    const pageMatches = hasMore ? matches.slice(0, limit) : matches;

    // targetUserId → name 조회 (피드 아이템마다 최다 득표자 1명)
    const allTargetIds = new Set<string>();
    for (const m of pageMatches) {
      for (const v of m.momVotes) {
        allTargetIds.add(v.targetUserId);
      }
    }

    const momUsers =
      allTargetIds.size > 0
        ? await this.prisma.user.findMany({
            where: { id: { in: Array.from(allTargetIds) } },
            select: { id: true, name: true },
          })
        : [];
    const momUserMap = new Map(momUsers.map((u) => [u.id, u.name ?? '']));

    const items: MatchFeedItemResponseDto[] = pageMatches.map((m) => {
      // 최다 득표 1명 추출
      const countMap: Record<string, number> = {};
      for (const v of m.momVotes) {
        countMap[v.targetUserId] = (countMap[v.targetUserId] ?? 0) + 1;
      }
      const topEntry = Object.entries(countMap).sort((a, b) => b[1] - a[1])[0];
      const momUserId = topEntry ? topEntry[0] : null;
      const momUserName = momUserId ? (momUserMap.get(momUserId) ?? null) : null;

      return {
        id: m.id,
        type: m.type,
        clubId: m.clubId,
        clubName: m.club.name,
        clubLogoUrl: m.club.logoUrl ?? null,
        homeScore: m.homeScore ?? 0,
        awayScore: m.awayScore ?? 0,
        opponentName: m.opponentName ?? null,
        momUserId,
        momUserName,
        province: m.club.region.name,
        district: m.club.region.sigungu,
        location: m.location,
        startAt: m.startAt.toISOString(),
      };
    });

    const nextCursor = hasMore ? pageMatches[pageMatches.length - 1].id : null;

    return { items, nextCursor };
  }

  // ─── 경기 상세 ──────────────────────────────────────────────────────────────

  async getDetail(matchId: string, _userId: string): Promise<MatchFeedDetailResponseDto> {
    const match = await this.prisma.match.findFirst({
      where: { id: matchId, isDeleted: false, isRecordSubmitted: true },
      select: {
        id: true,
        type: true,
        clubId: true,
        location: true,
        startAt: true,
        homeScore: true,
        awayScore: true,
        opponentName: true,
        club: {
          select: {
            name: true,
            logoUrl: true,
            region: { select: { name: true, sigungu: true } },
          },
        },
        goals: {
          select: {
            scorerUserId: true,
            assistUserId: true,
            quarterNumber: true,
            team: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        momVotes: {
          select: { targetUserId: true },
        },
      },
    });

    if (!match) {
      throw new NotFoundException({
        code: ErrorCode.MATCH_001,
        message: '존재하지 않는 경기입니다.',
      });
    }

    // 참여자 수
    const participantCount = await this.prisma.matchParticipant.count({
      where: { matchId },
    });

    // MOM 집계 — 동점 복수 처리
    const momCountMap: Record<string, number> = {};
    for (const v of match.momVotes) {
      momCountMap[v.targetUserId] = (momCountMap[v.targetUserId] ?? 0) + 1;
    }
    const maxCount =
      Object.values(momCountMap).length > 0
        ? Math.max(...Object.values(momCountMap))
        : 0;
    const topUserIds = Object.entries(momCountMap)
      .filter(([, count]) => count === maxCount)
      .map(([uid]) => uid);

    let momList: MomItemDto[] = [];
    if (topUserIds.length > 0) {
      const topUsers = await this.prisma.user.findMany({
        where: { id: { in: topUserIds } },
        select: { id: true, name: true },
      });
      momList = topUsers.map((u) => ({
        userId: u.id,
        userName: u.name ?? '',
        voteCount: momCountMap[u.id] ?? 0,
      }));
    }

    // 득점 기록 — scorerUserName, assistUserName 조회
    const scorerIds = new Set<string>();
    for (const g of match.goals) {
      scorerIds.add(g.scorerUserId);
      if (g.assistUserId) scorerIds.add(g.assistUserId);
    }

    const goalUsers =
      scorerIds.size > 0
        ? await this.prisma.user.findMany({
            where: { id: { in: Array.from(scorerIds) } },
            select: { id: true, name: true },
          })
        : [];
    const goalUserMap = new Map(goalUsers.map((u) => [u.id, u.name ?? '']));

    const goals: MatchGoalItemDto[] = match.goals.map((g) => ({
      scorerUserId: g.scorerUserId,
      scorerUserName: goalUserMap.get(g.scorerUserId) ?? '',
      assistUserId: g.assistUserId ?? null,
      assistUserName: g.assistUserId ? (goalUserMap.get(g.assistUserId) ?? null) : null,
      quarterNumber: g.quarterNumber ?? null,
      team: g.team ?? null,
    }));

    return {
      id: match.id,
      type: match.type,
      clubId: match.clubId,
      clubName: match.club.name,
      clubLogoUrl: match.club.logoUrl ?? null,
      homeScore: match.homeScore ?? 0,
      awayScore: match.awayScore ?? 0,
      opponentName: match.opponentName ?? null,
      goals,
      momList,
      participantCount,
      province: match.club.region.name,
      district: match.club.region.sigungu,
      location: match.location,
      startAt: match.startAt.toISOString(),
    };
  }
}
