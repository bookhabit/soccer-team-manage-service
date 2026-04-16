import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { MercenaryPostsController } from './mercenary-posts.controller';
import { MercenaryPostsService } from './mercenary-posts.service';

@Module({
  imports: [PrismaModule],
  controllers: [MercenaryPostsController],
  providers: [MercenaryPostsService],
})
export class MercenaryPostsModule {}
