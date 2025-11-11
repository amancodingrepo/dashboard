/**
 * Script to import analytics data from a JSON file to the database
 * 
 * Usage:
 * npx ts-node scripts/import-analytics.ts --file=path/to/analytics.json
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { Command } from 'commander';

// Initialize Prisma client
const prisma = new PrismaClient();

// Parse command line arguments
const program = new Command();
program
  .option('--file <path>', 'Path to the analytics JSON file')
  .option('--clean', 'Clean existing analytics data before import')
  .parse(process.argv);

const options = program.opts();

// Function to process the analytics data
async function importAnalytics() {
  try {
    const filePath = options.file || path.join(__dirname, '../apps/api/Analytics_Test_Data.json');
    
    console.log(`Reading analytics data from ${filePath}`);
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    // Clean existing data if requested
    if (options.clean) {
      console.log('Cleaning existing analytics data...');
      await prisma.analytics.deleteMany({});
      console.log('Existing analytics data deleted.');
    }
    
    // Create a new analytics record
    console.log('Creating analytics summary record...');
    const analytics = await prisma.analytics.create({
      data: {
        documentCount: Array.isArray(jsonData) ? jsonData.length : 1,
        processedCount: Array.isArray(jsonData) ? jsonData.length : 1,
        validatedCount: Array.isArray(jsonData) ? 
          jsonData.filter((doc: any) => doc.isValidatedByHuman).length : 
          (jsonData.isValidatedByHuman ? 1 : 0),
        avgConfidence: 0.85, // Default value
        totalFileSize: 0 // Will calculate later
      }
    });
    
    console.log(`Analytics summary created with ID: ${analytics.id}`);
    
    // Process and import document data
    const documents = Array.isArray(jsonData) ? jsonData : [jsonData];
    let totalFileSize = 0;
    let totalConfidence = 0;
    let confidenceCount = 0;
    
    console.log(`Processing ${documents.length} documents...`);
    
    for (const doc of documents) {
      // Extract file size
      const fileSize = doc.fileSize && doc.fileSize.$numberLong ? 
        parseFloat(doc.fileSize.$numberLong) : 0;
      totalFileSize += fileSize;
      
      // Calculate confidence score
      const confidenceScore = doc.extractedData?.llmData?.invoice?.value?.invoiceId?.confidence ? 
        parseFloat(doc.extractedData.llmData.invoice.value.invoiceId.confidence) : 0.8;
      
      if (confidenceScore > 0) {
        totalConfidence += confidenceScore;
        confidenceCount++;
      }
      
      // Check if document already exists
      const existingDoc = await prisma.document.findFirst({
        where: {
          name: doc.name,
        }
      });
      
      if (existingDoc) {
        // Update existing document with analytics info
        await prisma.document.update({
          where: { id: existingDoc.id },
          data: {
            analyticsId: analytics.id,
            confidenceScore: confidenceScore,
            processingTime: Math.random() * 5 + 1 // Random processing time between 1-6 seconds
          }
        });
        console.log(`Updated document ${doc.name} with ID: ${existingDoc.id}`);
      } else {
        // Create new document
        const newDoc = await prisma.document.create({
          data: {
            name: doc.name,
            filePath: doc.filePath,
            fileSize: fileSize,
            fileType: doc.fileType || 'application/pdf',
            status: doc.status || 'processed',
            isValidatedByHuman: !!doc.isValidatedByHuman,
            organizationId: doc.organizationId || 'default-org',
            departmentId: doc.departmentId || 'default-dept',
            uploadedAt: doc.metadata?.uploadedAt ? new Date(doc.metadata.uploadedAt) : new Date(),
            uploadedBy: doc.metadata?.uploadedBy || 'system',
            templateName: doc.metadata?.templateName || 'Invoice',
            validatedAt: doc.validatedData?.lastValidatedAt ? new Date(doc.validatedData.lastValidatedAt) : null,
            validatedBy: doc.validatedData?.validatedBy || null,
            analyticsId: analytics.id,
            confidenceScore: confidenceScore,
            processingTime: Math.random() * 5 + 1 // Random processing time between 1-6 seconds
          }
        });
        
        console.log(`Created document ${doc.name} with ID: ${newDoc.id}`);
        
        // Extract and create vendor if needed
        if (doc.extractedData?.llmData?.vendor?.value?.vendorName?.value) {
          const vendorName = doc.extractedData.llmData.vendor.value.vendorName.value;
          let vendor = await prisma.vendor.findFirst({
            where: { name: vendorName }
          });
          
          if (!vendor) {
            vendor = await prisma.vendor.create({
              data: {
                name: vendorName,
                address: doc.extractedData.llmData.vendor.value.vendorAddress?.value || null
              }
            });
          }
          
          // Extract and create customer if needed
          let customer = null;
          if (doc.extractedData?.llmData?.customer?.value?.customerName?.value) {
            const customerName = doc.extractedData.llmData.customer.value.customerName.value;
            customer = await prisma.customer.findFirst({
              where: { name: customerName }
            });
            
            if (!customer) {
              customer = await prisma.customer.create({
                data: {
                  name: customerName,
                  address: doc.extractedData.llmData.customer.value.customerAddress?.value || null
                }
              });
            }
          }
          
          // Create invoice
          const invoiceData: any = {
            invoiceRef: doc.extractedData?.llmData?.invoice?.value?.invoiceId?.value || null,
            subTotal: doc.extractedData?.llmData?.summary?.value?.subTotal?.value || null,
            totalTax: doc.extractedData?.llmData?.summary?.value?.totalTax?.value || null,
            totalAmount: doc.extractedData?.llmData?.summary?.value?.invoiceTotal?.value || null,
            extractionConfidence: confidenceScore,
            documents: {
              connect: { id: newDoc.id }
            }
          };
          
          if (vendor) {
            invoiceData.vendor = { connect: { id: vendor.id } };
          }
          
          if (customer) {
            invoiceData.customer = { connect: { id: customer.id } };
          }
          
          const invoice = await prisma.invoice.create({
            data: invoiceData
          });
          
          console.log(`Created invoice with ID: ${invoice.id}`);
          
          // Update document with invoice connection
          await prisma.document.update({
            where: { id: newDoc.id },
            data: { invoiceId: invoice.id }
          });
        }
      }
    }
    
    // Update analytics with calculated values
    const avgConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;
    await prisma.analytics.update({
      where: { id: analytics.id },
      data: {
        totalFileSize: totalFileSize,
        avgConfidence: avgConfidence
      }
    });
    
    console.log('Import completed successfully!');
    console.log(`Total documents: ${documents.length}`);
    console.log(`Average confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    console.log(`Total file size: ${(totalFileSize / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the import function
importAnalytics()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
