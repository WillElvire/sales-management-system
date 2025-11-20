import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CashCollectService } from './cash-collect.service';
import { CreateCashCollectAgentDto } from './dto/create-cash-collect-agent.dto';
import { CreateCashCollectTransactionDto } from './dto/create-cash-collect-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../roles/entities/role.entity';

@Controller('cash-collect')
@UseGuards(JwtAuthGuard)
export class CashCollectController {
  constructor(private readonly cashCollectService: CashCollectService) {}

  @Post('agents')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.COMPTABLE)
  createAgent(@Body() createDto: CreateCashCollectAgentDto) {
    return this.cashCollectService.createAgent(createDto);
  }

  @Get('agents')
  findAllAgents() {
    return this.cashCollectService.findAllAgents();
  }

  @Get('agents/:id')
  findOneAgent(@Param('id') id: string) {
    return this.cashCollectService.findOneAgent(id);
  }

  @Get('agents/:id/balance')
  getAgentBalance(@Param('id') id: string) {
    return this.cashCollectService.getAgentBalance(id);
  }

  @Post('transactions')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.COMPTABLE, RoleName.AGENT_COLLECT)
  createTransaction(@Body() createDto: CreateCashCollectTransactionDto) {
    return this.cashCollectService.createTransaction(createDto);
  }

  @Get('transactions')
  findAllTransactions(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('country') country?: string,
    @Query('currency') currency?: string,
  ) {
    return this.cashCollectService.findAllTransactions(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      country,
      currency,
    );
  }

  @Get('balance/currency/:currency')
  getBalanceByCurrency(@Param('currency') currency: string) {
    return this.cashCollectService.getBalanceByCurrency(currency);
  }

  @Get('balance/corridor/:id')
  getBalanceByCorridor(@Param('id') id: string) {
    return this.cashCollectService.getBalanceByCorridor(id);
  }
}

