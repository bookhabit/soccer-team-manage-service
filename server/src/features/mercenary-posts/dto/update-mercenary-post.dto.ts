import { PartialType } from '@nestjs/swagger';
import { CreateMercenaryPostDto } from './create-mercenary-post.dto';

export class UpdateMercenaryPostDto extends PartialType(CreateMercenaryPostDto) {}
