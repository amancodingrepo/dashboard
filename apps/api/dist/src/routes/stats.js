"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Analytics_Test_Data_json_1 = __importDefault(require("../../Analytics_Test_Data.json"));
const date_fns_1 = require("date-fns");
const router = (0, express_1.Router)();
const data = Analytics_Test_Data_json_1.default;
router.get("/", async (req, res) => {
    try {
        const vendorCount = new Set(data.map((d) => { var _a; return (_a = d.extractedData.llmData.vendor.value.vendorName) === null || _a === void 0 ? void 0 : _a.value; })).size;
        const customerCount = new Set(data.map((d) => { var _a; return (_a = d.extractedData.llmData.customer.value.customerName) === null || _a === void 0 ? void 0 : _a.value; })).size;
        const invoiceCount = data.length;
        const totalSpend = data.reduce((acc, curr) => {
            var _a;
            return acc +
                parseFloat(((_a = curr.extractedData.llmData.summary.value.invoiceTotal) === null || _a === void 0 ? void 0 : _a.value) || "0");
        }, 0);
        // Monthly spend for last 6 months
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const start = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(new Date(), i));
            const end = new Date(start);
            end.setMonth(end.getMonth() + 1);
            months.push({ label: (0, date_fns_1.format)(start, "yyyy-MM"), start, end });
        }
        const monthlySpend = months.map((m) => {
            const spend = data
                .filter((d) => {
                var _a;
                const invoiceDate = (0, date_fns_1.parseISO)(((_a = d.extractedData.llmData.invoice.value.invoiceDate) === null || _a === void 0 ? void 0 : _a.value) || "");
                return invoiceDate >= m.start && invoiceDate < m.end;
            })
                .reduce((acc, curr) => {
                var _a;
                return acc +
                    parseFloat(((_a = curr.extractedData.llmData.summary.value.invoiceTotal) === null || _a === void 0 ? void 0 : _a.value) || "0");
            }, 0);
            return { month: m.label, spend };
        });
        // Spend by vendor (top 10)
        const spendByVendorMap = new Map();
        data.forEach((d) => {
            var _a, _b;
            const vendorName = ((_a = d.extractedData.llmData.vendor.value.vendorName) === null || _a === void 0 ? void 0 : _a.value) || "Unknown";
            const spend = parseFloat(((_b = d.extractedData.llmData.summary.value.invoiceTotal) === null || _b === void 0 ? void 0 : _b.value) || "0");
            spendByVendorMap.set(vendorName, (spendByVendorMap.get(vendorName) || 0) + spend);
        });
        const spendByVendor = Array.from(spendByVendorMap.entries())
            .map(([vendor, spend]) => ({ vendor, spend }))
            .sort((a, b) => b.spend - a.spend)
            .slice(0, 10);
        // Recent invoices
        const recentInvoices = data
            .sort((a, b) => {
            var _a, _b;
            return (0, date_fns_1.parseISO)(((_a = b.extractedData.llmData.invoice.value.invoiceDate) === null || _a === void 0 ? void 0 : _a.value) || "").getTime() -
                (0, date_fns_1.parseISO)(((_b = a.extractedData.llmData.invoice.value.invoiceDate) === null || _b === void 0 ? void 0 : _b.value) || "").getTime();
        })
            .slice(0, 20)
            .map((d) => {
            var _a, _b, _c, _d, _e;
            return ({
                id: d._id,
                invoiceRef: (_a = d.extractedData.llmData.invoice.value.invoiceId) === null || _a === void 0 ? void 0 : _a.value,
                invoiceDate: (_b = d.extractedData.llmData.invoice.value.invoiceDate) === null || _b === void 0 ? void 0 : _b.value,
                totalAmount: (_c = d.extractedData.llmData.summary.value.invoiceTotal) === null || _c === void 0 ? void 0 : _c.value,
                vendor: { name: (_d = d.extractedData.llmData.vendor.value.vendorName) === null || _d === void 0 ? void 0 : _d.value },
                customer: { name: (_e = d.extractedData.llmData.customer.value.customerName) === null || _e === void 0 ? void 0 : _e.value },
            });
        });
        const payload = {
            summary: {
                totalVendors: vendorCount,
                totalCustomers: customerCount,
                totalInvoices: invoiceCount,
                totalSpend: totalSpend,
            },
            monthlySpend,
            spendByVendor,
            recentInvoices,
            timestamp: new Date().toISOString(),
        };
        res.json(payload);
    }
    catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: error.message || "Failed to fetch stats" });
    }
});
exports.default = router;
//# sourceMappingURL=stats.js.map