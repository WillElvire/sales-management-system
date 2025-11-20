import { IsString, IsNumber, IsEnum, IsDateString, IsOptional, IsNotEmpty } from 'class-validator';
import { TransactionType, TransactionDestination } from '../entities/cash-collect-transaction.entity';

export class CreateCashCollectTransactionDto {
  @IsNotEmpty()
  @IsString()
  agentId: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  country: string;

  @IsEnum(TransactionDestination)
  @IsOptional()
  destination?: TransactionDestination;

  @IsString()
  @IsOptional()
  destinationName?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  transactionDate: string;
}

