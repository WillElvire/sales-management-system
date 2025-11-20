import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateUsdtPurchaseDto {
  @IsString()
  supplierId: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  rate: number;

  @IsString()
  currency: string;

  @IsString()
  country: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

