# Database Schema Documentation

## Overview
This document describes the PostgreSQL database schema for the Flowbit Analytics application, designed to handle invoice processing, vendor management, analytics data, and AI-powered query logging.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS                               │
│  ┌─────────────────┐                                        │
│  │   User          │                                        │
│  ├─────────────────┤                                        │
│  │ id (PK)         │                                        │
│  │ email           │                                        │
│  │ name            │                                        │
│  │ role            │                                        │
│  │ created_at      │                                        │
│  │ updated_at      │                                        │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     CHAT HISTORY                            │
│  ┌─────────────────┐                                        │
│  │  ChatHistory    │                                        │
│  ├─────────────────┤                                        │
│  │ id (PK)         │                                        │
│  │ user_id (FK)    │ ◄───┐                                  │
│  │ query           │     │                                  │
│  │ sql             │     │                                  │
│  │ results (JSON)  │     │                                  │
│  │ error           │     │                                  │
│  │ created_at      │     │                                  │
│  └─────────────────┘     │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │                               ┌─────────────────────────────────────────────────────────────┐
                           │                               │                        ANALYTICS                            │
                           │                               │  ┌─────────────────┐                                        │
                           │                               │  │   Analytics     │                                        │
                           │                               │  ├─────────────────┤                                        │
                           │                               │  │ id (PK)         │                                        │
                           │                               │  │ document_count  │                                        │
                           │                               │  │ processed_count │                                        │
                           │                               │  │ validated_count │                                        │
                           │                               │  │ avg_confidence  │                                        │
                           │                               │  │ total_file_size │                                        │
                           │                               │  │ created_at      │                                        │
                           │                               │  │ updated_at      │                                        │
                           │  └─────────────────┘                                        │
                           └───────────────────────────────────────────────────────────────│
                   ┌──────────────────────────────────────────────────────────────────────┘
                   │
