"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const date_fns_1 = require("date-fns");
const router = (0, express_1.Router)();
/**
 * GET /api/dashboard/invoice-trends
 * Returns monthly invoice count and spend for the last 12 months
 */
router.get('/invoice-trends', async (req, res) => {
    try {
        const months = [];
        const now = new Date();
        // Generate last 12 months
        for (let i = 11; i >= 0; i--) {
            const date = (0, date_fns_1.subMonths)(now, i);
            const start = (0, date_fns_1.startOfMonth)(date);
            const end = (0, date_fns_1.endOfMonth)(date);
            const [invoiceCount, spendResult] = await Promise.all([
                prisma_1.prisma.invoice.count({
                    where: {
                        invoiceDate: {
                            gte: start,
                            lte: end,
                        },
                    },
                }),
                prisma_1.prisma.invoice.aggregate({
                    where: {
                        invoiceDate: {
                            gte: start,
                            lte: end,
                        },
                    },
                    _sum: {
                        totalAmount: true,
                    },
                }),
            ]);
            months.push({
                month: (0, date_fns_1.format)(date, 'MMM'),
                monthFull: (0, date_fns_1.format)(date, 'yyyy-MM'),
                invoiceCount,
                totalSpend: spendResult._sum.totalAmount || 0,
            });
        }
        res.json({
            success: true,
            data: months,
            period: '12 months',
        });
    }
    catch (error) {
        console.error('Error fetching invoice trends:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch invoice trends',
            message: error.message,
        });
    }
});
/**
 * GET /api/dashboard/vendors/top10
 * Returns top 10 vendors by total spend
 */
router.get('/vendors/top10', async (req, res) => {
    try {
        const vendorSpend = await prisma_1.prisma.invoice.groupBy({
            by: ['vendorId'],
            _sum: {
                totalAmount: true,
            },
            _count: {
                id: true,
            },
            orderBy: {
                _sum: {
                    totalAmount: 'desc',
                },
            },
            take: 10,
        });
        // Get vendor details
        const vendorIds = vendorSpend
            .map((v) => v.vendorId)
            .filter((id) => id !== null);
        const vendors = await prisma_1.prisma.vendor.findMany({
            where: {
                id: { in: vendorIds },
            },
            select: {
                id: true,
                name: true,
                taxId: true,
            },
        });
        const vendorMap = new Map(vendors.map((v) => [v.id, v]));
        const result = vendorSpend
            .map((v) => {
            const vendor = vendorMap.get(v.vendorId);
            return {
                vendorId: v.vendorId,
                vendorName: (vendor === null || vendor === void 0 ? void 0 : vendor.name) || 'Unknown Vendor',
                totalSpend: v._sum.totalAmount || 0,
                invoiceCount: v._count.id,
            };
        })
            .filter((v) => v.vendorName !== 'Unknown Vendor');
        res.json({
            success: true,
            data: result,
            count: result.length,
        });
    }
    catch (error) {
        console.error('Error fetching top vendors:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch top vendors',
            message: error.message,
        });
    }
});
/**
 * GET /api/dashboard/category-spend
 * Returns spend grouped by category
 */
router.get('/category-spend', async (req, res) => {
    try {
        // For now, create mock categories based on vendor names or line items
        // In production, you'd have a category field in your schema
        const allInvoices = await prisma_1.prisma.invoice.findMany({
            include: {
                vendor: true,
            },
        });
        // Simple categorization logic (can be enhanced)
        const categories = {
            Operations: 0,
            Marketing: 0,
            Facilities: 0,
            IT: 0,
            Other: 0,
        };
        allInvoices.forEach((invoice) => {
            var _a, _b;
            const amount = invoice.totalAmount || 0;
            const vendorName = ((_b = (_a = invoice.vendor) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || '';
            // Simple keyword matching for demo
            if (vendorName.includes('tech') || vendorName.includes('software') || vendorName.includes('it')) {
                categories.IT += amount;
            }
            else if (vendorName.includes('market') || vendorName.includes('advert')) {
                categories.Marketing += amount;
            }
            else if (vendorName.includes('facility') || vendorName.includes('maintenance')) {
                categories.Facilities += amount;
            }
            else if (vendorName.includes('operation') || vendorName.includes('service')) {
                categories.Operations += amount;
            }
            else {
                categories.Other += amount;
            }
        });
        // Convert to array and filter out zero values
        const result = Object.entries(categories)
            .map(([name, value]) => ({
            category: name,
            amount: value,
            color: getCategoryColor(name),
        }))
            .filter((c) => c.amount > 0)
            .sort((a, b) => b.amount - a.amount);
        res.json({
            success: true,
            data: result,
            total: result.reduce((sum, c) => sum + c.amount, 0),
        });
    }
    catch (error) {
        console.error('Error fetching category spend:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch category spend',
            message: error.message,
        });
    }
});
/**
 * GET /api/dashboard/cash-outflow
 * Returns expected cash outflow by date ranges
 */
router.get('/cash-outflow', async (req, res) => {
    try {
        const now = new Date();
        const ranges = [
            { label: '0-7 days', start: now, end: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
            { label: '8-30 days', start: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000), end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
            { label: '31-60 days', start: new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000), end: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000) },
            { label: '60+ days', start: new Date(now.getTime() + 61 * 24 * 60 * 60 * 1000), end: new Date(2100, 0, 1) },
        ];
        const result = await Promise.all(ranges.map(async (range) => {
            const invoices = await prisma_1.prisma.invoice.aggregate({
                where: {
                    paymentDueDate: {
                        gte: range.start,
                        lte: range.end,
                    },
                    paymentStatus: {
                        not: 'paid',
                    },
                },
                _sum: {
                    totalAmount: true,
                },
            });
            return {
                period: range.label,
                amount: invoices._sum.totalAmount || 0,
            };
        }));
        res.json({
            success: true,
            data: result,
            asOfDate: now.toISOString(),
        });
    }
    catch (error) {
        console.error('Error fetching cash outflow:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch cash outflow forecast',
            message: error.message,
        });
    }
});
/**
 * GET /api/dashboard/invoices
 * Returns list of invoices with filters, search, and pagination
 */
