import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { MercenaryAvailabilitiesController, NoShowReportsController } from './mercenary-availabilities.controller';
import { MercenaryAvailabilitiesService } from './mercenary-availabilities.service';
import { NoShowReportsService } from './no-show-reports.service';

@Module({
  imports: [PrismaModule],
  controllers: [MercenaryAvailabilitiesController, NoShowReportsController],
  providers: [MercenaryAvailabilitiesService, NoShowReportsService],
})
export class MercenaryAvailabilitiesModule {}
