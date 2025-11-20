import api from './axios';

const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await api.get(url, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

export const exportApi = {
  eCardSales: {
    pdf: async (params?: { startDate?: string; endDate?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      const url = `/export/e-cards/sales/pdf${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      await downloadFile(url, `ventes-e-cards-${Date.now()}.pdf`);
    },
    xlsx: async (params?: { startDate?: string; endDate?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      const url = `/export/e-cards/sales/xlsx${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      await downloadFile(url, `ventes-e-cards-${Date.now()}.xlsx`);
    },
  },
  usdtPurchases: {
    pdf: async (params?: { startDate?: string; endDate?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      const url = `/export/usdt/purchases/pdf${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      await downloadFile(url, `achats-usdt-${Date.now()}.pdf`);
    },
    xlsx: async (params?: { startDate?: string; endDate?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      const url = `/export/usdt/purchases/xlsx${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      await downloadFile(url, `achats-usdt-${Date.now()}.xlsx`);
    },
  },
  cashCollectTransactions: {
    pdf: async (params?: { startDate?: string; endDate?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      const url = `/export/cash-collect/transactions/pdf${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      await downloadFile(url, `transactions-cash-collect-${Date.now()}.pdf`);
    },
    xlsx: async (params?: { startDate?: string; endDate?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      const url = `/export/cash-collect/transactions/xlsx${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      await downloadFile(url, `transactions-cash-collect-${Date.now()}.xlsx`);
    },
  },
  clients: {
    pdf: async () => {
      await downloadFile('/export/clients/pdf', `clients-${Date.now()}.pdf`);
    },
    xlsx: async () => {
      await downloadFile('/export/clients/xlsx', `clients-${Date.now()}.xlsx`);
    },
  },
};

