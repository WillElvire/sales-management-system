import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../roles/entities/role.entity';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('e-cards')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.COMPTABLE)
  getECardsReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getECardsReport(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('usdt')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.COMPTABLE)
  getUsdtReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getUsdtReport(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('cash-collect')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.COMPTABLE, RoleName.AGENT_COLLECT)
  getCashCollectReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getCashCollectReport(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('finance')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.COMPTABLE)
  getFinanceReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getFinanceReport(
      new Date(startDate),
      new Date(endDate),
    );
  }
}

