const ExcelJS = require('exceljs');
const fastCsv = require('fast-csv');
const { Readable } = require('stream');
const exportService = {
  async exportToExcel(data, sheetName = 'Sheet1') {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      data.forEach(item => {
        worksheet.addRow(Object.values(item));
      });
      worksheet.columns.forEach(column => {
        column.width = 15;
      });
    }
    return workbook;
  },
  async exportToCSV(data) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      const csvStream = fastCsv.format({ headers: true });
      csvStream.on('data', chunk => chunks.push(chunk));
      csvStream.on('end', () => resolve(Buffer.concat(chunks)));
      csvStream.on('error', reject);
      data.forEach(row => csvStream.write(row));
      csvStream.end();
    });
  },
  formatOrdersForExport(orders) {
    return orders.map(order => ({
      'Order Number': order.orderNumber,
      'Customer Name': order.Customer?.name || 'N/A',
      'Customer Email': order.Customer?.email || 'N/A',
      'Status': order.status,
      'Total Amount': order.totalAmount,
      'Order Date': order.createdAt.toISOString().split('T')[0],
      'Expected Delivery': order.expectedDeliveryDate?.toISOString().split('T')[0] || 'N/A',
      'Actual Delivery': order.actualDeliveryDate?.toISOString().split('T')[0] || 'N/A',
      'Items Count': order.OrderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0
    }));
  }
};
module.exports = exportService;