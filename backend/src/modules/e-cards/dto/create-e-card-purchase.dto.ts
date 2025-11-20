import { IsString, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { PurchaseType } from '../entities/e-card-purchase.entity';

export class CreateECardPurchaseDto {
  @IsString()
  supplierId: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  rate: number;

  @IsString()
  currency: string;

  @IsEnum(PurchaseType)
  type: PurchaseType;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

