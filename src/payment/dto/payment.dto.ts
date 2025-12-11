import {
  IsNumber,
  IsPositive,
  IsOptional,
  IsString,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDepositDto {
  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;
}

// DTO cho IPN từ Sepay
export class SepayOrderDto {
  @IsString()
  id!: string;

  @IsString()
  order_id!: string;

  @IsString()
  order_status!: string;

  @IsString()
  order_currency!: string;

  @IsString()
  order_amount!: string;

  @IsString()
  order_invoice_number!: string;

  @IsOptional()
  custom_data?: any[];

  @IsOptional()
  @IsString()
  user_agent?: string;

  @IsOptional()
  @IsString()
  ip_address?: string;

  @IsOptional()
  @IsString()
  order_description?: string;
}

export class SepayTransactionDto {
  @IsString()
  id!: string;

  @IsString()
  payment_method!: string;

  @IsString()
  transaction_id!: string;

  @IsString()
  transaction_type!: string;

  @IsString()
  transaction_date!: string;

  @IsString()
  transaction_status!: string;

  @IsString()
  transaction_amount!: string;

  @IsString()
  transaction_currency!: string;

  @IsString()
  authentication_status!: string;

  @IsOptional()
  @IsString()
  card_number?: string | null;

  @IsOptional()
  @IsString()
  card_holder_name?: string | null;

  @IsOptional()
  @IsString()
  card_expiry?: string | null;

  @IsOptional()
  @IsString()
  card_funding_method?: string | null;

  @IsOptional()
  @IsString()
  card_brand?: string | null;
}

export class SepayIpnDto {
  @IsNumber()
  timestamp!: number;

  @IsString()
  notification_type!: string;

  @ValidateNested()
  @Type(() => SepayOrderDto)
  order!: SepayOrderDto;

  @ValidateNested()
  @Type(() => SepayTransactionDto)
  transaction!: SepayTransactionDto;

  @IsOptional()
  customer?: any;

  @IsOptional()
  agreement?: any;
}

// DTO cũ cho backward compatibility
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
