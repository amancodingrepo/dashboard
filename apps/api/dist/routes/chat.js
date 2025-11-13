"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
// Note: /chat-with-data route moved to dedicated chatWithData.ts file
/**
 * Fallback handler when Vanna AI is not available
 * Handles common queries directly using Prisma
 */
async function handleQueryFallback(query) {
    var _a;
    const lowerQuery = query.toLowerCase();
    try {
        // Total spend in last 90 days
        if (lowerQuery.includes('total spend') && lowerQuery.includes('90 days')) {
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
            const result = await prisma_1.prisma.invoice.aggregate({
                where: {
                    invoiceDate: {
                        gte: ninetyDaysAgo,
                    },
                },
                _sum: {
                    totalAmount: true,
                },
                _count: {
                    id: true,
                },
            });
            const sql = `SELECT SUM(total_amount) as total_spend, COUNT(*) as invoice_count
FROM Invoice
WHERE invoice_date >= NOW() - INTERVAL '90 days';`;
            return {
                success: true,
                sql,
                results: [
                    {
                        total_spend: result._sum.totalAmount || 0,
                        invoice_count: result._count.id,
                    },
                ],
                answer: `The total spend in the last 90 days is €${(result._sum.totalAmount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} across ${result._count.id} invoices.`,
            };
        }
        // Top 5 vendors by spend
        if (lowerQuery.includes('top') && lowerQuery.includes('vendor')) {
            const limit = parseInt(((_a = lowerQuery.match(/\d+/)) === null || _a === void 0 ? void 0 : _a[0]) || '5');
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
                take: limit,
            });
            const vendorIds = vendorSpend
                .map((v) => v.vendorId)
                .filter((id) => id !== null);
            const vendors = await prisma_1.prisma.vendor.findMany({
                where: {
                    id: { in: vendorIds },
                },
            });
            const vendorMap = new Map(vendors.map((v) => [v.id, v.name]));
            const results = vendorSpend.map((v) => ({
                vendor_name: vendorMap.get(v.vendorId) || 'Unknown',
                total_spend: v._sum.totalAmount || 0,
                invoice_count: v._count.id,
            }));
            const sql = `SELECT v.name as vendor_name, SUM(i.total_amount) as total_spend, COUNT(i.id) as invoice_count
FROM Invoice i
JOIN Vendor v ON i.vendor_id = v.id
GROUP BY v.id, v.name
ORDER BY total_spend DESC
LIMIT ${limit};`;
            return {
                success: true,
                sql,
                results,
                answer: `Here are the top ${limit} vendors by spend.`,
            };
        }
        // Overdue invoices
        if (lowerQuery.includes('overdue')) {
            const now = new Date();
            const overdueInvoices = await prisma_1.prisma.invoice.findMany({
                where: {
                    paymentDueDate: {
                        lt: now,
                    },
                    paymentStatus: {
                        not: 'paid',
                    },
                },
                include: {
                    vendor: {
                        select: {
                            name: true,
                        },
                    },
                },
                orderBy: {
                    paymentDueDate: 'asc',
                },
                take: 20,
            });
            const results = overdueInvoices.map((inv) => {
                var _a, _b;
                return ({
                    invoice_ref: inv.invoiceRef,
                    vendor_name: ((_a = inv.vendor) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown',
                    amount: inv.totalAmount || 0,
                    due_date: inv.paymentDueDate,
                    days_overdue: Math.floor((now.getTime() - (((_b = inv.paymentDueDate) === null || _b === void 0 ? void 0 : _b.getTime()) || now.getTime())) /
                        (1000 * 60 * 60 * 24)),
                });
            });
            const sql = `SELECT i.invoice_ref, v.name as vendor_name, i.total_amount as amount,
       i.payment_due_date as due_date,
       EXTRACT(DAY FROM (NOW() - i.payment_due_date)) as days_overdue
FROM Invoice i
JOIN Vendor v ON i.vendor_id = v.id
WHERE i.payment_due_date < NOW()
  AND i.payment_status != 'paid'
ORDER BY i.payment_due_date ASC
LIMIT 20;`;
            return {
                success: true,
                sql,
                results,
                answer: `Found ${results.length} overdue invoices.`,
            };
        }
        // Average invoice value
        if (lowerQuery.includes('average invoice')) {
            const result = await prisma_1.prisma.invoice.aggregate({
                _avg: {
                    totalAmount: true,
                },
                _count: {
                    id: true,
                },
            });
            const sql = `SELECT AVG(total_amount) as avg_invoice_value, COUNT(*) as total_invoices
FROM Invoice;`;
            return {
                success: true,
                sql,
                results: [
                    {
                        avg_invoice_value: result._avg.totalAmount || 0,
                        total_invoices: result._count.id,
                    },
                ],
                answer: `The average invoice value is €${(result._avg.totalAmount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} across ${result._count.id} invoices.`,
            };
        }
        // Default response
        return {
            success: false,
            error: 'Query not recognized',
            answer: "I couldn't understand your question. Try asking about:\n• Total spend in the last 90 days\n• Top 5 vendors by spend\n• Overdue invoices\n• Average invoice value",
        };
    }
    catch (error) {
        console.error('Fallback query error:', error);
        return {
            success: false,
            error: error.message,
            answer: 'An error occurred while processing your query.',
        };
    }
}
/**
 * Generate a natural language answer from query results
 */
function generateAnswer(query, results) {
    if (!results || results.length === 0) {
        return 'No results found for your query.';
    }
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('total') || lowerQuery.includes('sum')) {
        return `I found ${results.length} result(s) for your query.`;
    }
    if (lowerQuery.includes('top') || lowerQuery.includes('list')) {
        return `Here are the top ${results.length} results for your query.`;
    }
    return `I found ${results.length} result(s) matching your query.`;
}
/**
 * GET /api/chat-history
 * Returns chat history (optionally filtered by userId)
 */
router.get('/chat-history', async (req, res) => {
    try {
        const { userId, limit = '50' } = req.query;
        const where = {};
        if (userId) {
            where.userId = parseInt(userId);
        }
        const history = await prisma_1.prisma.chatHistory.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            take: parseInt(limit),
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            data: history,
            count: history.length,
        });
    }
    catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch chat history',
            message: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=chat.js.map