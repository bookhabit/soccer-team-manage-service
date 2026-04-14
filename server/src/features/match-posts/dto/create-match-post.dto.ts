import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { ClubLevel } from "@prisma/client";

// 마이그레이션 후 @prisma/client 에서 import 가능
enum MatchGender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  MIXED = "MIXED",
}

export class CreateMatchPostDto {
  @ApiProperty({ example: "2026-05-10", description: "경기 날짜 (ISO date)" })
  @IsDateString()
  matchDate!: string;

  @ApiProperty({ example: "14:00", description: "시작 시간 (HH:mm)" })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: "startTime은 HH:mm 형식이어야 합니다." })
  startTime!: string;

  @ApiProperty({ example: "16:00", description: "종료 시간 (HH:mm)" })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: "endTime은 HH:mm 형식이어야 합니다." })
  endTime!: string;

  @ApiProperty({ example: "서울 월드컵경기장", description: "구장 이름" })
  @IsString()
  @MaxLength(100)
  location!: string;

  @ApiPropertyOptional({ example: "서울특별시 마포구 월드컵로 240" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiProperty({ example: 11, description: "인원 수 (5~11)" })
  @IsInt()
  @Min(5)
  @Max(11)
  playerCount!: number;

  @ApiProperty({ enum: MatchGender, example: MatchGender.MIXED })
  @IsEnum(MatchGender)
  gender!: MatchGender;

  @ApiProperty({ enum: ClubLevel, example: ClubLevel.AMATEUR })
  @IsEnum(ClubLevel)
  level!: ClubLevel;

  @ApiProperty({ example: 0, description: "구장비 원(KRW), 0=무료" })
  @IsInt()
  @Min(0)
  fee!: number;

  @ApiProperty({ example: "홍길동", description: "담당자 이름" })
  @IsString()
  @MaxLength(50)
  contactName!: string;

  @ApiProperty({ example: "010-1234-5678", description: "연락처" })
  @IsString()
  @MaxLength(20)
  contactPhone!: string;

  @ApiProperty({ example: "clx1234regionId", description: "지역 ID" })
  @IsString()
  regionId!: string;
}