┌──────────────────▼─────────────────────────────────────────────────────┐
│                                DOCUMENTS                                │
│  ┌─────────────────┐    ┌─────────────────┐   ┌─────────────────┐     │
│  │   Vendor        │    │   Invoice       │   │   Customer      │     │
│  ├─────────────────┤    ├─────────────────┤   ├─────────────────┤     │
│  │ id (PK)         │    │ id (PK)         │   │ id (PK)         │     │
│  │ name            │    │ invoice_ref     │   │ name            │     │
│  │ address         │    │ invoice_date    │   │ address         │     │
│  │ tax_id          │    │ total_amount    │   └─────────────────┘     │
│  │ created_at      │    │ vendor_id (FK)  │◄─────────────┐           │
│  │ updated_at      │    │ customer_id(FK) │─────────────┘           │
│  └─────────────────┘    │ payment_status  │                         │
│                         │ payment_due_date│                         │
│                         │ created_at      │                         │
│                         │ updated_at      │                         │
│                         └─────────────────┘                         │
│                              │                                      │
│                              │                                      │
│                              ▼                                      │
│                        ┌─────────────────┐                         │
│                        │   Document      │                         │
│                        ├─────────────────┤                         │
│                        │ id (PK)         │◄────────────────────────┼───┐
│                        │ document_id     │                         │   │
│                        │ name            │                         │   │
│                        │ file_path       │                         │   │
│                        │ file_type       │                         │   │
│                        │ file_size       │                         │   │
│                        │ status          │                         │   │
│                        │ is_validated    │                         │   │
│                        │ organization_id │                         │   │
│                        │ department_id   │                         │   │
│                        │ template_name   │                         │   │
│                        │ analytics_id(FK)│◄────────────────────────│───┘
│                        │ invoice_id (FK) │◄────────────────────────┼───┐
│                        │ confidence_score│                         │   │
│                        │ processing_time │                         │   │
│                        │ created_at      │                         │   │
│                        │ updated_at      │                         │   │
│                        └─────────────────┘                         │   │
│                              │                                     │   │
│                              ▼                                     │   │
│                        ┌─────────────────┐                         │   │
│                        │   LineItem      │                         │   │
│                        ├─────────────────┤                         │   │
│                        │ id (PK)         │◄────────────────────────┘   │
│                        │ sr_no           │                             │
│                        │ description     │                             │
│                        │ quantity        │                             │
│                        │ unit_price      │                             │
│                        │ total_price     │                             │
│                        │ sachkonto       │                             │
│                        │ bu_schluessel   │                             │
│                        │ vat_rate        │                             │
│                        │ vat_amount      │                             │
│                        │ extraction_conf │                             │
│                        │ document_id(FK) │◄───────────────────────────┘
│                        │ invoice_id (FK) │◄────────────────────────────┐
│                        └─────────────────┘                             │
└───────────────────────────────────────────────────────────────────────┘
```

## Tables

### 1. Vendor
Stores vendor/supplier information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique vendor identifier |
| name | VARCHAR(255) | NOT NULL | Vendor company name |
| address | TEXT | NULLABLE | Vendor address |
| tax_id | VARCHAR(50) | NULLABLE | Tax identification number |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

### 2. Customer
Stores customer information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique customer identifier |
| name | VARCHAR(255) | NOT NULL | Customer name |
| address | TEXT | NULLABLE | Customer address |

### 3. Invoice
Main invoice records with payment and financial data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique invoice identifier |
| invoice_ref | VARCHAR(100) | NULLABLE | Invoice reference number |
| invoice_date | DATE | NULLABLE | Invoice issue date |
| delivery_date | DATE | NULLABLE | Delivery date |
| sub_total | DECIMAL(10,2) | NULLABLE | Subtotal amount |
| total_tax | DECIMAL(10,2) | NULLABLE | Total tax amount |
| total_amount | DECIMAL(10,2) | NULLABLE | Final total amount |
| currency | VARCHAR(3) | NULLABLE | Currency code (EUR, USD, etc.) |
| vendor_id | INTEGER | FK → Vendor.id | Associated vendor |
| customer_id | INTEGER | FK → Customer.id | Associated customer |
| payment_terms | VARCHAR(100) | NULLABLE | Payment terms description |
| payment_due_date | DATE | NULLABLE | Payment due date |
| payment_status | VARCHAR(20) | DEFAULT 'pending' | Payment status |
| extraction_confidence | DECIMAL(3,2) | NULLABLE | AI extraction confidence score |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

### 4. Document
Stores uploaded document metadata and processing information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique document identifier |
| document_id | VARCHAR(100) | UNIQUE, NULLABLE | External document ID |
| name | VARCHAR(255) | NOT NULL | Document filename |
| file_path | VARCHAR(500) | NULLABLE | File storage path |
| file_type | VARCHAR(50) | NULLABLE | MIME type |
| file_size | DECIMAL(10,2) | NULLABLE | File size in bytes |
| status | VARCHAR(50) | NULLABLE | Processing status |
| is_validated_by_human | BOOLEAN | DEFAULT FALSE | Human validation flag |
| organization_id | VARCHAR(100) | NULLABLE | Organization identifier |
| department_id | VARCHAR(100) | NULLABLE | Department identifier |
| uploaded_at | TIMESTAMP | NULLABLE | Upload timestamp |
| uploaded_by | VARCHAR(100) | NULLABLE | Uploader identifier |
| template_name | VARCHAR(100) | NULLABLE | Template used for processing |
| validated_at | TIMESTAMP | NULLABLE | Validation timestamp |
| validated_by | VARCHAR(100) | NULLABLE | Validator identifier |
| analytics_id | VARCHAR(100) | FK → Analytics.id | Associated analytics record |
| confidence_score | DECIMAL(3,2) | NULLABLE | Processing confidence score |
| processing_time | DECIMAL(8,2) | NULLABLE | Processing time in seconds |
| invoice_id | INTEGER | FK → Invoice.id | Associated invoice |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

### 5. LineItem
Individual line items from invoices.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique line item identifier |
| sr_no | INTEGER | NULLABLE | Serial number on invoice |
| description | TEXT | NULLABLE | Item description |
| quantity | DECIMAL(10,2) | NULLABLE | Item quantity |
| unit_price | DECIMAL(10,2) | NULLABLE | Price per unit |
| total_price | DECIMAL(10,2) | NULLABLE | Total line item price |
| sachkonto | VARCHAR(50) | NULLABLE | Account code |
| bu_schluessel | VARCHAR(50) | NULLABLE | Business key |
| vat_rate | DECIMAL(5,2) | NULLABLE | VAT rate percentage |
| vat_amount | DECIMAL(10,2) | NULLABLE | VAT amount |
| extraction_confidence | DECIMAL(3,2) | NULLABLE | Extraction confidence score |
| document_id | INTEGER | FK → Document.id | Associated document |

### 6. Analytics
Analytics and processing metadata.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(100) | PRIMARY KEY | Unique analytics identifier (UUID) |
| document_count | INTEGER | DEFAULT 0 | Total documents processed |
| processed_count | INTEGER | DEFAULT 0 | Successfully processed documents |
| validated_count | INTEGER | DEFAULT 0 | Human-validated documents |
| avg_confidence | DECIMAL(3,2) | NULLABLE | Average confidence score |
| total_file_size | DECIMAL(15,2) | NULLABLE | Total file size processed |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

### 7. User
User management for the application.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| name | VARCHAR(255) | NOT NULL | User full name |
| role | VARCHAR(20) | DEFAULT 'user' | User role (admin, manager, user, viewer) |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

### 8. ChatHistory
Stores chat interactions and AI query history.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique chat record identifier |
| user_id | INTEGER | FK → User.id, NULLABLE | Associated user |
| query | TEXT | NOT NULL | User's natural language query |
| sql | TEXT | NULLABLE | Generated SQL query |
| results | JSON | NULLABLE | Query results |
| error | TEXT | NULLABLE | Error message if query failed |
| created_at | TIMESTAMP | DEFAULT NOW() | Query timestamp |

## Relationships

### Foreign Key Constraints
- `Invoice.vendor_id` → `Vendor.id`
- `Invoice.customer_id` → `Customer.id`
- `Document.invoice_id` → `Invoice.id`
- `Document.analytics_id` → `Analytics.id`
- `LineItem.document_id` → `Document.id`
- `ChatHistory.user_id` → `User.id`

### Indexes
- `ChatHistory.user_id` - For efficient user query history lookup
- `ChatHistory.created_at` - For chronological query ordering
- `Invoice.vendor_id` - For vendor-based queries
- `Invoice.payment_due_date` - For overdue invoice queries
- `Document.status` - For processing status filtering

## Data Flow

1. **Document Upload**: Documents are uploaded and stored in the `Document` table
2. **AI Processing**: Documents are processed to extract invoice data
3. **Invoice Creation**: Extracted data creates records in `Invoice`, `Vendor`, `Customer` tables
4. **Line Item Extraction**: Individual items are stored in `LineItem` table
5. **Analytics Tracking**: Processing metrics are stored in `Analytics` table
6. **Chat Queries**: User interactions are logged in `ChatHistory` table

## Sample Queries

### Top Vendors by Spend
```sql
SELECT v.name as vendor_name, 
       SUM(i.total_amount) as total_spend,
       COUNT(i.id) as invoice_count
FROM "Invoice" i 
JOIN "Vendor" v ON i.vendor_id = v.id 
GROUP BY v.id, v.name 
ORDER BY total_spend DESC 
LIMIT 5;
```

### Overdue Invoices
```sql
SELECT i.invoice_ref, v.name as vendor_name, 
       i.total_amount, i.payment_due_date
FROM "Invoice" i 
JOIN "Vendor" v ON i.vendor_id = v.id 
WHERE i.payment_due_date < NOW() 
  AND i.payment_status != 'paid' 
ORDER BY i.payment_due_date ASC;
```

### Total Spend Analysis
```sql
SELECT SUM(total_amount) as total_spend,
       COUNT(*) as invoice_count,
       AVG(total_amount) as avg_invoice_value
FROM "Invoice" 
WHERE invoice_date >= NOW() - INTERVAL '90 days';
```
