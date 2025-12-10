import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  oldPassword!: string;

  @IsString()
  @MinLength(6)
  newPassword!: string;
}

export class UpdateEmailDto {
  @IsEmail()
  newEmail!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
