/// <reference types="multer" />
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { join } from 'path';
import { writeFile, unlink } from 'fs/promises';
import { mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { ClubRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorCode } from '../../common/constants/error-codes';

const UPLOAD_ROOT = join(process.cwd(), 'uploads');
const DEFAULTS_PREFIX = '/uploads/defaults/';
const IMAGE_SIZE = 256;
const JPEG_QUALITY = 80;

@Injectable()
export class UploadService {
  constructor(private readonly prisma: PrismaService) {
    // 업로드 폴더 보장
    ['uploads/avatars', 'uploads/clubs', 'uploads/defaults'].forEach((dir) =>
      mkdirSync(join(process.cwd(), dir), { recursive: true }),
    );
  }

  // ─── 프로필 이미지 ────────────────────────────────────────────────────────

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<{ url: string }> {
    this.assertFile(file);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    const buffer = await this.processImage(file.buffer);
    const url = await this.saveFile(buffer, 'avatars');

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: url },
    });

    if (user?.avatarUrl) {
      await this.deleteOldFile(user.avatarUrl);
    }

    return { url };
  }

  async deleteAvatar(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
    });

    if (user?.avatarUrl) {
      await this.deleteOldFile(user.avatarUrl);
    }
  }

  // ─── 클럽 로고 ────────────────────────────────────────────────────────────

  async uploadClubLogo(
    clubId: string,
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ url: string }> {
    this.assertFile(file);
    await this.assertClubPermission(clubId, userId);

    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
      select: { logoUrl: true },
    });

    const buffer = await this.processImage(file.buffer);
    const url = await this.saveFile(buffer, 'clubs');

    await this.prisma.club.update({
      where: { id: clubId },
      data: { logoUrl: url },
    });

    if (club?.logoUrl) {
      await this.deleteOldFile(club.logoUrl);
    }

    return { url };
  }

  async deleteClubLogo(clubId: string, userId: string): Promise<void> {
    await this.assertClubPermission(clubId, userId);

    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
      select: { logoUrl: true },
    });

    await this.prisma.club.update({
      where: { id: clubId },
      data: { logoUrl: null },
    });

    if (club?.logoUrl) {
      await this.deleteOldFile(club.logoUrl);
    }
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private assertFile(file: Express.Multer.File | undefined): void {
    if (!file) {
      throw new BadRequestException({
        code: ErrorCode.UPLOAD_001,
        message: '파일이 첨부되지 않았습니다.',
      });
    }
  }

  private async assertClubPermission(clubId: string, userId: string): Promise<void> {
    const member = await this.prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } },
      select: { role: true },
    });

    if (!member) {
      // 클럽 존재 여부 구분
      const club = await this.prisma.club.findUnique({ where: { id: clubId }, select: { id: true } });
      if (!club) {
        throw new NotFoundException({
          code: ErrorCode.UPLOAD_005,
          message: '존재하지 않는 클럽입니다.',
        });
      }
      throw new ForbiddenException({
        code: ErrorCode.UPLOAD_004,
        message: '클럽 로고 수정 권한이 없습니다.',
      });
    }

    if (member.role !== ClubRole.CAPTAIN && member.role !== ClubRole.VICE_CAPTAIN) {
      throw new ForbiddenException({
        code: ErrorCode.UPLOAD_004,
        message: '클럽 로고 수정 권한이 없습니다.',
      });
    }
  }

  private async processImage(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(IMAGE_SIZE, IMAGE_SIZE, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: JPEG_QUALITY })
      .toBuffer();
  }

  private async saveFile(buffer: Buffer, folder: 'avatars' | 'clubs'): Promise<string> {
    const filename = `${uuidv4()}.jpg`;
    const filePath = join(UPLOAD_ROOT, folder, filename);
    await writeFile(filePath, buffer);
    return `/uploads/${folder}/${filename}`;
  }

  private async deleteOldFile(url: string): Promise<void> {
    // 기본 이미지는 삭제하지 않음
    if (url.startsWith(DEFAULTS_PREFIX)) return;

    try {
      const filePath = join(process.cwd(), url);
      await unlink(filePath);
    } catch {
      // 파일이 이미 없는 경우 무시
    }
  }
}
