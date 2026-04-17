import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import * as memoryStorage from 'multer';
import { PrismaModule } from '../../prisma/prisma.module';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      storage: memoryStorage.memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIMES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('UPLOAD_002'), false);
        }
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
