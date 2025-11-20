import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class ExportService {
  async exportToPDF(
    data: any[],
    columns: { title: string; key: string; width?: number }[],
    title: string,
    res: Response,
  ): Promise<void> {
    const PDFDoc = PDFDocument as any;
    const doc = new PDFDoc({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${title}-${Date.now()}.pdf"`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text(title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
    doc.moveDown(2);

    // Table
    const tableTop = doc.y;
    const cellHeight = 20;
    const cellPadding = 5;
    const columnWidths = columns.map((col) => col.width || 100);

    // Header row
    doc.fontSize(10).font('Helvetica-Bold');
    let x = 50;
    columns.forEach((col, i) => {
      doc.rect(x, tableTop, columnWidths[i], cellHeight).stroke();
      doc.text(col.title, x + cellPadding, tableTop + cellPadding / 2, {
        width: columnWidths[i] - cellPadding * 2,
        align: 'left',
      });
      x += columnWidths[i];
    });

    // Data rows
    doc.font('Helvetica');
    let y = tableTop + cellHeight;
    data.forEach((row) => {
      x = 50;
      columns.forEach((col, i) => {
        const value = this.formatValue(row[col.key]);
        doc.rect(x, y, columnWidths[i], cellHeight).stroke();
        doc.text(value, x + cellPadding, y + cellPadding / 2, {
          width: columnWidths[i] - cellPadding * 2,
          align: 'left',
        });
        x += columnWidths[i];
      });
      y += cellHeight;

      // New page if needed
      if (y > doc.page.height - 50) {
        doc.addPage();
        y = 50;
      }
    });

    doc.end();
  }

  async exportToExcel(
    data: any[],
    columns: { title: string; key: string }[],
    title: string,
    res: Response,
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(title);

    // Header row
    worksheet.addRow(columns.map((col) => col.title));
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10B981' },
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Data rows
    data.forEach((row) => {
      const rowData = columns.map((col) => this.formatValue(row[col.key]));
      worksheet.addRow(rowData);
    });

    // Auto-fit columns
    columns.forEach((col, index) => {
      const column = worksheet.getColumn(index + 1);
      column.width = Math.max(col.title.length, 15);
    });

    // Style data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: 'middle', horizontal: 'left' };
        if (rowNumber % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF0FDF4' },
          };
        }
      }
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${title}-${Date.now()}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '—';
    }
    if (value instanceof Date) {
      return value.toLocaleDateString('fr-FR');
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }
}

