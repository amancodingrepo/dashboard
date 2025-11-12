
import { Router } from "express";
import axios from "axios";
import dotenv from "dotenv";
import { prisma } from '../lib/prisma';
dotenv.config();
const router = Router();

// Fallback queries for common requests when Vanna is slow
async function handleQueryFallback(query: string): Promise<any> {
  const lowerQuery = query.toLowerCase();
  
  try {
    // Top vendors by spend
    if (lowerQuery.includes('top') && lowerQuery.includes('vendor')) {
      const limit = parseInt(lowerQuery.match(/\d+/)?.[0] || '5');
      
      const vendorSpend = await prisma.invoice.groupBy({
        by: ['vendorId'],
        _sum: { totalAmount: true },
        _count: { id: true },
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: limit,
      });

      const vendorIds = vendorSpend.map(v => v.vendorId).filter(id => id !== null);
      const vendors = await prisma.vendor.findMany({
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
      const result = await prisma.invoice.aggregate({
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
      const overdueInvoices = await prisma.invoice.findMany({
        where: {
          paymentDueDate: { lt: new Date() },
          paymentStatus: { not: 'paid' },
        },
        include: { vendor: { select: { name: true } } },
        orderBy: { paymentDueDate: 'asc' },
        take: 10,
      });

      const results = overdueInvoices.map(inv => ({
        invoice_ref: inv.invoiceRef,
        vendor_name: inv.vendor?.name || 'Unknown',
        amount: inv.totalAmount || 0,
        due_date: inv.paymentDueDate,
      }));

      return {
        success: true,
        sql: `SELECT i.invoice_ref, v.name as vendor_name, i.total_amount as amount, i.payment_due_date as due_date FROM "Invoice" i JOIN "Vendor" v ON i.vendor_id = v.id WHERE i.payment_due_date < NOW() AND i.payment_status != 'paid' ORDER BY i.payment_due_date ASC LIMIT 10;`,
        results,
        answer: `Found ${results.length} overdue invoices (using fast database query).`,
      };
    }

    return null; // No fallback available
  } catch (error) {
    console.error('Fallback query error:', error);
    return null;
  }
}
// Helper function to format results for frontend
function formatResults(results: any[]): any[] {
  if (!Array.isArray(results)) {
    return [];
  }
  
  return results.map(row => {
    const formattedRow: any = {};
    for (const [key, value] of Object.entries(row)) {
      // Format dates
      if (value instanceof Date) {
        formattedRow[key] = value.toISOString().split('T')[0];
      }
      // Format numbers to 2 decimal places if they're floats
      else if (typeof value === 'number' && value % 1 !== 0) {
        formattedRow[key] = parseFloat(value.toFixed(2));
      }
      // Keep other values as-is
      else {
        formattedRow[key] = value;
      }
    }
    return formattedRow;
  });
}

router.post("/", async (req, res) => {
  try {
    console.log('Chat with data endpoint hit:', req.body);
    const { query } = req.body;
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ 
        error: "query required",
        answer: "Please provide a valid query.",
        sql: null,
        results: [],
        success: false
      });
    }
  
    // Check if Vanna service is configured
    const vanna_base_url = process.env.VANNA_API_BASE_URL;
    console.log('VANNA_API_BASE_URL:', vanna_base_url ? 'Set' : 'Not set');
    
    if (!vanna_base_url) {
      console.log('Vanna AI service not configured, trying fallback');
      try {
        const fallbackResult = await handleQueryFallback(query.trim());
        
        if (fallbackResult && fallbackResult.success) {
          console.log('Fallback successful for missing Vanna config');
          return res.json({
            answer: fallbackResult.answer,
            sql: fallbackResult.sql,
            results: formatResults(fallbackResult.results || []),
            success: true
          });
        }
      } catch (fallbackError: any) {
        console.error('Fallback query failed:', fallbackError);
        console.error('Error details:', {
          message: fallbackError?.message,
          stack: fallbackError?.stack
        });
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
    const resp = await axios.post(vanna_url, { question: query }, { timeout: 10000 });
    
    // Map Vanna response to frontend expected format
    const vannaData = resp.data;
    
    // If Vanna service returned an error, try fallback
    if (!vannaData.success) {
      console.log('Vanna returned error, trying fallback:', vannaData.error);
      const fallbackResult = await handleQueryFallback(query);
      
      if (fallbackResult && fallbackResult.success) {
        console.log('Fallback successful for Vanna error');
        return res.json({
          answer: fallbackResult.answer,
          sql: fallbackResult.sql,
          results: formatResults(fallbackResult.results || []),
          success: true
        });
      }
    }
    
    // Ensure results is always an array
    const vannaResults = Array.isArray(vannaData.results) ? vannaData.results : [];
    
    const response = {
      answer: vannaData.success ? 
        `I found ${vannaResults.length} result${vannaResults.length !== 1 ? 's' : ''} for your query.` : 
        "I encountered an issue processing your request.",
      sql: vannaData.sql || null,
      results: formatResults(vannaResults),
      error: vannaData.success ? null : (vannaData.error || "Unknown error"),
      success: vannaData.success || false
    };
    
    res.json(response);
  } catch (e: any) {
    console.error('Vanna service error, trying fallback:', {
      message: e.message,
      code: e.code,
      response: e.response?.data,
      status: e.response?.status
    });
    
    // Try fallback for common queries when Vanna is slow/unavailable
    console.log('Attempting fallback query for:', query);
    try {
      const fallbackResult = await handleQueryFallback(query);
      
      if (fallbackResult && fallbackResult.success) {
        console.log('Fallback successful');
        return res.json({
          answer: fallbackResult.answer,
          sql: fallbackResult.sql,
          results: formatResults(fallbackResult.results || []),
          success: true
        });
      }
    } catch (fallbackErr: any) {
      console.error('Fallback query error:', fallbackErr);
    }
    
    // No fallback available, return error
    let errorMsg = "Unknown error";
    let userMessage = "The AI service is taking too long to respond. Please try a simpler query like 'Show top 5 vendors' or 'Total spend'.";
    
    if (e.code === 'ECONNABORTED' || e.message?.includes('timeout')) {
      errorMsg = `Vanna AI service timeout: ${e.message}`;
      userMessage = "The AI service is taking too long (possibly waking up). Try asking: 'Show top vendors', 'Total spend', or 'Overdue invoices'.";
    } else if (e.code === 'ECONNREFUSED' || e.code === 'ENOTFOUND') {
      errorMsg = `Cannot connect to Vanna AI service: ${e.message}`;
      userMessage = "The AI service is currently unavailable. Try asking: 'Show top vendors', 'Total spend', or 'Overdue invoices'.";
    } else if (e.response?.status === 500) {
      errorMsg = `Vanna AI service error (${e.response.status}): ${e.response?.data?.error || e.message}`;
      userMessage = "The AI service has an internal error. Try asking: 'Show top vendors', 'Total spend', or 'Overdue invoices'.";
    } else if (e.response?.status) {
      errorMsg = `Vanna AI service error (${e.response.status}): ${e.response?.data?.error || e.message}`;
      userMessage = "The AI service returned an error. Please try again.";
    } else {
      errorMsg = e.response?.data?.detail || e.response?.data?.error || e.message || String(e);
    }
    
    res.status(500).json({ 
      error: errorMsg,
      answer: userMessage,
      sql: null,
      results: [],
      success: false
    });
  }
  } catch (outerError: any) {
    console.error('Unhandled error in chat-with-data endpoint:', outerError);
    console.error('Error stack:', outerError?.stack);
    console.error('Error details:', {
      message: outerError?.message,
      name: outerError?.name,
      code: outerError?.code
    });
    
    // Try one more fallback attempt
    try {
      const finalFallback = await handleQueryFallback(req.body?.query || '');
      if (finalFallback && finalFallback.success) {
        return res.json({
          answer: finalFallback.answer,
          sql: finalFallback.sql,
          results: formatResults(finalFallback.results || []),
          success: true
        });
      }
    } catch (finalErr) {
      console.error('Final fallback also failed:', finalErr);
    }
    
    res.status(500).json({
      error: process.env.NODE_ENV === 'production' 
        ? "Internal server error" 
        : outerError?.message || "An unexpected error occurred",
      answer: "An unexpected error occurred. Please try again later or contact support.",
      sql: null,
      results: [],
      success: false
    });
  }
});
export default router;
