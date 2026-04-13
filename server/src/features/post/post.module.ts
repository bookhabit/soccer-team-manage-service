import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ClubMembershipModule } from '../../common/club-membership.module';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  imports: [PrismaModule, ClubMembershipModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
