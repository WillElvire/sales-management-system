import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role, RoleName } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find();
  }

  async findOne(id: string): Promise<Role> {
    return this.rolesRepository.findOne({ where: { id } });
  }

  async findByName(name: RoleName): Promise<Role> {
    return this.rolesRepository.findOne({ where: { name } });
  }

  async findByNames(names: RoleName[]): Promise<Role[]> {
    return this.rolesRepository.find({ where: { name: In(names) } });
  }

  async create(name: RoleName, description?: string): Promise<Role> {
    const role = this.rolesRepository.create({ name, description });
    return this.rolesRepository.save(role);
  }
}

