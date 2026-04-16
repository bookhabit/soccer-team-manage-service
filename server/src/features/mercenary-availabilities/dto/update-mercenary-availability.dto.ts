import { PartialType } from '@nestjs/swagger';
import { CreateMercenaryAvailabilityDto } from './create-mercenary-availability.dto';

export class UpdateMercenaryAvailabilityDto extends PartialType(CreateMercenaryAvailabilityDto) {}
