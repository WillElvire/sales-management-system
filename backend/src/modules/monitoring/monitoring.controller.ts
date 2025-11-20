import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../roles/entities/role.entity';

@Controller('monitoring')
@UseGuards(JwtAuthGuard)
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('e-cards')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.COMPTABLE)
  getECardsVolume(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.monitoringService.getECardsVolume(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('usdt')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.COMPTABLE)
  getUsdtVolume(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('country') country?: string,
  ) {
    return this.monitoringService.getUsdtVolume(
      new Date(startDate),
      new Date(endDate),
      country,
    );
  }

  @Get('cash-collect')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.COMPTABLE, RoleName.AGENT_COLLECT)
  getCashCollectData(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('country') country?: string,
  ) {
    return this.monitoringService.getCashCollectData(
      new Date(startDate),
      new Date(endDate),
      country,
    );
  }
}

