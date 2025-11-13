"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const json2csv_1 = require("json2csv");
const router = (0, express_1.Router)();
/**
 * GET /api/export/invoices
 * Export invoices to CSV
 */
router.get('/invoices', async (req, res) => {
    try {
        const { format = 'csv', startDate, endDate, vendorId } = req.query;
        // Build where clause
        const where = {};
        if (startDate && endDate) {
            where.invoiceDate = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }
        if (vendorId) {
            where.vendorId = parseInt(vendorId);
        }
        // Fetch data
        const invoices = await prisma_1.prisma.invoice.findMany({
            where,
            include: {
                vendor: {
                    select: {
                        name: true,
                        taxId: true,
                    },
                },
                customer: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                invoiceDate: 'desc',
            },
        });
        // Transform data for export
        const exportData = invoices.map((inv) => {
            var _a, _b, _c;
            return ({
                'Invoice Ref': inv.invoiceRef || '',
                'Invoice Date': inv.invoiceDate ? inv.invoiceDate.toISOString().split('T')[0] : '',
                'Vendor': ((_a = inv.vendor) === null || _a === void 0 ? void 0 : _a.name) || '',
                'Vendor Tax ID': ((_b = inv.vendor) === null || _b === void 0 ? void 0 : _b.taxId) || '',
                'Customer': ((_c = inv.customer) === null || _c === void 0 ? void 0 : _c.name) || '',
                'Subtotal': inv.subTotal || 0,
                'Tax': inv.totalTax || 0,
                'Total Amount': inv.totalAmount || 0,
                'Currency': inv.currency || 'EUR',
                'Payment Status': inv.paymentStatus || '',
                'Payment Due Date': inv.paymentDueDate ? inv.paymentDueDate.toISOString().split('T')[0] : '',
                'Payment Terms': inv.paymentTerms || '',
            });
        });
        if (format === 'json') {
            return res.json({
                success: true,
                data: exportData,
                count: exportData.length,
            });
        }
        // Generate CSV
        const parser = new json2csv_1.Parser();
        const csv = parser.parse(exportData);
        // Set headers for download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=invoices-export-${Date.now()}.csv`);
        res.send(csv);
    }
    catch (error) {
        console.error('Export error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export data',
            message: error.message,
        });
    }
});
/**
 * GET /api/export/vendors
 * Export vendor spend analysis to CSV
 */
router.get('/vendors', async (req, res) => {
    try {
        const { format = 'csv' } = req.query;
        // Get vendor spend data
        const vendorSpend = await prisma_1.prisma.invoice.groupBy({
            by: ['vendorId'],
            _sum: {
                totalAmount: true,
            },
            _count: {
                id: true,
            },
            _avg: {
                totalAmount: true,
            },
            orderBy: {
                _sum: {
                    totalAmount: 'desc',
                },
            },
        });
        const vendorIds = vendorSpend
            .map((v) => v.vendorId)
            .filter((id) => id !== null);
        const vendors = await prisma_1.prisma.vendor.findMany({
            where: {
                id: { in: vendorIds },
            },
        });
        const vendorMap = new Map(vendors.map((v) => [v.id, v]));
        // Transform data
        const exportData = vendorSpend
            .filter((v) => v.vendorId !== null)
            .map((v) => {
            var _a, _b;
            const vendor = vendorMap.get(v.vendorId);
            return {
                'Vendor Name': (vendor === null || vendor === void 0 ? void 0 : vendor.name) || 'Unknown',
                'Vendor Tax ID': (vendor === null || vendor === void 0 ? void 0 : vendor.taxId) || '',
                'Total Invoices': v._count.id,
                'Total Spend': (_a = v._sum.totalAmount) !== null && _a !== void 0 ? _a : 0,
                'Average Invoice Value': (_b = v._avg.totalAmount) !== null && _b !== void 0 ? _b : 0,
            };
        });
        if (format === 'json') {
            return res.json({
                success: true,
                data: exportData,
                count: exportData.length,
            });
        }
        // Generate CSV
        const parser = new json2csv_1.Parser();
        const csv = parser.parse(exportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=vendors-export-${Date.now()}.csv`);
        res.send(csv);
    }
    catch (error) {
        console.error('Export error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export data',
            message: error.message,
        });
    }
});
/**
 * GET /api/export/dashboard-summary
 * Export complete dashboard summary
 */
router.get('/dashboard-summary', async (req, res) => {
    try {
        const { format = 'csv' } = req.query;
        // Get all summary data
        const [totalSpendResult, invoiceCount, vendorCount] = await Promise.all([
            prisma_1.prisma.invoice.aggregate({
                _sum: { totalAmount: true },
                _avg: { totalAmount: true },
            }),
            prisma_1.prisma.invoice.count(),
            prisma_1.prisma.vendor.count(),
        ]);
        const summaryData = [
            {
                'Metric': 'Total Spend',
                'Value': totalSpendResult._sum.totalAmount || 0,
                'Unit': 'EUR',
            },
            {
                'Metric': 'Total Invoices',
                'Value': invoiceCount,
                'Unit': 'count',
            },
            {
                'Metric': 'Average Invoice Value',
                'Value': totalSpendResult._avg.totalAmount || 0,
                'Unit': 'EUR',
            },
            {
                'Metric': 'Total Vendors',
                'Value': vendorCount,
                'Unit': 'count',
            },
        ];
        if (format === 'json') {
            return res.json({
                success: true,
                data: summaryData,
            });
        }
        const parser = new json2csv_1.Parser();
        const csv = parser.parse(summaryData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=dashboard-summary-${Date.now()}.csv`);
        res.send(csv);
    }
    catch (error) {
        console.error('Export error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export data',
            message: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=export.js.map