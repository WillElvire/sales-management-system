import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ECardsService } from './e-cards.service';
import { CreateECardSupplierDto } from './dto/create-e-card-supplier.dto';
import { CreateECardPurchaseDto } from './dto/create-e-card-purchase.dto';
import { CreateECardSaleDto } from './dto/create-e-card-sale.dto';
import { CreateECardPaymentDto } from './dto/create-e-card-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../roles/entities/role.entity';

@Controller('e-cards')
@UseGuards(JwtAuthGuard)
export class ECardsController {
  constructor(private readonly eCardsService: ECardsService) {}

  @Post('suppliers')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.COMPTABLE)
  createSupplier(@Body() createDto: CreateECardSupplierDto) {
    return this.eCardsService.createSupplier(createDto);
  }

  @Get('suppliers')
  findAllSuppliers() {
    return this.eCardsService.findAllSuppliers();
  }

  @Get('suppliers/:id')
  findOneSupplier(@Param('id') id: string) {
    return this.eCardsService.findOneSupplier(id);
  }

  @Get('suppliers/:id/balance')
  getSupplierBalance(@Param('id') id: string) {
    return this.eCardsService.getSupplierBalance(id);
  }

  @Post('purchases')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.COMPTABLE)
  createPurchase(@Body() createDto: CreateECardPurchaseDto) {
    return this.eCardsService.createPurchase(createDto);
  }

  @Get('purchases')
  findAllPurchases(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.eCardsService.findAllPurchases(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Post('sales')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.COMPTABLE)
  createSale(@Body() createDto: CreateECardSaleDto) {
    return this.eCardsService.createSale(createDto);
  }

  @Get('sales')
  findAllSales(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.eCardsService.findAllSales(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Post('payments')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.COMPTABLE)
  createPayment(@Body() createDto: CreateECardPaymentDto) {
    return this.eCardsService.createPayment(createDto);
  }

  @Get('payments')
  findAllPayments() {
    return this.eCardsService.findAllPayments();
  }
}

