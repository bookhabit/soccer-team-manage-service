import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ClubMembershipService } from './services/club-membership.service';

@Module({
  imports: [PrismaModule],
  providers: [ClubMembershipService],
  exports: [ClubMembershipService],
})
export class ClubMembershipModule {}
