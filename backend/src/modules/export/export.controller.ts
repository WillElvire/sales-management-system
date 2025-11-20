import { Controller, Get, Query, Res, UseGuards, Param } from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ECardsService } from '../e-cards/e-cards.service';
import { UsdtService } from '../usdt/usdt.service';
import { CashCollectService } from '../cash-collect/cash-collect.service';
import { ClientsService } from '../clients/clients.service';

@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(
    private readonly exportService: ExportService,
    private readonly eCardsService: ECardsService,
    private readonly usdtService: UsdtService,
    private readonly cashCollectService: CashCollectService,
    private readonly clientsService: ClientsService,
  ) {}

  @Get('e-cards/sales/:format')
  async exportECardSales(
    @Param('format') format: 'pdf' | 'xlsx',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res: any = null,
  ) {
    const sales = await this.eCardsService.findAllSales(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    const columns = [
      { title: 'Client', key: 'client', width: 120 },
      { title: 'Contact', key: 'clientContact', width: 100 },
      { title: 'Pays', key: 'country', width: 80 },
      { title: 'Montant', key: 'amount', width: 80 },
      { title: 'Devise', key: 'currency', width: 60 },
      { title: 'Date', key: 'saleDate', width: 80 },
    ];

    const data = sales.map((sale) => {
      let clientName = '—';
      let clientContact = '—';
      
      if (sale.clientFirstName && sale.clientLastName) {
        clientName = `${sale.clientFirstName} ${sale.clientLastName}`.trim();
        clientContact = sale.clientContact || '—';
      } else if (sale.client) {
        clientName = `${sale.client.firstName || ''} ${sale.client.lastName || ''}`.trim() || '—';
        clientContact = sale.client.contact || '—';
      }
      
      return {
        client: clientName,
        clientContact,
        country: sale.country,
        amount: Number(sale.amount).toFixed(2),
        currency: sale.currency,
        saleDate: new Date(sale.saleDate).toLocaleDateString('fr-FR'),
      };
    });

    if (format === 'pdf') {
      await this.exportService.exportToPDF(data, columns, 'Ventes E-Cards', res);
    } else {
      await this.exportService.exportToExcel(data, columns, 'Ventes E-Cards', res);
    }
  }

  @Get('usdt/purchases/:format')
  async exportUsdtPurchases(
    @Param('format') format: 'pdf' | 'xlsx',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res: any = null,
  ) {
    const purchases = await this.usdtService.findAllPurchases(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    const columns = [
      { title: 'Fournisseur', key: 'supplier', width: 120 },
      { title: 'Montant', key: 'amount', width: 80 },
      { title: 'Taux', key: 'rate', width: 80 },
      { title: 'Devise', key: 'currency', width: 60 },
      { title: 'Pays', key: 'country', width: 80 },
      { title: 'Date', key: 'createdAt', width: 80 },
    ];

    const data = purchases.map((purchase) => ({
      supplier: purchase.supplier?.name || '—',
      amount: Number(purchase.amount).toFixed(2),
      rate: Number(purchase.rate).toFixed(4),
      currency: purchase.currency,
      country: purchase.country,
      createdAt: new Date(purchase.createdAt).toLocaleDateString('fr-FR'),
    }));

    if (format === 'pdf') {
      await this.exportService.exportToPDF(data, columns, 'Achats USDT', res);
    } else {
      await this.exportService.exportToExcel(data, columns, 'Achats USDT', res);
    }
  }

  @Get('cash-collect/transactions/:format')
  async exportCashCollectTransactions(
    @Param('format') format: 'pdf' | 'xlsx',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res: any = null,
  ) {
    const transactions = await this.cashCollectService.findAllTransactions(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    const columns = [
      { title: 'Agent', key: 'agent', width: 120 },
      { title: 'Type', key: 'type', width: 80 },
      { title: 'Montant', key: 'amount', width: 80 },
      { title: 'Devise', key: 'currency', width: 60 },
      { title: 'Pays', key: 'country', width: 80 },
      { title: 'Destination', key: 'destination', width: 100 },
      { title: 'Date', key: 'transactionDate', width: 80 },
    ];

    const data = transactions.map((tx) => ({
      agent: tx.agent?.name || '—',
      type: tx.type === 'encaissement' ? 'Encaissement' : 'Versement',
      amount: Number(tx.amount).toFixed(2),
      currency: tx.currency,
      country: tx.country,
      destination: tx.destination || '—',
      transactionDate: new Date(tx.transactionDate).toLocaleDateString('fr-FR'),
    }));

    if (format === 'pdf') {
      await this.exportService.exportToPDF(data, columns, 'Transactions Cash Collect', res);
    } else {
      await this.exportService.exportToExcel(data, columns, 'Transactions Cash Collect', res);
    }
  }

  @Get('clients/:format')
  async exportClients(@Param('format') format: 'pdf' | 'xlsx', @Res() res: Response) {
    const clients = await this.clientsService.findAll();

    const columns = [
      { title: 'Prénom', key: 'firstName', width: 100 },
      { title: 'Nom', key: 'lastName', width: 100 },
      { title: 'Contact', key: 'contact', width: 100 },
      { title: 'Email', key: 'email', width: 120 },
      { title: 'Date création', key: 'createdAt', width: 100 },
    ];

    const data = clients.map((client) => ({
      firstName: client.firstName,
      lastName: client.lastName,
      contact: client.contact,
      email: client.email || '—',
      createdAt: new Date(client.createdAt).toLocaleDateString('fr-FR'),
    }));

    if (format === 'pdf') {
      await this.exportService.exportToPDF(data, columns, 'Clients', res);
    } else {
      await this.exportService.exportToExcel(data, columns, 'Clients', res);
    }
  }
}

