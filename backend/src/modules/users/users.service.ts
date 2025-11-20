import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private rolesService: RolesService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    if (createUserDto.roleNames && createUserDto.roleNames.length > 0) {
      const roles = await this.rolesService.findByNames(createUserDto.roleNames);
      user.roles = roles;
    }

    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['roles'] });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { username },
      relations: ['roles'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto | Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    
    if ('password' in updateUserDto && updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if ('roleNames' in updateUserDto && updateUserDto.roleNames) {
      const roles = await this.rolesService.findByNames(updateUserDto.roleNames);
      user.roles = roles;
      delete (updateUserDto as any).roleNames;
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(id, { password: hashedPassword });
  }

  async lockAccount(id: string): Promise<User> {
    return this.update(id, { status: 'locked' as any });
  }

  async unlockAccount(id: string): Promise<User> {
    return this.update(id, { status: 'active' as any });
  }

  async activateAccount(id: string): Promise<User> {
    return this.update(id, { status: 'active' as any });
  }

  async deactivateAccount(id: string): Promise<User> {
    return this.update(id, { status: 'inactive' as any });
  }
}

