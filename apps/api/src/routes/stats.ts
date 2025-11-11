import { Router } from "express";
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { subMonths, startOfMonth, format } from "date-fns";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    // Get summary counts
    const [vendorCount, customerCount, invoiceCount, totalSpendResult] = await Promise.all([
      prisma.vendor.count(),
      prisma.customer.count(),
      prisma.invoice.count(),
      prisma.invoice.aggregate({
        _sum: { totalAmount: true },
      }),
    ]);

    const totalSpend = totalSpendResult._sum.totalAmount || 0;

    // Monthly spend for last 6 months
    const months: { label: string; start: Date; end: Date }[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = startOfMonth(subMonths(new Date(), i));
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      months.push({ label: format(start, "yyyy-MM"), start, end });
    }

    const monthlySpend = await Promise.all(
      months.map(async (m) => {
        const result = await prisma.invoice.aggregate({
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
      })
    );

    // Spend by vendor (top 10)
    const vendorSpend = await prisma.invoice.groupBy({
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

    const vendorIds = vendorSpend.map((v: any) => v.vendorId).filter((id: any): id is number => id !== null);
    const vendors = await prisma.vendor.findMany({
      where: {
        id: {
          in: vendorIds,
        },
      },
    });

    const vendorMap = new Map(vendors.map((v: any) => [v.id, v.name]));
    const spendByVendor = vendorSpend
      .map((v: any) => ({
        vendor: vendorMap.get(v.vendorId || 0) || "Unknown",
        spend: v._sum.totalAmount || 0,
      }))
      .filter((v: any) => v.vendor !== "Unknown");

    // Recent invoices (last 20)
    const recentInvoices = await prisma.invoice.findMany({
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
      recentInvoices: recentInvoices.map((inv: any) => ({
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
  } catch (error: any) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch stats" });
  }
});

export default router;
