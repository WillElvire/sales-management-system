import { Module } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { MonitoringController } from './monitoring.controller';
import { ECardsModule } from '../e-cards/e-cards.module';
import { UsdtModule } from '../usdt/usdt.module';
import { CashCollectModule } from '../cash-collect/cash-collect.module';

@Module({
  imports: [ECardsModule, UsdtModule, CashCollectModule],
  controllers: [MonitoringController],
  providers: [MonitoringService],
})
export class MonitoringModule {}

