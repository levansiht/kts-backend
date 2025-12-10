import { IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';

export class CreateDepositDto {
  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class SepayWebhookDto {
  @IsString()
  transaction_id!: string;

  @IsNumber()
  amount!: number;

  @IsString()
  account_number!: string;

  @IsString()
  transaction_content!: string;

  @IsString()
  status!: string;

  @IsOptional()
  transaction_date?: string;
}
