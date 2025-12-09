import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SourceImageDto } from '../../common/dto/source-image.dto';

export class DescribeInteriorImageDto {
  @ValidateNested()
  @Type(() => SourceImageDto)
  sourceImage: SourceImageDto;
}

export class DescribeMasterplanImageDto {
  @ValidateNested()
  @Type(() => SourceImageDto)
  sourceImage: SourceImageDto;
}

export class GenerateImagesDto {
  @ValidateNested()
  @Type(() => SourceImageDto)
  sourceImage: SourceImageDto;

  @IsNotEmpty()
  @IsString()
  prompt: string;

  @IsEnum(['exterior', 'interior', 'floorplan', 'masterplan'])
  renderType: 'exterior' | 'interior' | 'floorplan' | 'masterplan';

  @IsNumber()
  count: number;

  @IsString()
  aspectRatio: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SourceImageDto)
  referenceImage?: SourceImageDto | null;

  @IsOptional()
  @IsBoolean()
  isAnglePrompt?: boolean;

  @IsOptional()
  @IsBoolean()
  useRawPrompt?: boolean;

  @IsOptional()
  @IsEnum(['free', 'pro'])
  modelTier?: 'free' | 'pro';

  @IsOptional()
  @IsEnum(['1K', '2K', '4K'])
  quality?: '1K' | '2K' | '4K';
}

export class UpscaleImageDto {
  @ValidateNested()
  @Type(() => SourceImageDto)
  sourceImage: SourceImageDto;

  @IsEnum(['2k', '4k'])
  target: '2k' | '4k';

  @IsOptional()
  @IsEnum(['flash', 'pro'])
  model?: 'flash' | 'pro';
}

export class EditImageDto {
  @ValidateNested()
  @Type(() => SourceImageDto)
  sourceImage: SourceImageDto;

  @ValidateNested()
  @Type(() => SourceImageDto)
  maskImage: SourceImageDto;

  @IsNotEmpty()
  @IsString()
  prompt: string;
}

export class GenerateImageFromTextDto {
  @IsNotEmpty()
  @IsString()
  prompt: string;
}

export class GeneratePromptsFromImageDto {
  @ValidateNested()
  @Type(() => SourceImageDto)
  sourceImage: SourceImageDto;
}

export class GenerateVideoDto {
  @IsNotEmpty()
  @IsString()
  prompt: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SourceImageDto)
  sourceImage?: SourceImageDto | null;
}

export class CheckVideoStatusDto {
  @IsNotEmpty()
  @IsString()
  operationId: string;
}

export class GenerateVirtualTourImageDto {
  @ValidateNested()
  @Type(() => SourceImageDto)
  sourceImage: SourceImageDto;

  @IsEnum([
    'pan-left',
    'pan-right',
    'pan-up',
    'pan-down',
    'orbit-left',
    'orbit-right',
    'zoom-in',
    'zoom-out',
  ])
  moveType:
    | 'pan-left'
    | 'pan-right'
    | 'pan-up'
    | 'pan-down'
    | 'orbit-left'
    | 'orbit-right'
    | 'zoom-in'
    | 'zoom-out';

  @IsNumber()
  magnitude: number;
}

export class GenerateMoodImagesDto {
  @ValidateNested()
  @Type(() => SourceImageDto)
  sourceImage: SourceImageDto;
}

export class GenerateCompletionPromptsDto {
  @ValidateNested()
  @Type(() => SourceImageDto)
  sourceImage: SourceImageDto;
}

export class GenerateInteriorCompletionPromptsDto {
  @ValidateNested()
  @Type(() => SourceImageDto)
  sourceImage: SourceImageDto;
}
