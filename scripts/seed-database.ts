import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface AnalyticsTestData {
  vendors: Array<{
    name: string;
    address?: string;
    taxId?: string;
  }>;
  customers: Array<{
    name: string;
    address?: string;
  }>;
  invoices: Array<{
    invoiceRef?: string;
    invoiceDate?: string;
    deliveryDate?: string;
    subTotal?: number;
    totalTax?: number;
    totalAmount?: number;
    currency?: string;
    vendorName: string;
    customerName?: string;
    paymentTerms?: string;
    paymentDueDate?: string;
    paymentStatus?: string;
    lineItems?: Array<{
      description?: string;
      quantity?: number;
      unitPrice?: number;
      totalPrice?: number;
      vatRate?: number;
      vatAmount?: number;
    }>;
  }>;
}

async function loadTestData(): Promise<AnalyticsTestData> {
  const dataPath = path.join(__dirname, '../data/Analytics_Test_Data.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(rawData);
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Load test data
    const testData = await loadTestData();

    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Clearing existing data...');
    await prisma.lineItem.deleteMany();
    await prisma.document.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.chatHistory.deleteMany();
    await prisma.analytics.deleteMany();

    // Seed vendors
    console.log('👥 Seeding vendors...');
    const vendorMap = new Map<string, number>();
    for (const vendorData of testData.vendors) {
      const vendor = await prisma.vendor.create({
        data: {
          name: vendorData.name,
          address: vendorData.address,
          taxId: vendorData.taxId,
        },
      });
      vendorMap.set(vendorData.name, vendor.id);
    }
    console.log(`✅ Created ${testData.vendors.length} vendors`);

    // Seed customers
    console.log('🏢 Seeding customers...');
    const customerMap = new Map<string, number>();
    for (const customerData of testData.customers) {
      const customer = await prisma.customer.create({
        data: {
          name: customerData.name,
          address: customerData.address,
        },
      });
      customerMap.set(customerData.name, customer.id);
    }
    console.log(`✅ Created ${testData.customers.length} customers`);

    // Seed invoices
    console.log('📄 Seeding invoices...');
    let invoiceCount = 0;
    let lineItemCount = 0;

    for (const invoiceData of testData.invoices) {
      const vendorId = vendorMap.get(invoiceData.vendorName);
      const customerId = invoiceData.customerName 
        ? customerMap.get(invoiceData.customerName) 
        : null;

      if (!vendorId) {
        console.warn(`⚠️  Vendor not found: ${invoiceData.vendorName}`);
        continue;
      }

      const invoice = await prisma.invoice.create({
        data: {
          invoiceRef: invoiceData.invoiceRef,
          invoiceDate: invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate) : null,
          deliveryDate: invoiceData.deliveryDate ? new Date(invoiceData.deliveryDate) : null,
          subTotal: invoiceData.subTotal,
          totalTax: invoiceData.totalTax,
          totalAmount: invoiceData.totalAmount,
          currency: invoiceData.currency || 'EUR',
          vendorId: vendorId,
          customerId: customerId,
          paymentTerms: invoiceData.paymentTerms,
          paymentDueDate: invoiceData.paymentDueDate ? new Date(invoiceData.paymentDueDate) : null,
          paymentStatus: invoiceData.paymentStatus || 'pending',
          extractionConfidence: 0.95, // Default confidence score
        },
      });

      invoiceCount++;

      // Create line items if they exist
      if (invoiceData.lineItems && invoiceData.lineItems.length > 0) {
        // Create a document record for the line items
        const document = await prisma.document.create({
          data: {
            name: `Invoice_${invoiceData.invoiceRef || invoice.id}.pdf`,
            fileType: 'application/pdf',
            fileSize: Math.random() * 1000000, // Random file size
            status: 'processed',
            isValidatedByHuman: true,
            invoiceId: invoice.id,
            confidenceScore: 0.95,
            processingTime: Math.random() * 10,
          },
        });

        for (const [index, lineItemData] of invoiceData.lineItems.entries()) {
          await prisma.lineItem.create({
            data: {
              srNo: index + 1,
              description: lineItemData.description,
              quantity: lineItemData.quantity,
              unitPrice: lineItemData.unitPrice,
              totalPrice: lineItemData.totalPrice,
              vatRate: lineItemData.vatRate,
              vatAmount: lineItemData.vatAmount,
              extractionConfidence: 0.95,
              documentId: document.id,
            },
          });
          lineItemCount++;
        }
      }
    }

    console.log(`✅ Created ${invoiceCount} invoices`);
    console.log(`✅ Created ${lineItemCount} line items`);

    // Create analytics record
    console.log('📊 Creating analytics record...');
    await prisma.analytics.create({
      data: {
        documentCount: invoiceCount,
        processedCount: invoiceCount,
        validatedCount: Math.floor(invoiceCount * 0.8), // 80% validated
        avgConfidence: 0.95,
        totalFileSize: invoiceCount * 500000, // Average 500KB per file
      },
    });

    // Create sample users
    console.log('👤 Creating sample users...');
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@flowbit.com',
        name: 'Admin User',
        role: 'admin',
      },
    });

    const regularUser = await prisma.user.create({
      data: {
        email: 'user@flowbit.com',
        name: 'Regular User',
        role: 'user',
      },
    });

    // Create sample chat history
    console.log('💬 Creating sample chat history...');
    const sampleQueries = [
      {
        query: 'Show me the top 5 vendors by total spend',
        sql: 'SELECT v.name as vendor_name, SUM(i.total_amount) as total_spend FROM "Invoice" i JOIN "Vendor" v ON i.vendor_id = v.id GROUP BY v.id, v.name ORDER BY total_spend DESC LIMIT 5;',
        results: [{ vendor_name: 'ABC Seller', total_spend: 9290 }],
      },
      {
        query: 'What is the total spend across all invoices?',
        sql: 'SELECT SUM(total_amount) as total_spend FROM "Invoice";',
        results: [{ total_spend: 31631.15 }],
      },
      {
        query: 'Show me overdue invoices',
        sql: 'SELECT * FROM "Invoice" WHERE payment_due_date < NOW() AND payment_status != \'paid\';',
        results: [],
      },
    ];

    for (const queryData of sampleQueries) {
      await prisma.chatHistory.create({
        data: {
          userId: regularUser.id,
          query: queryData.query,
          sql: queryData.sql,
          results: queryData.results,
        },
      });
    }

    console.log('✅ Created sample chat history');

    console.log('🎉 Database seeding completed successfully!');
    console.log(`
📊 Summary:
- Vendors: ${testData.vendors.length}
- Customers: ${testData.customers.length}
- Invoices: ${invoiceCount}
- Line Items: ${lineItemCount}
- Users: 2
- Chat History: ${sampleQueries.length}
- Analytics Records: 1
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };
