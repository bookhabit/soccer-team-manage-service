import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ClubMembershipModule } from '../../common/club-membership.module';
import { MatchPostsController } from './match-posts.controller';
import { MatchPostsService } from './match-posts.service';

@Module({
  imports: [PrismaModule, ClubMembershipModule],
  controllers: [MatchPostsController],
  providers: [MatchPostsService],
})
export class MatchPostsModule {}
