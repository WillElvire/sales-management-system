import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashCollectService } from './cash-collect.service';
import { CashCollectController } from './cash-collect.controller';
import { CashCollectAgent } from './entities/cash-collect-agent.entity';
import { CashCollectTransaction } from './entities/cash-collect-transaction.entity';
import { CashCollectCorridor } from './entities/cash-collect-corridor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CashCollectAgent,
      CashCollectTransaction,
      CashCollectCorridor,
    ]),
  ],
  controllers: [CashCollectController],
  providers: [CashCollectService],
  exports: [CashCollectService],
})
export class CashCollectModule {}

