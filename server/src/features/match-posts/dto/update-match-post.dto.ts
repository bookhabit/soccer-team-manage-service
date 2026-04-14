import { PartialType } from '@nestjs/swagger';
import { CreateMatchPostDto } from './create-match-post.dto';

export class UpdateMatchPostDto extends PartialType(CreateMatchPostDto) {}
