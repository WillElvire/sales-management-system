import { Injectable } from '@nestjs/common';
import { ECardsService } from '../e-cards/e-cards.service';
import { UsdtService } from '../usdt/usdt.service';
import { CashCollectService } from '../cash-collect/cash-collect.service';

@Injectable()
export class MonitoringService {
  constructor(
    private eCardsService: ECardsService,
    private usdtService: UsdtService,
    private cashCollectService: CashCollectService,
  ) {}

  async getECardsVolume(startDate: Date, endDate: Date) {
    const purchases = await this.eCardsService.findAllPurchases(startDate, endDate);
    const sales = await this.eCardsService.findAllSales(startDate, endDate);
    
    const directPurchases = purchases.filter(p => p.type === 'direct');
    const creditPurchases = purchases.filter(p => p.type === 'credit');
    
    return {
      totalPurchaseVolume: purchases.reduce((sum, p) => sum + Number(p.amount), 0),
      directPurchaseVolume: directPurchases.reduce((sum, p) => sum + Number(p.amount), 0),
      creditPurchaseVolume: creditPurchases.reduce((sum, p) => sum + Number(p.amount), 0),
      totalSaleVolume: sales.reduce((sum, s) => sum + Number(s.amount), 0),
      salesByCountry: this.groupByCountry(sales),
    };
  }

  async getUsdtVolume(startDate: Date, endDate: Date, country?: string) {
    const purchases = await this.usdtService.findAllPurchases(startDate, endDate, country);
    
    return {
      totalVolume: purchases.reduce((sum, p) => sum + Number(p.amount), 0),
      purchasesByCountry: this.groupByCountry(purchases),
      purchasesBySupplier: this.groupBySupplier(purchases),
    };
  }

  async getCashCollectData(startDate: Date, endDate: Date, country?: string) {
    const transactions = await this.cashCollectService.findAllTransactions(
      startDate,
      endDate,
      country,
    );
    
    const encaissements = transactions.filter(t => t.type === 'encaissement');
    const versements = transactions.filter(t => t.type === 'versement');
    
    return {
      totalEncaissements: encaissements.reduce((sum, t) => sum + Number(t.amount), 0),
      totalVersements: versements.reduce((sum, t) => sum + Number(t.amount), 0),
      encaissementsByCountry: this.groupByCountry(encaissements),
      versementsByDestination: this.groupByDestination(versements),
    };
  }

  private groupByCountry(items: any[]) {
    return items.reduce((acc, item) => {
      const country = item.country || 'Unknown';
      acc[country] = (acc[country] || 0) + Number(item.amount);
      return acc;
    }, {});
  }

  private groupBySupplier(items: any[]) {
    return items.reduce((acc, item) => {
      const supplier = item.supplier?.name || 'Unknown';
      acc[supplier] = (acc[supplier] || 0) + Number(item.amount);
      return acc;
    }, {});
  }

  private groupByDestination(items: any[]) {
    return items.reduce((acc, item) => {
      const dest = item.destination || 'Unknown';
      acc[dest] = (acc[dest] || 0) + Number(item.amount);
      return acc;
    }, {});
  }
}

