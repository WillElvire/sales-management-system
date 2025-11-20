import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CashCollectAgent } from './entities/cash-collect-agent.entity';
import { CashCollectTransaction } from './entities/cash-collect-transaction.entity';
import { CashCollectCorridor } from './entities/cash-collect-corridor.entity';
import { CreateCashCollectAgentDto } from './dto/create-cash-collect-agent.dto';
import { CreateCashCollectTransactionDto } from './dto/create-cash-collect-transaction.dto';

@Injectable()
export class CashCollectService {
  constructor(
    @InjectRepository(CashCollectAgent)
    private agentRepository: Repository<CashCollectAgent>,
    @InjectRepository(CashCollectTransaction)
    private transactionRepository: Repository<CashCollectTransaction>,
    @InjectRepository(CashCollectCorridor)
    private corridorRepository: Repository<CashCollectCorridor>,
  ) {}

  async createAgent(createDto: CreateCashCollectAgentDto): Promise<CashCollectAgent> {
    const agent = this.agentRepository.create(createDto);
    return this.agentRepository.save(agent);
  }

  async findAllAgents(): Promise<CashCollectAgent[]> {
    return this.agentRepository.find({ relations: ['transactions'] });
  }

  async findOneAgent(id: string): Promise<CashCollectAgent> {
    const agent = await this.agentRepository.findOne({
      where: { id },
      relations: ['transactions'],
    });
    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }
    return agent;
  }

  async createTransaction(createDto: CreateCashCollectTransactionDto): Promise<CashCollectTransaction> {
    if (!createDto.agentId) {
      throw new NotFoundException('agentId is required');
    }
    const agent = await this.findOneAgent(createDto.agentId);
    if (!agent || !agent.id) {
      throw new NotFoundException(`Agent with ID ${createDto.agentId} not found or invalid`);
    }
    const transaction = this.transactionRepository.create({
      type: createDto.type,
      amount: createDto.amount,
      currency: createDto.currency,
      country: createDto.country,
      destination: createDto.destination,
      destinationName: createDto.destinationName,
      notes: createDto.notes,
      transactionDate: new Date(createDto.transactionDate),
      agent: agent,
    });
    const savedTransaction = await this.transactionRepository.save(transaction);
    
    if (createDto.type === 'encaissement') {
      agent.balance = Number(agent.balance) + Number(createDto.amount);
    } else {
      agent.balance = Number(agent.balance) - Number(createDto.amount);
    }
    await this.agentRepository.save(agent);
    
    return savedTransaction;
  }

  async findAllTransactions(
    startDate?: Date,
    endDate?: Date,
    country?: string,
    currency?: string,
  ): Promise<CashCollectTransaction[]> {
    const where: any = {};
    if (startDate && endDate) {
      where.transactionDate = Between(startDate, endDate);
    }
    if (country) {
      where.country = country;
    }
    if (currency) {
      where.currency = currency;
    }
    return this.transactionRepository.find({
      where,
      relations: ['agent'],
    });
  }

  async getAgentBalance(id: string) {
    const agent = await this.findOneAgent(id);
    return {
      balance: Number(agent.balance),
      currency: agent.currency,
    };
  }

  async getBalanceByCurrency(currency: string) {
    const agents = await this.agentRepository.find({
      where: { currency },
    });
    const total = agents.reduce((sum, agent) => sum + Number(agent.balance), 0);
    return { currency, total };
  }

  async getBalanceByCorridor(corridorId: string) {
    const corridor = await this.corridorRepository.findOne({ where: { id: corridorId } });
    if (!corridor) {
      throw new NotFoundException(`Corridor with ID ${corridorId} not found`);
    }
    return {
      corridor: corridor.name,
      balance: Number(corridor.balance),
      currency: corridor.currency,
    };
  }
}

