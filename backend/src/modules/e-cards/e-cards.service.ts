import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ECardSupplier } from './entities/e-card-supplier.entity';
import { ECardPurchase } from './entities/e-card-purchase.entity';
import { ECardSale } from './entities/e-card-sale.entity';
import { ECardPayment } from './entities/e-card-payment.entity';
import { CreateECardSupplierDto } from './dto/create-e-card-supplier.dto';
import { CreateECardPurchaseDto } from './dto/create-e-card-purchase.dto';
import { CreateECardSaleDto } from './dto/create-e-card-sale.dto';
import { CreateECardPaymentDto } from './dto/create-e-card-payment.dto';
import { ClientsService } from '../clients/clients.service';
import { Client } from '../clients/entities/client.entity';

@Injectable()
export class ECardsService {
  constructor(
    @InjectRepository(ECardSupplier)
    private supplierRepository: Repository<ECardSupplier>,
    @InjectRepository(ECardPurchase)
    private purchaseRepository: Repository<ECardPurchase>,
    @InjectRepository(ECardSale)
    private saleRepository: Repository<ECardSale>,
    @InjectRepository(ECardPayment)
    private paymentRepository: Repository<ECardPayment>,
    private readonly clientsService: ClientsService,
  ) {}

  async createSupplier(createDto: CreateECardSupplierDto): Promise<ECardSupplier> {
    const supplier = this.supplierRepository.create(createDto);
    return this.supplierRepository.save(supplier);
  }

  async findAllSuppliers(): Promise<ECardSupplier[]> {
    return this.supplierRepository.find({
      relations: ['purchases', 'payments'],
    });
  }

  async findOneSupplier(id: string): Promise<ECardSupplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
      relations: ['purchases', 'payments'],
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return supplier;
  }

  async createPurchase(createDto: CreateECardPurchaseDto): Promise<ECardPurchase> {
    const supplier = await this.findOneSupplier(createDto.supplierId);
    const purchase = this.purchaseRepository.create({
      ...createDto,
      dueDate: createDto.dueDate ? new Date(createDto.dueDate) : null,
    });
    const savedPurchase = await this.purchaseRepository.save(purchase);
    
    if (createDto.type === 'direct') {
      supplier.balance = Number(supplier.balance) + Number(createDto.amount);
      await this.supplierRepository.save(supplier);
    } else {
      supplier.balance = Number(supplier.balance) - Number(createDto.amount);
      await this.supplierRepository.save(supplier);
    }
    
    return savedPurchase;
  }

  async findAllPurchases(startDate?: Date, endDate?: Date): Promise<ECardPurchase[]> {
    if (startDate && endDate) {
      return this.purchaseRepository.find({
        where: {
          createdAt: Between(startDate, endDate),
        },
        relations: ['supplier'],
      });
    }
    return this.purchaseRepository.find({ relations: ['supplier'] });
  }

  async createSale(createDto: CreateECardSaleDto): Promise<ECardSale> {
    let client: Client | null = null;

    if (createDto.clientId) {
      client = await this.clientsService.findOne(createDto.clientId);
    } else {
      client = await this.clientsService.findOrCreate({
        firstName: createDto.clientFirstName,
        lastName: createDto.clientLastName,
        contact: createDto.clientContact,
        isActive: true,
      });
    }

    const sale = this.saleRepository.create({
      country: createDto.country,
      amount: createDto.amount,
      currency: createDto.currency,
      saleDate: new Date(createDto.saleDate),
      clientFirstName: createDto.clientFirstName || client?.firstName || '',
      clientLastName: createDto.clientLastName || client?.lastName || '',
      clientContact: createDto.clientContact || client?.contact || '',
      clientId: client?.id,
      client,
    });
    return this.saleRepository.save(sale);
  }

  async findAllSales(startDate?: Date, endDate?: Date): Promise<ECardSale[]> {
    if (startDate && endDate) {
      return this.saleRepository.find({
        where: {
          saleDate: Between(startDate, endDate),
        },
        relations: ['client'],
      });
    }
    return this.saleRepository.find({ relations: ['client'] });
  }

  async createPayment(createDto: CreateECardPaymentDto): Promise<ECardPayment> {
    const supplier = await this.findOneSupplier(createDto.supplierId);
    const payment = this.paymentRepository.create(createDto);
    const savedPayment = await this.paymentRepository.save(payment);
    
    supplier.balance = Number(supplier.balance) - Number(createDto.amount);
    await this.supplierRepository.save(supplier);
    
    return savedPayment;
  }

  async findAllPayments(): Promise<ECardPayment[]> {
    return this.paymentRepository.find({ relations: ['supplier'] });
  }

  async getSupplierBalance(id: string) {
    const supplier = await this.findOneSupplier(id);
    const totalPurchases = supplier.purchases?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const totalPayments = supplier.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    return {
      balance: Number(supplier.balance),
      totalPurchases,
      totalPayments,
      difference: totalPurchases - totalPayments,
    };
  }
}

