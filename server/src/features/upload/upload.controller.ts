/// <reference types="multer" />
import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { ErrorCode } from '../../common/constants/error-codes';

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /** 프로필 이미지 업로드 */
  @Post('avatar')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: '프로필 이미지 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { image: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 200, description: '업로드 성공 — url 반환' })
  @ApiResponse({ status: 400, description: 'UPLOAD_001 — 파일 없음' })
  @ApiResponse({ status: 413, description: 'UPLOAD_003 — 파일 크기 초과' })
  @ApiResponse({ status: 415, description: 'UPLOAD_002 — 허용되지 않는 파일 형식' })
  async uploadAvatar(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.handleMulterError(file);
    return this.uploadService.uploadAvatar(user.sub, file);
  }

  /** 프로필 이미지 삭제 */
  @Delete('avatar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '프로필 이미지 삭제 (기본 이미지로)' })
  @ApiResponse({ status: 204, description: '삭제 성공' })
  async deleteAvatar(@CurrentUser() user: JwtPayload) {
    await this.uploadService.deleteAvatar(user.sub);
  }

  /** 클럽 로고 업로드 */
  @Post('club-logo/:clubId')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: '클럽 로고 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { image: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 200, description: '업로드 성공 — url 반환' })
  @ApiResponse({ status: 400, description: 'UPLOAD_001 — 파일 없음' })
  @ApiResponse({ status: 403, description: 'UPLOAD_004 — 권한 없음 (CAPTAIN/VICE_CAPTAIN 아님)' })
  @ApiResponse({ status: 404, description: 'UPLOAD_005 — 존재하지 않는 클럽' })
  @ApiResponse({ status: 413, description: 'UPLOAD_003 — 파일 크기 초과' })
  @ApiResponse({ status: 415, description: 'UPLOAD_002 — 허용되지 않는 파일 형식' })
  async uploadClubLogo(
    @Param('clubId') clubId: string,
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.handleMulterError(file);
    return this.uploadService.uploadClubLogo(clubId, user.sub, file);
  }

  /** 클럽 로고 삭제 */
  @Delete('club-logo/:clubId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '클럽 로고 삭제 (기본 이미지로)' })
  @ApiResponse({ status: 204, description: '삭제 성공' })
  @ApiResponse({ status: 403, description: 'UPLOAD_004 — 권한 없음' })
  @ApiResponse({ status: 404, description: 'UPLOAD_005 — 존재하지 않는 클럽' })
  async deleteClubLogo(
    @Param('clubId') clubId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.uploadService.deleteClubLogo(clubId, user.sub);
  }

  // multer fileFilter에서 reject된 파일은 UploadedFile이 undefined로 옴
  // → 여기서 MIME 에러를 표면화
  private handleMulterError(file: Express.Multer.File | undefined): void {
    // file이 없는 경우는 service에서 UPLOAD_001로 처리
    // multer limits 초과 시 PayloadTooLargeException이 자동 throw됨
    // 이 메서드는 현재 예약 확장 포인트
  }
}
