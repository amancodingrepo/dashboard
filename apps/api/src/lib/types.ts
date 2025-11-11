export interface FileSize {
  $numberLong: string;
}

export interface DateType {
  $date: string;
}

export interface Metadata {
  docId: string;
  userId: string;
  organizationId: string;
  departmentId: string;
  templateId: string;
  templateName: string;
  title: string;
  description: string;
  uploadedAt: string;
  originalFileName: string;
  uploadedBy: string;
  aiResponseBaseUrl: string;
}

export interface Field<T> {
  value: T;
  id: string;
  path: string;
  confidence: string;
  source: string | null;
  error: string | null;
}

export interface Invoice {
  id: string;
  path: string;
  value: {
    invoiceId?: Field<string>;
    invoiceDate?: Field<string>;
    deliveryDate?: Field<string>;
  };
}

export interface Vendor {
  id: string;
  path: string;
  value: {
    vendorName?: Field<string>;
    vendorAddress?: Field<string>;
    vendorTaxId?: Field<string>;
  };
}

export interface Customer {
  id: string;
  path: string;
  value: {
    customerName?: Field<string>;
    customerAddress?: Field<string>;
  };
}

export interface Payment {
  id: string;
  path: string;
  value: {
    dueDate?: Field<string>;
    paymentTerms?: Field<string>;
    bankAccountNumber?: Field<string>;
  };
}

export interface Summary {
  id: string;
  path: string;
  value: {
    documentType?: Field<string>;
    subTotal?: Field<number>;
    totalTax?: Field<number>;
    invoiceTotal?: Field<number>;
  };
}

export interface LineItemDetail {
  srNo?: Field<number>;
  description?: Field<string>;
  quantity?: Field<number>;
  unitPrice?: Field<number>;
  totalPrice?: Field<number>;
  Sachkonto?: Field<string>;
  BUSchluessel?: Field<string>;
  vatRate?: Field<number>;
  vatAmount?: Field<number>;
}

export interface LineItems {
  id: string;
  path: string;
  value: {
    items: {
      id: string;
      path: string;
      value: LineItemDetail[];
    };
  };
}

export interface LlmData {
  invoice: Invoice;
  vendor: Vendor;
  customer: Customer;
  payment: Payment;
  summary: Summary;
  lineItems: LineItems;
}

export interface ExtractedData {
  llmData: LlmData;
  savedAt: string;
  savedBy: string;
  isEdited: boolean;
  lastValidatedAt: string;
  validatedBy: string;
}

export interface ValidatedData {
  lastValidatedAt: string;
  validatedBy: string;
  status: string;
}

export interface AnalyticsSummary {
  documentCount: number;
  processedCount: number;
  validatedCount: number;
  avgConfidence: number;
  lastUpdated: string;
}

export interface AnalyticsMetrics {
  processingTime?: number;
  confidenceScore?: number;
  validationTime?: number;
  extractionAccuracy?: number;
}

export interface AnalyticsDocument {
  id: string;
  name: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  processedDate?: string;
  validatedDate?: string;
  validatedBy?: string;
  templateName?: string;
  status: string;
  isValidated: boolean;
  metrics: AnalyticsMetrics;
  extractedFields: {
    invoiceId?: string;
    vendorName?: string;
    customerName?: string;
    totalAmount?: number;
    currency?: string;
  }
}

export interface Document {
  _id: string;
  name: string;
  filePath: string;
  fileSize: FileSize;
  fileType: string;
  status: string;
  organizationId: string;
  departmentId: string;
  createdAt: DateType;
  updatedAt: DateType;
  metadata: Metadata;
  isValidatedByHuman: boolean;
  uploadedById: string;
  extractedData: ExtractedData;
  processedAt: DateType;
  validatedData?: ValidatedData;
  analyticsId: string;
  confidenceScore?: number;
  processingTime?: number;
}
