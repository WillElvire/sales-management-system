import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { AccountStatus } from '../entities/cash-collect-agent.entity';

export class CreateCashCollectAgentDto {
  @IsString()
  name: string;

  @IsString()
  country: string;

  @IsString()
  currency: string;

  @IsEnum(AccountStatus)
  @IsOptional()
  status?: AccountStatus;
}

