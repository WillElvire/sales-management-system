import { Injectable } from '@nestjs/common';
import { ECardsService } from '../e-cards/e-cards.service';
import { UsdtService } from '../usdt/usdt.service';
import { CashCollectService } from '../cash-collect/cash-collect.service';

@Injectable()
export class ReportsService {
  constructor(
    private eCardsService: ECardsService,
    private usdtService: UsdtService,
    private cashCollectService: CashCollectService,
  ) {}

  async getECardsReport(startDate: Date, endDate: Date) {
    const suppliers = await this.eCardsService.findAllSuppliers();
    const purchases = await this.eCardsService.findAllPurchases(startDate, endDate);
    const sales = await this.eCardsService.findAllSales(startDate, endDate);
    const payments = await this.eCardsService.findAllPayments();
    
    return {
      suppliers: suppliers.map(s => ({
        id: s.id,
        name: s.name,
        balance: Number(s.balance),
        totalPurchases: s.purchases?.reduce((sum, p) => sum + Number(p.amount), 0) || 0,
        totalPayments: s.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0,
      })),
      purchases,
      sales,
      payments,
    };
  }

  async getUsdtReport(startDate: Date, endDate: Date) {
    const suppliers = await this.usdtService.findAllSuppliers();
    const purchases = await this.usdtService.findAllPurchases(startDate, endDate);
    
    return {
      suppliers: suppliers.map(s => ({
        id: s.id,
        name: s.name,
        country: s.country,
        balance: Number(s.balance),
        totalPurchases: s.purchases?.reduce((sum, p) => sum + Number(p.amount), 0) || 0,
      })),
      purchases,
    };
  }

  async getCashCollectReport(startDate: Date, endDate: Date) {
    const agents = await this.cashCollectService.findAllAgents();
    const transactions = await this.cashCollectService.findAllTransactions(startDate, endDate);
    
    return {
      agents: agents.map(a => ({
        id: a.id,
        name: a.name,
        country: a.country,
        balance: Number(a.balance),
        currency: a.currency,
      })),
      transactions,
    };
  }

  async getFinanceReport(startDate: Date, endDate: Date) {
    const eCardsData = await this.getECardsReport(startDate, endDate);
    const usdtData = await this.getUsdtReport(startDate, endDate);
    const cashCollectData = await this.getCashCollectReport(startDate, endDate);
    
    return {
      eCards: eCardsData,
      usdt: usdtData,
      cashCollect: cashCollectData,
      summary: {
        totalECardsPurchases: eCardsData.purchases.reduce((sum, p) => sum + Number(p.amount), 0),
        totalECardsSales: eCardsData.sales.reduce((sum, s) => sum + Number(s.amount), 0),
        totalUsdtPurchases: usdtData.purchases.reduce((sum, p) => sum + Number(p.amount), 0),
        totalCashCollectEncaissements: cashCollectData.transactions
          .filter(t => t.type === 'encaissement')
          .reduce((sum, t) => sum + Number(t.amount), 0),
        totalCashCollectVersements: cashCollectData.transactions
          .filter(t => t.type === 'versement')
          .reduce((sum, t) => sum + Number(t.amount), 0),
      },
    };
  }
}

