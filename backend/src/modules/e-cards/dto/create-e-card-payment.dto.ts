import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateECardPaymentDto {
  @IsString()
  supplierId: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  @IsOptional()
  proofOfPayment?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

