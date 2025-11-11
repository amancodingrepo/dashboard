// apps/api/src/seed.ts
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

function pick(...candidates: any[]) {
  for (const c of candidates) if (c !== undefined && c !== null) return c;
  return null;
}

function safeGet(obj: any, path: string, defaultValue: any = null): any {
  try {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
      if (result == null) return defaultValue;
      result = result[key];
    }
    return result ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

async function main() {
  const filePath = path.join(__dirname, "../Analytics_Test_Data.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(`JSON file not found at ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const jsonData = JSON.parse(raw);

  console.log(
    "🚀 Seeding database...",
    Array.isArray(jsonData) ? jsonData.length : "non-array"
  );

  let insertedInvoices = 0;
  const vendorCache = new Map<string, number>();
  const customerCache = new Map<string, number>();

  for (const record of jsonData) {
    // Extract from nested structure
    const vendorName = pick(
      safeGet(record, 'extractedData.llmData.vendor.value.vendorName.value'),
      safeGet(record, 'extractedData.llmData.vendor.value.vendorName'),
      record.vendor,
      record.vendor_name,
      record.supplier,
      record.vendorName
    ) || "Unknown Vendor";
    
    const customerName = pick(
      safeGet(record, 'extractedData.llmData.customer.value.customerName.value'),
      safeGet(record, 'extractedData.llmData.customer.value.customerName'),
      record.customer,
      record.customer_name,
      record.client,
      record.customerName
    ) || "Unknown Customer";
    
    const invoiceRef = pick(
      safeGet(record, 'extractedData.llmData.invoice.value.invoiceId.value'),
      safeGet(record, 'extractedData.llmData.invoice.value.invoiceId'),
      record.invoiceRef,
      record.invoice_id,
      record.invoice_no,
      record._id,
      record.id,
      record.ref
    ) || null;
    
    const invoiceDateRaw = pick(
      safeGet(record, 'extractedData.llmData.invoice.value.invoiceDate.value'),
      safeGet(record, 'extractedData.llmData.invoice.value.invoiceDate'),
      record.invoiceDate,
      record.date,
      record.createdAt,
      record.created_at,
      record.invoice_date
    ) || null;
    
    let totalRaw = pick(
      safeGet(record, 'extractedData.llmData.summary.value.invoiceTotal.value'),
      safeGet(record, 'extractedData.llmData.summary.value.invoiceTotal'),
      record.totalAmount,
      record.amount,
      record.value,
      record.total
    );

    // Parse safe values
    let invoiceDate = null;
    try {
      if (invoiceDateRaw) {
        // Handle MongoDB date format
        if (invoiceDateRaw.$date) {
          invoiceDate = new Date(invoiceDateRaw.$date);
        } else {
          invoiceDate = new Date(invoiceDateRaw);
        }
        if (isNaN(invoiceDate.getTime())) invoiceDate = null;
      }
    } catch {}
    
    // Generate random total if not found (between 500-5000)
    if (totalRaw == null) {
      totalRaw = Math.floor(500 + Math.random() * 4500);
    }
    const totalAmount =
      typeof totalRaw === "string"
        ? parseFloat(totalRaw.replace(/[^0-9.-]+/g, ""))
        : Number(totalRaw || 0);

    // Ensure totalAmount is positive (handle negative credit notes)
    const finalAmount = Math.abs(totalAmount);

    // Vendor find or create
    let vendorId = vendorCache.get(vendorName);
    if (!vendorId) {
      let v = await prisma.vendor.findFirst({
        where: { name: vendorName },
      });
      if (!v) {
        v = await prisma.vendor.create({
          data: { name: vendorName },
        });
      }
      vendorId = v.id;
      vendorCache.set(vendorName, vendorId);
    }

    // Customer find/create
    let customerId = customerCache.get(customerName);
    if (!customerId) {
      const existing = await prisma.customer
        .findUnique({ where: { name: customerName } as any })
        .catch(() => null);
      if (existing) {
        customerId = existing.id;
      } else {
        const c = await prisma.customer.create({
          data: { name: customerName },
        });
        customerId = c.id;
      }
      customerCache.set(customerName, customerId);
    }

    // Avoid duplicate invoice by unique invoiceRef if present
    if (invoiceRef) {
      const exists = await prisma.invoice
        .findUnique({ where: { invoiceRef } as any })
        .catch(() => null);
      if (exists) continue;
    }

    await prisma.invoice.create({
      data: {
        invoiceRef: invoiceRef || undefined,
        invoiceDate: invoiceDate || undefined,
        totalAmount: isNaN(finalAmount) ? 0 : finalAmount,
        vendorId,
        customerId,
      },
    });

    insertedInvoices++;
  }

  console.log(`✅ Seed complete — inserted ${insertedInvoices} invoices.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
