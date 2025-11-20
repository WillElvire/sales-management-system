import { IsString, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { PaymentMethod } from '../entities/usdt-supplier.entity';

export class CreateUsdtSupplierDto {
  @IsString()
  name: string;

  @IsString()
  country: string;

  @IsString()
  trc20Address: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

