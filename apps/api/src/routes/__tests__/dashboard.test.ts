import request from 'supertest';
import express from 'express';
import dashboardRouter from '../dashboard';

// Mock Prisma
jest.mock('../../lib/prisma', () => ({
  prisma: {
    invoice: {
      aggregate: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    vendor: {
      findMany: jest.fn(),
    },
    document: {
      count: jest.fn(),
      aggregate: jest.fn(),
    },
  },
}));

const app = express();
app.use(express.json());
app.use('/api/dashboard', dashboardRouter);

describe('Dashboard API Endpoints', () => {
  describe('GET /api/dashboard/stats', () => {
    it('should return dashboard statistics', async () => {
      const { prisma } = require('../../lib/prisma');
      
      prisma.invoice.aggregate.mockResolvedValue({
        _sum: { totalAmount: 100000 },
      });
      prisma.invoice.count.mockResolvedValue(64);
      prisma.document.count.mockResolvedValue(17);
      prisma.document.aggregate.mockResolvedValue({
        _avg: { confidenceScore: 0.95 },
      });

      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalSpend');
      expect(response.body.data).toHaveProperty('totalInvoices');
      expect(response.body.data).toHaveProperty('documentsUploaded');
    });

    it('should handle errors gracefully', async () => {
      const { prisma } = require('../../lib/prisma');
      prisma.invoice.aggregate.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/dashboard/invoice-trends', () => {
    it('should return monthly invoice trends', async () => {
      const { prisma } = require('../../lib/prisma');
      
      prisma.invoice.count.mockResolvedValue(10);
      prisma.invoice.aggregate.mockResolvedValue({
        _sum: { totalAmount: 50000 },
      });

      const response = await request(app)
        .get('/api/dashboard/invoice-trends')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.period).toBe('12 months');
    });
  });

  describe('GET /api/dashboard/vendors/top10', () => {
    it('should return top 10 vendors', async () => {
      const { prisma } = require('../../lib/prisma');
      
      prisma.invoice.groupBy.mockResolvedValue([
        { vendorId: 1, _sum: { totalAmount: 50000 }, _count: { id: 10 } },
        { vendorId: 2, _sum: { totalAmount: 40000 }, _count: { id: 8 } },
      ]);

      prisma.vendor.findMany.mockResolvedValue([
        { id: 1, name: 'Vendor A', taxId: 'TAX1' },
        { id: 2, name: 'Vendor B', taxId: 'TAX2' },
      ]);

      const response = await request(app)
        .get('/api/dashboard/vendors/top10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0]).toHaveProperty('vendorName');
      expect(response.body.data[0]).toHaveProperty('totalSpend');
    });
  });

  describe('GET /api/dashboard/invoices', () => {
    it('should return paginated invoices', async () => {
      const { prisma } = require('../../lib/prisma');
      
      prisma.invoice.count.mockResolvedValue(100);
      prisma.invoice.findMany.mockResolvedValue([
        {
          id: 1,
          invoiceRef: 'INV-001',
          totalAmount: 1000,
          vendor: { name: 'Vendor A' },
        },
      ]);

      const response = await request(app)
        .get('/api/dashboard/invoices?page=1&limit=20')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('total');
    });

    it('should filter invoices by search query', async () => {
      const { prisma } = require('../../lib/prisma');
      
      prisma.invoice.count.mockResolvedValue(1);
      prisma.invoice.findMany.mockResolvedValue([
        {
          id: 1,
          invoiceRef: 'INV-001',
          totalAmount: 1000,
        },
      ]);

      const response = await request(app)
        .get('/api/dashboard/invoices?search=INV-001')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
