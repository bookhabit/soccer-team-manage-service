import { Module } from '@nestjs/common';
import { HeadToHeadService } from './head-to-head.service';
import { HeadToHeadController } from './head-to-head.controller';

@Module({
  providers: [HeadToHeadService],
  controllers: [HeadToHeadController],
})
export class HeadToHeadModule {}
