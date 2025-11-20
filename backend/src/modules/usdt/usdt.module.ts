import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsdtService } from './usdt.service';
import { UsdtController } from './usdt.controller';
import { UsdtSupplier } from './entities/usdt-supplier.entity';
import { UsdtPurchase } from './entities/usdt-purchase.entity';
import { UsdtAccount } from './entities/usdt-account.entity';
import { UsdtPaymentProof } from './entities/usdt-payment-proof.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsdtSupplier,
      UsdtPurchase,
      UsdtAccount,
      UsdtPaymentProof,
    ]),
  ],
  controllers: [UsdtController],
  providers: [UsdtService],
  exports: [UsdtService],
})
export class UsdtModule {}

