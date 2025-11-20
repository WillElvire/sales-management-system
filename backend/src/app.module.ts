import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { ECardsModule } from './modules/e-cards/e-cards.module';
import { UsdtModule } from './modules/usdt/usdt.module';
import { CashCollectModule } from './modules/cash-collect/cash-collect.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { ReportsModule } from './modules/reports/reports.module';
import { UploadModule } from './modules/upload/upload.module';
import { CountriesModule } from './modules/countries/countries.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ExportModule } from './modules/export/export.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    RolesModule,
    ECardsModule,
    UsdtModule,
    CashCollectModule,
    MonitoringModule,
    ReportsModule,
    UploadModule,
    CountriesModule,
    ClientsModule,
    ExportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

