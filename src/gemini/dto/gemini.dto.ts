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

  @IsOptional()
  modelConfig?: { usePro: boolean; resolution: '1K' | '2K' | '4K' };
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

export class MergeFurnitureDto {
  @ValidateNested()
  @Type(() => SourceImageDto)
  roomImage: SourceImageDto;

  @ValidateNested()
  @Type(() => SourceImageDto)
  furnitureImage: SourceImageDto;

  @IsNotEmpty()
  @IsString()
  prompt: string;

  @IsOptional()
  modelConfig?: { usePro: boolean; resolution: '1K' | '2K' | '4K' };
}

export class ChangeMaterialDto {
  @ValidateNested()
  @Type(() => SourceImageDto)
  sourceImage: SourceImageDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SourceImageDto)
  referenceImage?: SourceImageDto | null;

  @IsNotEmpty()
  @IsString()
  prompt: string;

  @IsOptional()
  modelConfig?: { usePro: boolean; resolution: '1K' | '2K' | '4K' };
}

export class ReplaceModelInImageDto {
  @ValidateNested()
  @Type(() => SourceImageDto)
  sourceImage: SourceImageDto;

  @ValidateNested()
  @Type(() => SourceImageDto)
  referenceImage: SourceImageDto;

  @IsNotEmpty()
  @IsString()
  prompt: string;

  @IsOptional()
  modelConfig?: { usePro: boolean; resolution: '1K' | '2K' | '4K' };
}

export class InsertBuildingIntoSiteDto {
  @ValidateNested()
  @Type(() => SourceImageDto)
  siteImage: SourceImageDto;

  @ValidateNested()
  @Type(() => SourceImageDto)
  buildingImage: SourceImageDto;

  @IsNotEmpty()
  @IsString()
  prompt: string;

  @IsOptional()
  modelConfig?: { usePro: boolean; resolution: '1K' | '2K' | '4K' };
}

export class GeneratePerspectivePromptsDto {
  @ValidateNested()
  @Type(() => SourceImageDto)
  sourceImage: SourceImageDto;
}

export class AddCharacterToSceneDto {
  @ValidateNested()
  @Type(() => SourceImageDto)
  sceneImage: SourceImageDto;

  @ValidateNested()
  @Type(() => SourceImageDto)
  characterImage: SourceImageDto;

  @IsNotEmpty()
  @IsString()
  prompt: string;

  @IsOptional()
  modelConfig?: { usePro: boolean; resolution: '1K' | '2K' | '4K' };
}

export class AnalyzeFloorplanDto {
  @ValidateNested()
  @Type(() => SourceImageDto)
  sourceImage: SourceImageDto;

  @IsNotEmpty()
  @IsString()
  roomType: string;

  @IsNotEmpty()
  @IsString()
  roomStyle: string;
}

export class AnalyzeMasterplanDto {
  @ValidateNested()
  @Type(() => SourceImageDto)
  sourceImage: SourceImageDto;
}

export class ColorizeFloorplanDto {
  @ValidateNested()
  @Type(() => SourceImageDto)
  sourceImage: SourceImageDto;

  @IsNotEmpty()
  @IsString()
  stylePrompt: string;

  @IsOptional()
  modelConfig?: { usePro: boolean; resolution: '1K' | '2K' | '4K' };
}
