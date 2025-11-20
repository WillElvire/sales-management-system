import { IsString, IsNumber, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateECardSaleDto {
  @IsString()
  country: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsDateString()
  saleDate: string;

  @IsString()
  clientFirstName: string;

  @IsString()
  clientLastName: string;

  @IsString()
  clientContact: string;

  @IsOptional()
  @IsUUID()
  clientId?: string;
}

