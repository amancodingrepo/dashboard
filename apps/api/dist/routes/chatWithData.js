"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = require("../lib/prisma");
dotenv_1.default.config();
const router = (0, express_1.Router)();
// Fallback queries for common requests when Vanna is slow
async function handleQueryFallback(query) {
    var _a;
    const lowerQuery = query.toLowerCase();
    try {
        // Top vendors by spend
        if (lowerQuery.includes('top') && lowerQuery.includes('vendor')) {
            const limit = parseInt(((_a = lowerQuery.match(/\d+/)) === null || _a === void 0 ? void 0 : _a[0]) || '5');
            const vendorSpend = await prisma_1.prisma.invoice.groupBy({
                by: ['vendorId'],
                _sum: { totalAmount: true },
                _count: { id: true },
                orderBy: { _sum: { totalAmount: 'desc' } },
                take: limit,
            });
            const vendorIds = vendorSpend.map(v => v.vendorId).filter(id => id !== null);
            const vendors = await prisma_1.prisma.vendor.findMany({
                where: { id: { in: vendorIds } },
            });
            const vendorMap = new Map(vendors.map(v => [v.id, v.name]));
            const results = vendorSpend.map(v => ({
                vendor_name: vendorMap.get(v.vendorId) || 'Unknown',
                total_spend: v._sum.totalAmount || 0,
                invoice_count: v._count.id,
            }));
            return {
                success: true,
                sql: `SELECT v.name as vendor_name, SUM(i.total_amount) as total_spend, COUNT(i.id) as invoice_count FROM "Invoice" i JOIN "Vendor" v ON i.vendor_id = v.id GROUP BY v.id, v.name ORDER BY total_spend DESC LIMIT ${limit};`,
                results,
                answer: `Here are the top ${limit} vendors by spend (using fast database query).`,
            };
        }
        // Total spend queries
        if (lowerQuery.includes('total') && lowerQuery.includes('spend')) {
            const result = await prisma_1.prisma.invoice.aggregate({
                _sum: { totalAmount: true },
                _count: { id: true },
            });
            return {
                success: true,
                sql: `SELECT SUM(total_amount) as total_spend, COUNT(*) as invoice_count FROM "Invoice";`,
                results: [{
                        total_spend: result._sum.totalAmount || 0,
                        invoice_count: result._count.id,
                    }],
                answer: `Total spend is €${(result._sum.totalAmount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} across ${result._count.id} invoices (using fast database query).`,
            };
        }
        // Overdue invoices
        if (lowerQuery.includes('overdue')) {
            const overdueInvoices = await prisma_1.prisma.invoice.findMany({
                where: {
                    paymentDueDate: { lt: new Date() },
                    paymentStatus: { not: 'paid' },
                },
                include: { vendor: { select: { name: true } } },
                orderBy: { paymentDueDate: 'asc' },
                take: 10,
            });
            const results = overdueInvoices.map(inv => {
                var _a;
                return ({
                    invoice_ref: inv.invoiceRef,
                    vendor_name: ((_a = inv.vendor) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown',
                    amount: inv.totalAmount || 0,
                    due_date: inv.paymentDueDate,
                });
            });
            return {
                success: true,
                sql: `SELECT i.invoice_ref, v.name as vendor_name, i.total_amount as amount, i.payment_due_date as due_date FROM "Invoice" i JOIN "Vendor" v ON i.vendor_id = v.id WHERE i.payment_due_date < NOW() AND i.payment_status != 'paid' ORDER BY i.payment_due_date ASC LIMIT 10;`,
                results,
                answer: `Found ${results.length} overdue invoices (using fast database query).`,
            };
        }
        return null; // No fallback available
    }
    catch (error) {
        console.error('Fallback query error:', error);
        return null;
    }
}
router.post("/", async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    try {
        console.log('Chat with data endpoint hit:', req.body);
        const { query } = req.body;
        if (!query)
            return res.status(400).json({ error: "query required" });
        // Check if Vanna service is configured
        const vanna_base_url = process.env.VANNA_API_BASE_URL;
        console.log('VANNA_API_BASE_URL:', vanna_base_url ? 'Set' : 'Not set');
        if (!vanna_base_url) {
            console.log('Vanna AI service not configured, trying fallback');
            try {
                const fallbackResult = await handleQueryFallback(query);
                if (fallbackResult) {
                    console.log('Fallback successful for missing Vanna config');
                    return res.json({
                        answer: fallbackResult.answer,
                        sql: fallbackResult.sql,
                        results: fallbackResult.results,
                        success: fallbackResult.success
                    });
                }
            }
            catch (fallbackError) {
                console.error('Fallback query failed:', fallbackError);
                return res.status(200).json({
                    error: "Database connection error",
                    answer: "Unable to connect to the database. Please try again later or contact support.",
                    sql: null,
                    results: [],
                    success: false
                });
            }
            // No fallback available, return helpful error
            return res.status(200).json({
                error: "AI service not configured and no fallback available for this query.",
                answer: "The AI service is not available. Try asking: 'Show top vendors', 'Total spend', or 'Overdue invoices'.",
                sql: null,
                results: [],
                success: false
            });
        }
        try {
            const vanna_url = vanna_base_url + "/generate-sql";
            console.log('Calling Vanna:', vanna_url);
            // Try Vanna with shorter timeout first
            const resp = await axios_1.default.post(vanna_url, { question: query }, { timeout: 10000 });
            // Map Vanna response to frontend expected format
            const vannaData = resp.data;
            // If Vanna service returned an error, try fallback
            if (!vannaData.success) {
                console.log('Vanna returned error, trying fallback:', vannaData.error);
                const fallbackResult = await handleQueryFallback(query);
                if (fallbackResult) {
                    console.log('Fallback successful for Vanna error');
                    return res.json({
                        answer: fallbackResult.answer,
                        sql: fallbackResult.sql,
                        results: fallbackResult.results,
                        success: fallbackResult.success
                    });
                }
            }
            const response = {
                answer: vannaData.success ?
                    `I found ${((_a = vannaData.results) === null || _a === void 0 ? void 0 : _a.length) || 0} results for your query.` :
                    "I encountered an issue processing your request.",
                sql: vannaData.sql,
                results: vannaData.results || [],
                error: vannaData.success ? null : (vannaData.error || "Unknown error"),
                success: vannaData.success
            };
            res.json(response);
        }
        catch (e) {
            console.error('Vanna service error, trying fallback:', {
                message: e.message,
                code: e.code,
                response: (_b = e.response) === null || _b === void 0 ? void 0 : _b.data,
                status: (_c = e.response) === null || _c === void 0 ? void 0 : _c.status
            });
            // Try fallback for common queries when Vanna is slow/unavailable
            console.log('Attempting fallback query for:', query);
            const fallbackResult = await handleQueryFallback(query);
            if (fallbackResult) {
                console.log('Fallback successful');
                return res.json({
                    answer: fallbackResult.answer,
                    sql: fallbackResult.sql,
                    results: fallbackResult.results,
                    success: fallbackResult.success
                });
            }
            // No fallback available, return error
            let errorMsg = "Unknown error";
            let userMessage = "The AI service is taking too long to respond. Please try a simpler query like 'Show top 5 vendors' or 'Total spend'.";
            if (e.code === 'ECONNABORTED' || ((_d = e.message) === null || _d === void 0 ? void 0 : _d.includes('timeout'))) {
                errorMsg = `Vanna AI service timeout: ${e.message}`;
                userMessage = "The AI service is taking too long (possibly waking up). Try asking: 'Show top vendors', 'Total spend', or 'Overdue invoices'.";
            }
            else if (e.code === 'ECONNREFUSED' || e.code === 'ENOTFOUND') {
                errorMsg = `Cannot connect to Vanna AI service: ${e.message}`;
                userMessage = "The AI service is currently unavailable. Try asking: 'Show top vendors', 'Total spend', or 'Overdue invoices'.";
            }
            else if (((_e = e.response) === null || _e === void 0 ? void 0 : _e.status) === 500) {
                errorMsg = `Vanna AI service error (${e.response.status}): ${((_g = (_f = e.response) === null || _f === void 0 ? void 0 : _f.data) === null || _g === void 0 ? void 0 : _g.error) || e.message}`;
                userMessage = "The AI service has an internal error. Try asking: 'Show top vendors', 'Total spend', or 'Overdue invoices'.";
            }
            else if ((_h = e.response) === null || _h === void 0 ? void 0 : _h.status) {
                errorMsg = `Vanna AI service error (${e.response.status}): ${((_k = (_j = e.response) === null || _j === void 0 ? void 0 : _j.data) === null || _k === void 0 ? void 0 : _k.error) || e.message}`;
                userMessage = "The AI service returned an error. Please try again.";
            }
            else {
                errorMsg = ((_m = (_l = e.response) === null || _l === void 0 ? void 0 : _l.data) === null || _m === void 0 ? void 0 : _m.detail) || ((_p = (_o = e.response) === null || _o === void 0 ? void 0 : _o.data) === null || _p === void 0 ? void 0 : _p.error) || e.message || String(e);
            }
            res.status(500).json({
                error: errorMsg,
                answer: userMessage,
                sql: null,
                results: [],
                success: false
            });
        }
    }
    catch (outerError) {
        console.error('Unhandled error in chat-with-data endpoint:', outerError);
        res.status(500).json({
            error: "Internal server error",
            answer: "An unexpected error occurred. Please try again later.",
            sql: null,
            results: [],
            success: false
        });
    }
});
exports.default = router;
//# sourceMappingURL=chatWithData.js.map