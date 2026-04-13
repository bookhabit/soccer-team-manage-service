import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ClubMembershipModule } from '../../common/club-membership.module';
import { ClubController } from './club.controller';
import { ClubService } from './club.service';

@Module({
  imports: [PrismaModule, ClubMembershipModule],
  controllers: [ClubController],
  providers: [ClubService],
  exports: [ClubService],
})
export class ClubModule {}
