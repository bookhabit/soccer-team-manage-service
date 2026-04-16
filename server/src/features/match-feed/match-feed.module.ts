import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { MatchFeedService } from './match-feed.service';
import { MatchFeedController } from './match-feed.controller';

@Module({
  imports: [PrismaModule],
  providers: [MatchFeedService],
  controllers: [MatchFeedController],
})
export class MatchFeedModule {}
