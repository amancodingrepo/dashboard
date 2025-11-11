"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const date_fns_1 = require("date-fns");
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
    try {
        // Get summary counts
        const [vendorCount, customerCount, invoiceCount, totalSpendResult] = await Promise.all([
            prisma_1.prisma.vendor.count(),
            prisma_1.prisma.customer.count(),
            prisma_1.prisma.invoice.count(),
            prisma_1.prisma.invoice.aggregate({
                _sum: { totalAmount: true },
            }),
        ]);
        const totalSpend = totalSpendResult._sum.totalAmount || 0;
        // Monthly spend for last 6 months
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const start = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(new Date(), i));
            const end = new Date(start);
            end.setMonth(end.getMonth() + 1);
            months.push({ label: (0, date_fns_1.format)(start, "yyyy-MM"), start, end });
        }
        const monthlySpend = await Promise.all(months.map(async (m) => {
            const result = await prisma_1.prisma.invoice.aggregate({
                where: {
                    invoiceDate: {
                        gte: m.start,
                        lt: m.end,
                    },
                },
                _sum: {
                    totalAmount: true,
                },
            });
            return {
                month: m.label,
                spend: result._sum.totalAmount || 0,
            };
        }));
        // Spend by vendor (top 10)
        const vendorSpend = await prisma_1.prisma.invoice.groupBy({
            by: ["vendorId"],
            _sum: {
                totalAmount: true,
            },
            orderBy: {
                _sum: {
                    totalAmount: "desc",
                },
            },
            take: 10,
        });
        const vendorIds = vendorSpend.map((v) => v.vendorId).filter((id) => id !== null);
        const vendors = await prisma_1.prisma.vendor.findMany({
            where: {
                id: {
                    in: vendorIds,
                },
            },
        });
        const vendorMap = new Map(vendors.map((v) => [v.id, v.name]));
        const spendByVendor = vendorSpend
            .map((v) => ({
            vendor: vendorMap.get(v.vendorId || 0) || "Unknown",
            spend: v._sum.totalAmount || 0,
        }))
            .filter((v) => v.vendor !== "Unknown");
        // Recent invoices (last 20)
        const recentInvoices = await prisma_1.prisma.invoice.findMany({
            take: 20,
            orderBy: {
                invoiceDate: "desc",
            },
            include: {
                vendor: {
                    select: {
                        name: true,
                    },
                },
                customer: {
                    select: {
                        name: true,
                    },
                },
            },
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
            recentInvoices: recentInvoices.map((inv) => ({
                id: inv.id,
                invoiceRef: inv.invoiceRef,
                invoiceDate: inv.invoiceDate,
                totalAmount: inv.totalAmount,
                vendor: inv.vendor ? { name: inv.vendor.name } : null,
                customer: inv.customer ? { name: inv.customer.name } : null,
            })),
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