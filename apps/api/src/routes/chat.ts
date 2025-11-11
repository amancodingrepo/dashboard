import { Router } from 'express';
import { Request, Response } from 'express';
import axios from 'axios';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * POST /api/chat-with-data
 * Forwards natural language queries to Vanna AI
 * Returns generated SQL and query results
 */
router.post('/chat-with-data', async (req: Request, res: Response) => {
  try {
    const { query, userId } = req.body; // userId optional for now

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'Query parameter is required and must be a string',
      });
    }

    const vannaBaseUrl = process.env.VANNA_API_BASE_URL;

    // If Vanna AI is not configured, use fallback logic
    if (!vannaBaseUrl) {
      console.warn('Vanna AI not configured, using fallback query handler');
      const result = await handleQueryFallback(query);
      
      // Save to history
      try {
        await prisma.chatHistory.create({
          data: {
            userId: userId || null,
            query,
            sql: result.sql,
            results: result.results || [],
            error: result.error || null,
          },
        });
      } catch (historyError) {
        console.error('Failed to save chat history:', historyError);
      }
      
      return res.json(result);
    }

    try {
      // Forward query to Vanna AI
      const vannaResponse = await axios.post(
        `${vannaBaseUrl}/generate-sql`,
        {
          question: query,
        },
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.VANNA_API_KEY && {
              Authorization: `Bearer ${process.env.VANNA_API_KEY}`,
            }),
          },
        }
      );

      const { sql, results, error } = vannaResponse.data;

      if (error) {
        return res.json({
          success: false,
          error: error,
          answer: 'I encountered an error generating SQL for your question.',
        });
      }

      return res.json({
        success: true,
        sql: sql,
        results: results || [],
        answer: generateAnswer(query, results),
      });
    } catch (vannaError: any) {
      console.error('Vanna AI error:', vannaError.message);
      // Fallback to local processing
      const result = await handleQueryFallback(query);
      return res.json(result);
    }
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process query',
      message: error.message,
    });
  }
});

/**
 * Fallback handler when Vanna AI is not available
 * Handles common queries directly using Prisma
 */
async function handleQueryFallback(query: string): Promise<any> {
  const lowerQuery = query.toLowerCase();

  try {
    // Total spend in last 90 days
    if (lowerQuery.includes('total spend') && lowerQuery.includes('90 days')) {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const result = await prisma.invoice.aggregate({
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
        answer: `The total spend in the last 90 days is €${(
          result._sum.totalAmount || 0
        ).toLocaleString('de-DE', { minimumFractionDigits: 2 })} across ${
          result._count.id
        } invoices.`,
      };
    }

    // Top 5 vendors by spend
    if (lowerQuery.includes('top') && lowerQuery.includes('vendor')) {
      const limit = parseInt(lowerQuery.match(/\d+/)?.[0] || '5');

      const vendorSpend = await prisma.invoice.groupBy({
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
        .map((v: any) => v.vendorId)
        .filter((id: any): id is number => id !== null);

      const vendors = await prisma.vendor.findMany({
        where: {
          id: { in: vendorIds },
        },
      });

      const vendorMap = new Map(vendors.map((v: any) => [v.id, v.name]));

      const results = vendorSpend.map((v: any) => ({
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

      const overdueInvoices = await prisma.invoice.findMany({
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

      const results = overdueInvoices.map((inv) => ({
        invoice_ref: inv.invoiceRef,
        vendor_name: inv.vendor?.name || 'Unknown',
        amount: inv.totalAmount || 0,
        due_date: inv.paymentDueDate,
        days_overdue: Math.floor(
          (now.getTime() - (inv.paymentDueDate?.getTime() || now.getTime())) /
            (1000 * 60 * 60 * 24)
        ),
      }));

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
      const result = await prisma.invoice.aggregate({
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
        answer: `The average invoice value is €${(result._avg.totalAmount || 0).toLocaleString(
          'de-DE',
          { minimumFractionDigits: 2 }
        )} across ${result._count.id} invoices.`,
      };
    }

    // Default response
    return {
      success: false,
      error: 'Query not recognized',
      answer:
        "I couldn't understand your question. Try asking about:\n• Total spend in the last 90 days\n• Top 5 vendors by spend\n• Overdue invoices\n• Average invoice value",
    };
  } catch (error: any) {
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
function generateAnswer(query: string, results: any[]): string {
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
router.get('/chat-history', async (req: Request, res: Response) => {
  try {
    const { userId, limit = '50' } = req.query;
    
    const where: any = {};
    if (userId) {
      where.userId = parseInt(userId as string);
    }
    
    const history = await prisma.chatHistory.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit as string),
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
  } catch (error: any) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat history',
      message: error.message,
    });
  }
});

export default router;
