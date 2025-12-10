import {
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { GeminiActionType } from '../../common/enums';

export class CreateHistoryDto {
  @IsEnum(GeminiActionType)
  actionType!: GeminiActionType;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  sourceImageUrl?: string;

  @IsOptional()
  @IsString()
  resultImageUrl?: string;

  @IsOptional()
  @IsString()
  resultText?: string;

  @IsOptional()
  parameters?: Record<string, unknown>;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsBoolean()
  isSuccess!: boolean;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @IsNumber()
  processingTimeMs?: number;

  @IsOptional()
  @IsNumber()
  cost?: number;
}

export class QueryHistoryDto {
  @IsOptional()
  @IsEnum(GeminiActionType)
  actionType?: GeminiActionType;

  @IsOptional()
  @IsBoolean()
  isSuccess?: boolean;

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 20;
}
