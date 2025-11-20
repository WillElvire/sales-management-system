import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../roles/entities/role.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.COMPTABLE)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.COMPTABLE)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post(':id/reset-password')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  resetPassword(@Param('id') id: string, @Body() resetPasswordDto: ResetPasswordDto) {
    return this.usersService.resetPassword(id, resetPasswordDto.newPassword);
  }

  @Post(':id/lock')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  lockAccount(@Param('id') id: string) {
    return this.usersService.lockAccount(id);
  }

  @Post(':id/unlock')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  unlockAccount(@Param('id') id: string) {
    return this.usersService.unlockAccount(id);
  }

  @Post(':id/activate')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  activateAccount(@Param('id') id: string) {
    return this.usersService.activateAccount(id);
  }

  @Post(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  deactivateAccount(@Param('id') id: string) {
    return this.usersService.deactivateAccount(id);
  }
}

