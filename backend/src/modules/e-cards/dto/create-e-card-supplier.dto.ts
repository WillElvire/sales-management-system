import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { PaymentMethod } from '../entities/e-card-supplier.entity';

export class CreateECardSupplierDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

