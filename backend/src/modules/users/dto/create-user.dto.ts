import { IsString, IsEmail, IsOptional, IsArray, IsEnum } from 'class-validator';
import { UserStatus } from '../entities/user.entity';
import { RoleName } from '../../roles/entities/role.entity';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @IsArray()
  @IsOptional()
  roleNames?: RoleName[];
}

