import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { UsdtSupplier } from './entities/usdt-supplier.entity';
import { UsdtPurchase } from './entities/usdt-purchase.entity';
import { UsdtAccount } from './entities/usdt-account.entity';
import { UsdtPaymentProof } from './entities/usdt-payment-proof.entity';
import { CreateUsdtSupplierDto } from './dto/create-usdt-supplier.dto';
import { CreateUsdtPurchaseDto } from './dto/create-usdt-purchase.dto';
import { CreateUsdtAccountDto } from './dto/create-usdt-account.dto';

@Injectable()
export class UsdtService {
  constructor(
    @InjectRepository(UsdtSupplier)
    private supplierRepository: Repository<UsdtSupplier>,
    @InjectRepository(UsdtPurchase)
    private purchaseRepository: Repository<UsdtPurchase>,
    @InjectRepository(UsdtAccount)
    private accountRepository: Repository<UsdtAccount>,
    @InjectRepository(UsdtPaymentProof)
    private paymentProofRepository: Repository<UsdtPaymentProof>,
  ) {}

  async createSupplier(createDto: CreateUsdtSupplierDto): Promise<UsdtSupplier> {
    const supplier = this.supplierRepository.create(createDto);
    return this.supplierRepository.save(supplier);
  }

  async findAllSuppliers(): Promise<UsdtSupplier[]> {
    return this.supplierRepository.find({
      relations: ['purchases', 'accounts'],
    });
  }

  async findOneSupplier(id: string): Promise<UsdtSupplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
      relations: ['purchases', 'accounts'],
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return supplier;
  }

  async createPurchase(createDto: CreateUsdtPurchaseDto): Promise<UsdtPurchase> {
    const supplier = await this.findOneSupplier(createDto.supplierId);
    const purchase = this.purchaseRepository.create({
      ...createDto,
      supplierId: supplier.id,
      supplier,
    });
    const savedPurchase = await this.purchaseRepository.save(purchase);
    
    supplier.balance = Number(supplier.balance) + Number(createDto.amount);
    await this.supplierRepository.save(supplier);
    
    return savedPurchase;
  }

  async findAllPurchases(startDate?: Date, endDate?: Date, country?: string): Promise<UsdtPurchase[]> {
    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }
    if (country) {
      where.country = country;
    }
    return this.purchaseRepository.find({
      where,
      relations: ['supplier'],
    });
  }

  async createAccount(createDto: CreateUsdtAccountDto): Promise<UsdtAccount> {
    await this.findOneSupplier(createDto.supplierId);
    const account = this.accountRepository.create(createDto);
    return this.accountRepository.save(account);
  }

  async findAllAccounts(): Promise<UsdtAccount[]> {
    return this.accountRepository.find({ relations: ['supplier'] });
  }

  async activateAccount(id: string): Promise<UsdtAccount> {
    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    account.status = 'active' as any;
    return this.accountRepository.save(account);
  }

  async deactivateAccount(id: string): Promise<UsdtAccount> {
    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    account.status = 'inactive' as any;
    return this.accountRepository.save(account);
  }

  async addPaymentProof(supplierId: string, filePath: string, notes?: string): Promise<UsdtPaymentProof> {
    await this.findOneSupplier(supplierId);
    const proof = this.paymentProofRepository.create({
      supplierId,
      filePath,
      notes,
    });
    return this.paymentProofRepository.save(proof);
  }

  async getSupplierBalance(id: string) {
    const supplier = await this.findOneSupplier(id);
    const totalPurchases = supplier.purchases?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    return {
      balance: Number(supplier.balance),
      totalPurchases,
      difference: Number(supplier.balance) - totalPurchases,
    };
  }
}

