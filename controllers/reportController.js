const reportService = require('../services/reportService');
const exportService = require('../services/exportService');

const reportController = {
    async getSalesReport(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            const report = await reportService.getSalesReport(startDate, endDate);
            res.json(report);
        } catch (error) {
            next(error);
        }
    },

    async exportOverdueLastMonth(req, res, next) {
        try {
            const overdueOrders = await reportService.getLastMonthOverdueOrders();
            const formattedData = exportService.formatOrdersForExport(overdueOrders);
            const { format = 'json' } = req.query;

            if (format === 'excel') {
                const workbook = await exportService.exportToExcel(formattedData, 'Overdue Orders');
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename=overdue-orders.xlsx');
                await workbook.xlsx.write(res);
            } else if (format === 'csv') {
                const csvBuffer = await exportService.exportToCSV(formattedData);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=overdue-orders.csv');
                res.send(csvBuffer);
            } else {
                res.json(overdueOrders);
            }
        } catch (error) {
            next(error);
        }
    },

    async exportLastMonth(req, res, next) {
        try {
            const lastMonthOrders = await reportService.getLastMonthOrders();
            const formattedData = exportService.formatOrdersForExport(lastMonthOrders);
            const { format = 'json' } = req.query;

            if (format === 'excel') {
                const workbook = await exportService.exportToExcel(formattedData, 'Last Month Orders');
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename=last-month-orders.xlsx');
                await workbook.xlsx.write(res);
            } else if (format === 'csv') {
                const csvBuffer = await exportService.exportToCSV(formattedData);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=last-month-orders.csv');
                res.send(csvBuffer);
            } else {
                res.json(lastMonthOrders);
            }
        } catch (error) {
            next(error);
        }
    }
};

module.exports = reportController;
