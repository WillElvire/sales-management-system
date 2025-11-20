import { IsString, IsEnum, IsOptional } from 'class-validator';
import { AccountStatus } from '../entities/usdt-account.entity';

export class CreateUsdtAccountDto {
  @IsString()
  supplierId: string;

  @IsString()
  accountName: string;

  @IsEnum(AccountStatus)
  @IsOptional()
  status?: AccountStatus;
}

