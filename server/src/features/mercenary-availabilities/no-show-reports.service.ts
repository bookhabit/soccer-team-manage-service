import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { MercenaryApplicationStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorCode } from '../../common/constants/error-codes';
import type { CreateNoShowReportDto } from './dto/create-no-show-report.dto';

@Injectable()
export class NoShowReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(reporterId: string, dto: CreateNoShowReportDto) {
    const { reportedUserId, applicationId, recruitmentId, reason } = dto;

    if (!applicationId && !recruitmentId) {
      throw new ForbiddenException({
        code: ErrorCode.NO_SHOW_REPORT_001,
        message: '신고 대상 신청 ID가 필요합니다.',
      });
    }

    // 입단 신청 기반 신고
    if (applicationId) {
      const app = await this.prisma.mercenaryApplication.findUnique({
        where: { id: applicationId },
        select: {
          status: true,
          applicantId: true,
          post: { select: { matchDate: true, createdBy: true } },
        },
      });
      if (!app) {
        throw new NotFoundException({
          code: ErrorCode.MERCENARY_APP_001,
          message: '존재하지 않는 신청입니다.',
        });
      }
      if (app.status !== MercenaryApplicationStatus.ACCEPTED) {
        throw new ForbiddenException({
          code: ErrorCode.NO_SHOW_REPORT_001,
          message: '수락된 신청만 신고할 수 있습니다.',
        });
      }
      // 신고 가능 방향 확인 (팀→용병 or 용병→팀)
      const isTeamReportingPlayer = app.post.createdBy === reporterId;
      const isPlayerReportingTeam = app.applicantId === reporterId;
      if (!isTeamReportingPlayer && !isPlayerReportingTeam) {
        throw new ForbiddenException({
          code: ErrorCode.NO_SHOW_REPORT_001,
          message: '해당 신청의 관계자만 신고할 수 있습니다.',
        });
      }
      // 경기 날짜 이후만 신고 가능
      if (new Date(app.post.matchDate) > new Date()) {
        throw new UnprocessableEntityException({
          code: ErrorCode.NO_SHOW_REPORT_002,
          message: '경기 날짜 이후에만 신고할 수 있습니다.',
        });
      }
      // 중복 신고 체크
      const existing = await this.prisma.noShowReport.findUnique({
        where: { reporterId_applicationId: { reporterId, applicationId } },
      });
      if (existing) {
        throw new ConflictException({
          code: ErrorCode.NO_SHOW_REPORT_003,
          message: '이미 신고한 내역이 있습니다.',
        });
      }
    }

    // 영입 신청 기반 신고
    if (recruitmentId) {
      const rec = await this.prisma.mercenaryRecruitment.findUnique({
        where: { id: recruitmentId },
        select: {
          status: true,
          recruitedBy: true,
          availability: {
            select: {
              userId: true,
              availableDates: true,
            },
          },
        },
      });
      if (!rec) {
        throw new NotFoundException({
          code: ErrorCode.MERCENARY_APP_001,
          message: '존재하지 않는 영입 신청입니다.',
        });
      }
      if (rec.status !== MercenaryApplicationStatus.ACCEPTED) {
        throw new ForbiddenException({
          code: ErrorCode.NO_SHOW_REPORT_001,
          message: '수락된 신청만 신고할 수 있습니다.',
        });
      }
      const isTeam = rec.recruitedBy === reporterId;
      const isPlayer = rec.availability.userId === reporterId;
      if (!isTeam && !isPlayer) {
        throw new ForbiddenException({
          code: ErrorCode.NO_SHOW_REPORT_001,
          message: '해당 신청의 관계자만 신고할 수 있습니다.',
        });
      }
      // 영입 신청은 availableDates 중 마지막 날짜 기준
      const maxDate = rec.availability.availableDates.length
        ? new Date(Math.max(...rec.availability.availableDates.map((d) => new Date(d).getTime())))
        : null;
      if (!maxDate || maxDate > new Date()) {
        throw new UnprocessableEntityException({
          code: ErrorCode.NO_SHOW_REPORT_002,
          message: '경기 날짜 이후에만 신고할 수 있습니다.',
        });
      }
      // 중복 체크
      const existing = await this.prisma.noShowReport.findUnique({
        where: { reporterId_recruitmentId: { reporterId, recruitmentId } },
      });
      if (existing) {
        throw new ConflictException({
          code: ErrorCode.NO_SHOW_REPORT_003,
          message: '이미 신고한 내역이 있습니다.',
        });
      }
    }

    await this.prisma.noShowReport.create({
      data: {
        reporterId,
        reportedUserId,
        applicationId,
        recruitmentId,
        reason,
      },
    });

    // TODO: 상대방에게 신고 접수 알림 및 반박 기회 제공
    console.log(`[NO_SHOW] 신고 접수 — reporter: ${reporterId}, reported: ${reportedUserId}`);
  }
}
