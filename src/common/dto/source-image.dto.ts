import { IsNotEmpty, IsString } from 'class-validator';

export class SourceImageDto {
  @IsNotEmpty()
  @IsString()
  base64!: string;

  @IsNotEmpty()
  @IsString()
  mimeType!: string;
}
