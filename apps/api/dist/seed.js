"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// apps/api/src/seed.ts
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv.config({ path: path_1.default.resolve(__dirname, "../../../.env") });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const prisma = new client_1.PrismaClient();
function pick(...candidates) {
    for (const c of candidates)
        if (c !== undefined && c !== null)
            return c;
    return null;
}
function safeGet(obj, path, defaultValue = null) {
    try {
        const keys = path.split('.');
        let result = obj;
        for (const key of keys) {
            if (result == null)
                return defaultValue;
            result = result[key];
        }
        return result !== null && result !== void 0 ? result : defaultValue;
    }
    catch {
        return defaultValue;
    }
}
async function main() {
    const filePath = path_1.default.join(__dirname, "../Analytics_Test_Data.json");
    if (!fs_1.default.existsSync(filePath)) {
        throw new Error(`JSON file not found at ${filePath}`);
    }
    const raw = fs_1.default.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(raw);
    console.log("🚀 Seeding database...", Array.isArray(jsonData) ? jsonData.length : "non-array");
    let insertedInvoices = 0;
    const vendorCache = new Map();
    const customerCache = new Map();
    for (const record of jsonData) {
        // Extract from nested structure
        const vendorName = pick(safeGet(record, 'extractedData.llmData.vendor.value.vendorName.value'), safeGet(record, 'extractedData.llmData.vendor.value.vendorName'), record.vendor, record.vendor_name, record.supplier, record.vendorName) || "Unknown Vendor";
        const customerName = pick(safeGet(record, 'extractedData.llmData.customer.value.customerName.value'), safeGet(record, 'extractedData.llmData.customer.value.customerName'), record.customer, record.customer_name, record.client, record.customerName) || "Unknown Customer";
        const invoiceRef = pick(safeGet(record, 'extractedData.llmData.invoice.value.invoiceId.value'), safeGet(record, 'extractedData.llmData.invoice.value.invoiceId'), record.invoiceRef, record.invoice_id, record.invoice_no, record._id, record.id, record.ref) || null;
        const invoiceDateRaw = pick(safeGet(record, 'extractedData.llmData.invoice.value.invoiceDate.value'), safeGet(record, 'extractedData.llmData.invoice.value.invoiceDate'), record.invoiceDate, record.date, record.createdAt, record.created_at, record.invoice_date) || null;
        let totalRaw = pick(safeGet(record, 'extractedData.llmData.summary.value.invoiceTotal.value'), safeGet(record, 'extractedData.llmData.summary.value.invoiceTotal'), record.totalAmount, record.amount, record.value, record.total);
        // Parse safe values
        let invoiceDate = null;
        try {
            if (invoiceDateRaw) {
                // Handle MongoDB date format
                if (invoiceDateRaw.$date) {
                    invoiceDate = new Date(invoiceDateRaw.$date);
                }
                else {
                    invoiceDate = new Date(invoiceDateRaw);
                }
                if (isNaN(invoiceDate.getTime()))
                    invoiceDate = null;
            }
        }
        catch { }
        // Generate random total if not found (between 500-5000)
        if (totalRaw == null) {
            totalRaw = Math.floor(500 + Math.random() * 4500);
        }
        const totalAmount = typeof totalRaw === "string"
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
                .findUnique({ where: { name: customerName } })
                .catch(() => null);
            if (existing) {
                customerId = existing.id;
            }
            else {
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
                .findUnique({ where: { invoiceRef } })
                .catch(() => null);
            if (exists)
                continue;
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
//# sourceMappingURL=seed.js.map