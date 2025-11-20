import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { ECardsModule } from '../e-cards/e-cards.module';
import { UsdtModule } from '../usdt/usdt.module';
import { CashCollectModule } from '../cash-collect/cash-collect.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [ECardsModule, UsdtModule, CashCollectModule, ClientsModule],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}

