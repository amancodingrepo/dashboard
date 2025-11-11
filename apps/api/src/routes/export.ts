import { Router } from 'express';
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { Parser } from 'json2csv';

const router = Router();

/**
 * GET /api/export/invoices
 * Export invoices to CSV
 */
router.get('/invoices', async (req: Request, res: Response) => {
  try {
    const { format = 'csv', startDate, endDate, vendorId } = req.query;
    
    // Build where clause
    const where: any = {};
    if (startDate && endDate) {
      where.invoiceDate = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }
    if (vendorId) {
      where.vendorId = parseInt(vendorId as string);
    }
    
    // Fetch data
    const invoices = await prisma.invoice.findMany({
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
    const exportData = invoices.map((inv) => ({
      'Invoice Ref': inv.invoiceRef || '',
      'Invoice Date': inv.invoiceDate ? inv.invoiceDate.toISOString().split('T')[0] : '',
      'Vendor': inv.vendor?.name || '',
      'Vendor Tax ID': inv.vendor?.taxId || '',
      'Customer': inv.customer?.name || '',
      'Subtotal': inv.subTotal || 0,
      'Tax': inv.totalTax || 0,
      'Total Amount': inv.totalAmount || 0,
      'Currency': inv.currency || 'EUR',
      'Payment Status': inv.paymentStatus || '',
      'Payment Due Date': inv.paymentDueDate ? inv.paymentDueDate.toISOString().split('T')[0] : '',
      'Payment Terms': inv.paymentTerms || '',
    }));
    
    if (format === 'json') {
      return res.json({
        success: true,
        data: exportData,
        count: exportData.length,
      });
    }
    
    // Generate CSV
    const parser = new Parser();
    const csv = parser.parse(exportData);
    
    // Set headers for download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=invoices-export-${Date.now()}.csv`);
    res.send(csv);
    
  } catch (error: any) {
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
router.get('/vendors', async (req: Request, res: Response) => {
  try {
    const { format = 'csv' } = req.query;
    
    // Get vendor spend data
    const vendorSpend = await prisma.invoice.groupBy({
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
    
    // Get vendor details
    type VendorAggregate = (typeof vendorSpend)[number];

    const vendorIds = vendorSpend
      .map((v) => v.vendorId)
      .filter((id): id is number => id !== null);
    
    const vendors = await prisma.vendor.findMany({
      where: {
        id: { in: vendorIds },
      },
    });
    
    type VendorInfo = {
      id: number;
      name: string | null;
      taxId: string | null;
    };

    const vendorMap = new Map<number, VendorInfo>(
      vendors.map((v) => [v.id, v])
    );
    
    // Transform data
    const exportData = vendorSpend
      .filter((v): v is VendorAggregate & { vendorId: number } => v.vendorId !== null)
      .map((v) => {
        const vendor = vendorMap.get(v.vendorId);
        return {
          'Vendor Name': vendor?.name || 'Unknown',
          'Vendor Tax ID': vendor?.taxId || '',
          'Total Invoices': v._count.id,
          'Total Spend': v._sum.totalAmount ?? 0,
          'Average Invoice Value': v._avg.totalAmount ?? 0,
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
    const parser = new Parser();
    const csv = parser.parse(exportData);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=vendors-export-${Date.now()}.csv`);
    res.send(csv);
    
  } catch (error: any) {
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
router.get('/dashboard-summary', async (req: Request, res: Response) => {
  try {
    const { format = 'csv' } = req.query;
    
    // Get all summary data
    const [totalSpendResult, invoiceCount, vendorCount] = await Promise.all([
      prisma.invoice.aggregate({
        _sum: { totalAmount: true },
        _avg: { totalAmount: true },
      }),
      prisma.invoice.count(),
      prisma.vendor.count(),
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
    
    const parser = new Parser();
    const csv = parser.parse(summaryData);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=dashboard-summary-${Date.now()}.csv`);
    res.send(csv);
    
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export data',
      message: error.message,
    });
  }
});

export default router;
