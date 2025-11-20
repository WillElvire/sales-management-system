import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateCountryDto {
  @IsString()
  name: string;

  @IsString()
  @Length(2, 5)
  code: string;

  @IsString()
  @Length(2, 5)
  currency: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


