import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { RegionsService } from './regions.service';

@ApiTags('Regions')
@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '지역 목록 조회 (시도·시군구)' })
  @ApiResponse({ status: 200, description: '지역 목록 반환' })
  findAll() {
    return this.regionsService.findAll();
  }
}
