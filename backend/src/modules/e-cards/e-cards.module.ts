import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ECardsService } from './e-cards.service';
import { ECardsController } from './e-cards.controller';
import { ECardSupplier } from './entities/e-card-supplier.entity';
import { ECardPurchase } from './entities/e-card-purchase.entity';
import { ECardSale } from './entities/e-card-sale.entity';
import { ECardPayment } from './entities/e-card-payment.entity';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ECardSupplier,
      ECardPurchase,
      ECardSale,
      ECardPayment,
    ]),
    ClientsModule,
  ],
  controllers: [ECardsController],
  providers: [ECardsService],
  exports: [ECardsService],
})
export class ECardsModule {}

