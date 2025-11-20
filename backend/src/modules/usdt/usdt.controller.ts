import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsdtService } from './usdt.service';
import { CreateUsdtSupplierDto } from './dto/create-usdt-supplier.dto';
import { CreateUsdtPurchaseDto } from './dto/create-usdt-purchase.dto';
import { CreateUsdtAccountDto } from './dto/create-usdt-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../roles/entities/role.entity';

@Controller('usdt')
@UseGuards(JwtAuthGuard)
export class UsdtController {
  constructor(private readonly usdtService: UsdtService) {}

  @Post('suppliers')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.COMPTABLE)
  createSupplier(@Body() createDto: CreateUsdtSupplierDto) {
    return this.usdtService.createSupplier(createDto);
  }

  @Get('suppliers')
  findAllSuppliers() {
    return this.usdtService.findAllSuppliers();
  }

  @Get('suppliers/:id')
  findOneSupplier(@Param('id') id: string) {
    return this.usdtService.findOneSupplier(id);
  }

  @Get('suppliers/:id/balance')
  getSupplierBalance(@Param('id') id: string) {
    return this.usdtService.getSupplierBalance(id);
  }

  @Post('purchases')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.COMPTABLE)
  createPurchase(@Body() createDto: CreateUsdtPurchaseDto) {
    return this.usdtService.createPurchase(createDto);
  }

  @Get('purchases')
  findAllPurchases(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('country') country?: string,
  ) {
    return this.usdtService.findAllPurchases(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      country,
    );
  }

  @Post('accounts')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  createAccount(@Body() createDto: CreateUsdtAccountDto) {
    return this.usdtService.createAccount(createDto);
  }

  @Get('accounts')
  findAllAccounts() {
    return this.usdtService.findAllAccounts();
  }

  @Post('accounts/:id/activate')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  activateAccount(@Param('id') id: string) {
    return this.usdtService.activateAccount(id);
  }

  @Post('accounts/:id/deactivate')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  deactivateAccount(@Param('id') id: string) {
    return this.usdtService.deactivateAccount(id);
  }
}

