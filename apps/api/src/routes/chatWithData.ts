import { Router } from "express";
import axios from "axios";
import dotenv from "dotenv";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";

dotenv.config();
const router = Router();

// Get Vanna API URL from environment or use default
const VANNA_API_BASE_URL = process.env.VANNA_API_BASE_URL || 'https://van-1a6s.onrender.com';
const VANNA_API_KEY = process.env.VANNA_API_KEY || '';

// Create axios instance for Vanna API
const vannaApi = axios.create({
  baseURL: VANNA_API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    ...(VANNA_API_KEY && { 'Authorization': `Bearer ${VANNA_API_KEY}` })
  }
});

// Fallback queries for common requests when Vanna is not available
async function handleQueryFallback(query: string): Promise<any> {
  const lowerQuery = query.toLowerCase();

  try {
    // Top vendors by spend
    if (lowerQuery.includes("top") && lowerQuery.includes("vendor")) {
      const limit = parseInt(lowerQuery.match(/\d+/)?.[0] || "5");

      const vendorSpend = await prisma.invoice.groupBy({
        by: ["vendorId"],
        _sum: { totalAmount: true },
        _count: { id: true },
        orderBy: { _sum: { totalAmount: "desc" } },
        take: limit,
      });

      const vendorIds = vendorSpend
        .map((v) => v.vendorId)
        .filter((id) => id !== null);
      const vendors = await prisma.vendor.findMany({
        where: { id: { in: vendorIds } },
      });

      const vendorMap = new Map(vendors.map((v) => [v.id, v.name]));
      const results = vendorSpend.map((v) => ({
        vendor_name: vendorMap.get(v.vendorId) || "Unknown",
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
    if (lowerQuery.includes("total") && lowerQuery.includes("spend")) {
      let days = 0;
      let dateFilter: { gte?: Date } = {};
      let timeText = "all time";

      const daysMatch = lowerQuery.match(/last (\d+) days/);
      if (daysMatch && daysMatch[1]) {
        days = parseInt(daysMatch[1], 10);
        timeText = `the last ${days} days`;
      } else if (lowerQuery.includes("last month")) {
        days = 30;
        timeText = "the last month";
      } else if (lowerQuery.includes("last year")) {
        days = 365;
        timeText = "the last year";
      }

      const aggregationArgs: Prisma.InvoiceAggregateArgs = {
        _sum: { totalAmount: true },
        _count: true,
      };

      if (days > 0) {
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);
        aggregationArgs.where = { invoiceDate: { gte: fromDate } };
      }

      const result = await prisma.invoice.aggregate(aggregationArgs);

      const sql = `SELECT SUM(total_amount) as total_spend, COUNT(*) as invoice_count FROM "Invoice"${
        days > 0
          ? ` WHERE invoice_date >= NOW() - interval '${days} days'`
          : ""
      };`;

      return {
        success: true,
        sql,
        results: [
          {
            total_spend: result._sum?.totalAmount || 0,
            invoice_count: result._count || 0,
          },
        ],
        answer: `Total spend in ${timeText} is €${(
          result._sum?.totalAmount || 0
        ).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
        })} across ${
          result._count || 0
        } invoices (using fast database query).`,
      };
    }

    // Latest invoices
    if (lowerQuery.includes("latest") && lowerQuery.includes("invoices")) {
      const latestInvoices = await prisma.invoice.findMany({
        where: { invoiceDate: { not: null } },
        include: { vendor: { select: { name: true } } },
        orderBy: { invoiceDate: "desc" },
        take: 5,
      });
      const results = latestInvoices.map((inv) => ({
        invoice_ref: inv.invoiceRef,
        vendor_name: inv.vendor?.name || "Unknown",
        amount: inv.totalAmount || 0,
        invoice_date: inv.invoiceDate,
        status: inv.paymentStatus,
      }));
      return {
        success: true,
        sql: `SELECT i.invoice_ref, v.name as vendor_name, i.total_amount as amount, i.invoice_date, i.payment_status as status FROM "Invoice" i JOIN "Vendor" v ON i.vendor_id = v.id ORDER BY i.invoice_date DESC LIMIT 5;`,
        results,
        answer: `Here are the 5 latest invoices (using fast database query).`,
      };
    }
    // Overdue invoices
    if (lowerQuery.includes("overdue")) {
      const overdueInvoices = await prisma.invoice.findMany({
        where: {
          paymentDueDate: { lt: new Date() },
          paymentStatus: { not: "paid" },
        },
        include: { vendor: { select: { name: true } } },
        orderBy: { paymentDueDate: "asc" },
        take: 10,
      });

      const results = overdueInvoices.map((inv) => ({
        invoice_ref: inv.invoiceRef,
        vendor_name: inv.vendor?.name || "Unknown",
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
  } catch (error: any) {
    console.error("Fallback query error:", error);
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      name: error?.name,
      stack: error?.stack,
    });

    // If it's a database connection error, throw it so it can be handled upstream
    if (
      error?.code === "P1001" ||
      error?.message?.includes("connect") ||
      error?.message?.includes("database")
    ) {
      throw error;
    }

    return null;
  }
}

router.post('/', async (req: Request, res: Response) => {
  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({ 
      success: false, 
      error: 'Query is required' 
    });
  }

  try {
    // First try to use Vanna AI service if available
    try {
      const response = await vannaApi.post('/generate-sql', { question: query });
      
      if (response.data && response.data.success) {
        return res.json({
          success: true,
          answer: response.data.answer,
          sql: response.data.sql,
          results: response.data.results,
          source: 'vanna-ai'
        });
      }
    } catch (vannaError) {
      console.error('Vanna AI service error:', vannaError?.response?.data || vannaError.message);
      // Continue to fallback if Vanna fails
    }

    // Fallback to direct database queries for common requests
    const fallbackResult = await handleQueryFallback(query);
    
    if (fallbackResult) {
      return res.json({
        ...fallbackResult,
        source: 'fallback-query'
      });
    }

    // If no fallback was available
    return res.status(404).json({
      success: false,
      error: 'No suitable response could be generated for your query.',
      suggestion: 'Try rephrasing your question or ask about top vendors, total spend, or overdue invoices.'
    });

  } catch (error: any) {
    console.error('Chat with data error:', error);
    
    // Handle database connection errors
    if (error.code === 'P1001' || error.message?.includes('connect')) {
      return res.status(503).json({
        success: false,
        error: 'Database connection error',
        message: 'Unable to connect to the database. Please try again later.'
      });
    }

    // Handle other errors
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

export default router;