router.get('/invoices', async (req, res) => {
    try {
        const { page = '1', limit = '20', search = '', status = '', sortBy = 'invoiceDate', sortOrder = 'desc', } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        // Build where clause
        const where = {};
        if (search) {
            where.OR = [
                { invoiceRef: { contains: search, mode: 'insensitive' } },
                { vendor: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }
        if (status && status !== 'all') {
            where.paymentStatus = status;
        }
        // Get total count
        const total = await prisma_1.prisma.invoice.count({ where });
        // Get invoices
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
                [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc',
            },
            skip,
            take: limitNum,
        });
        res.json({
            success: true,
            data: invoices,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch invoices',
            message: error.message,
        });
    }
});
/**
 * GET /api/dashboard/stats
 * Returns overview statistics for dashboard cards
 */
router.get('/stats', async (req, res) => {
    try {
        const [totalSpendResult, invoiceCount, documentCount, avgConfidence] = await Promise.all([
            prisma_1.prisma.invoice.aggregate({
                _sum: { totalAmount: true },
            }),
            prisma_1.prisma.invoice.count(),
            prisma_1.prisma.document.count({ where: { isValidatedByHuman: true } }),
            prisma_1.prisma.document.aggregate({
                _avg: { confidenceScore: true },
            }),
        ]);
        const totalSpend = totalSpendResult._sum.totalAmount || 0;
        const avgInvoiceValue = invoiceCount > 0 ? totalSpend / invoiceCount : 0;
        // Get previous month data for comparison
        const lastMonth = (0, date_fns_1.subMonths)(new Date(), 1);
        const lastMonthStart = (0, date_fns_1.startOfMonth)(lastMonth);
        const lastMonthEnd = (0, date_fns_1.endOfMonth)(lastMonth);
        const [lastMonthSpend, lastMonthInvoices] = await Promise.all([
            prisma_1.prisma.invoice.aggregate({
                where: {
                    invoiceDate: {
                        gte: lastMonthStart,
                        lte: lastMonthEnd,
                    },
                },
                _sum: { totalAmount: true },
            }),
            prisma_1.prisma.invoice.count({
                where: {
                    invoiceDate: {
                        gte: lastMonthStart,
                        lte: lastMonthEnd,
                    },
                },
            }),
        ]);
        const lastMonthTotal = lastMonthSpend._sum.totalAmount || 0;
        const spendChange = lastMonthTotal > 0 ? ((totalSpend - lastMonthTotal) / lastMonthTotal) * 100 : 0;
        res.json({
            success: true,
            data: {
                totalSpend,
                totalInvoices: invoiceCount,
                documentsUploaded: documentCount,
                avgInvoiceValue,
                avgConfidence: avgConfidence._avg.confidenceScore || 0,
                changes: {
                    spend: spendChange,
                    invoices: lastMonthInvoices > 0 ? ((invoiceCount - lastMonthInvoices) / lastMonthInvoices) * 100 : 0,
                },
            },
        });
    }
    catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics',
            message: error.message,
        });
    }
});
// Helper function to get category colors
function getCategoryColor(category) {
    const colors = {
        Operations: '#1E1B4F',
        Marketing: '#F97316',
        Facilities: '#D8D6F8',
        IT: '#6366F1',
        Other: '#9CA3AF',
    };
    return colors[category] || '#9CA3AF';
}
exports.default = router;
//# sourceMappingURL=dashboard.js.map