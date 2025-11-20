import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ECardsModule } from '../e-cards/e-cards.module';
import { UsdtModule } from '../usdt/usdt.module';
import { CashCollectModule } from '../cash-collect/cash-collect.module';

@Module({
  imports: [ECardsModule, UsdtModule, CashCollectModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}

