import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const client = this.clientRepository.create(createClientDto);
    return this.clientRepository.save(client);
  }

  findAll(): Promise<Client[]> {
    return this.clientRepository.find({
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException(`Client with id ${id} not found`);
    }
    return client;
  }

  async findByContact(contact: string): Promise<Client | null> {
    return this.clientRepository.findOne({ where: { contact } });
  }

  async search(keyword: string): Promise<Client[]> {
    return this.clientRepository.find({
      where: [
        { firstName: ILike(`%${keyword}%`) },
        { lastName: ILike(`%${keyword}%`) },
        { contact: ILike(`%${keyword}%`) },
        { company: ILike(`%${keyword}%`) },
      ],
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  async findOrCreate(payload: CreateClientDto): Promise<Client> {
    const existing = await this.findByContact(payload.contact);
    if (existing) {
      return existing;
    }
    return this.create(payload);
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);
    Object.assign(client, updateClientDto);
    return this.clientRepository.save(client);
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    await this.clientRepository.remove(client);
  }
}
