import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorCode } from '../../common/constants/error-codes';
import type { GetHeadToHeadDto } from './dto/get-head-to-head.dto';
import type {
  HeadToHeadResponseDto,
  HeadToHeadSummaryDto,
  HeadToHeadHistoryItemDto,
} from './dto/head-to-head-response.dto';

const DEFAULT_LIMIT = 10;

@Injectable()
export class HeadToHeadService {
  constructor(private readonly prisma: PrismaService) {}

  async getHeadToHead(
    myClubId: string,
    opponentClubId: string,
    userId: string,
    dto: GetHeadToHeadDto,
  ): Promise<HeadToHeadResponseDto> {
    const limit = dto.limit ?? DEFAULT_LIMIT;

    // 1. 요청자가 myClubId 소속인지 확인
    const membership = await this.prisma.clubMember.findFirst({
      where: { clubId: myClubId, userId },
      select: { id: true },
    });
    if (!membership) {
      throw new ForbiddenException({
        code: ErrorCode.H2H_001,
        message: '해당 클럽 소속이 아닙니다.',
      });
    }

    // 2. 두 클럽 존재 확인 (병렬)
    const [myClub, opponentClub] = await Promise.all([
      this.prisma.club.findFirst({
        where: { id: myClubId, isDeleted: false },
        select: { id: true, name: true },
      }),
      this.prisma.club.findFirst({
        where: { id: opponentClubId, isDeleted: false },
        select: { id: true, name: true },
      }),
    ]);

    if (!myClub || !opponentClub) {
      throw new NotFoundException({
        code: ErrorCode.H2H_002,
        message: '존재하지 않는 클럽입니다.',
      });
    }

    // 3. 맞대결 Match 목록 조회
    //    내 클럽의 Match 레코드 중 matchPostId를 통해 상대 클럽과 연결된 것만 필터
    //    - HOST: MatchPost.clubId = myClubId + MatchApplication(ACCEPTED).applicantClubId = opponentClubId
    //    - GUEST: MatchPost.clubId = opponentClubId + MatchApplication(ACCEPTED).applicantClubId = myClubId
    const matchWhere = {
      clubId: myClubId,
      isDeleted: false,
      isRecordSubmitted: true,
      matchPost: {
        OR: [
          // 내 클럽이 HOST (게시글 등록팀) — 상대가 신청팀
          {
            clubId: myClubId,
            applications: {
              some: {
                applicantClubId: opponentClubId,
                status: 'ACCEPTED' as const,
              },
            },
          },
          // 내 클럽이 GUEST (신청팀) — 상대가 게시글 등록팀
          {
            clubId: opponentClubId,
            applications: {
              some: {
                applicantClubId: myClubId,
                status: 'ACCEPTED' as const,
              },
            },
          },
        ],
      },
    };

    // 커서 조건 추가
    const cursorCondition = dto.cursor ? { startAt: { lt: new Date(dto.cursor) } } : {};

    const rawMatches = await this.prisma.match.findMany({
      where: { ...matchWhere, ...cursorCondition },
      take: limit + 1,
      orderBy: { startAt: 'desc' },
      select: {
        id: true,
        homeScore: true,
        awayScore: true,
        startAt: true,
        matchPost: {
          select: { clubId: true },
        },
      },
    });

    const hasNextPage = rawMatches.length > limit;
    const pageMatches = hasNextPage ? rawMatches.slice(0, limit) : rawMatches;

    // 4. summary 집계 — 전체 맞대결 레코드 (cursor 제외)
    const allMatches = await this.prisma.match.findMany({
      where: matchWhere,
      select: {
        homeScore: true,
        awayScore: true,
        matchPost: { select: { clubId: true } },
      },
    });

    let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
    for (const m of allMatches) {
      const { myScore, opponentScore } = normalizeScore(
        m.homeScore ?? 0,
        m.awayScore ?? 0,
        m.matchPost?.clubId ?? null,
        myClubId,
      );
      goalsFor += myScore;
      goalsAgainst += opponentScore;
      if (myScore > opponentScore) wins++;
      else if (myScore === opponentScore) draws++;
      else losses++;
    }

    const summary: HeadToHeadSummaryDto = {
      myClubId,
      opponentClubId,
      myClubName: myClub.name,
      opponentClubName: opponentClub.name,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
    };

    // 5. 이력 조립
    const history: HeadToHeadHistoryItemDto[] = pageMatches.map((m) => {
      const { myScore, opponentScore } = normalizeScore(
        m.homeScore ?? 0,
        m.awayScore ?? 0,
        m.matchPost?.clubId ?? null,
        myClubId,
      );
      const result: 'WIN' | 'DRAW' | 'LOSS' =
        myScore > opponentScore ? 'WIN' : myScore === opponentScore ? 'DRAW' : 'LOSS';

      return {
        matchId: m.id,
        date: m.startAt.toISOString(),
        myScore,
        opponentScore,
        result,
      };
    });

    const nextCursor =
      hasNextPage ? pageMatches[pageMatches.length - 1].startAt.toISOString() : null;

    return { summary, history, nextCursor, hasNextPage };
  }
}

/**
 * Match 레코드의 homeScore/awayScore를 내 클럽 기준으로 정규화한다.
 * - HOST(MatchPost.clubId === myClubId): homeScore = 내 득점
 * - GUEST: awayScore = 내 득점
 */
function normalizeScore(
  homeScore: number,
  awayScore: number,
  matchPostClubId: string | null,
  myClubId: string,
): { myScore: number; opponentScore: number } {
  const isHost = matchPostClubId === myClubId;
  return {
    myScore: isHost ? homeScore : awayScore,
    opponentScore: isHost ? awayScore : homeScore,
  };
}
