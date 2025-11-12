-- Flowbit App Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vendors table
CREATE TABLE IF NOT EXISTS "Vendor" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Customers table  
CREATE TABLE IF NOT EXISTS "Customer" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS "Document" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    is_validated_by_human BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS "Invoice" (
    id SERIAL PRIMARY KEY,
    invoice_ref VARCHAR(100) UNIQUE,
    invoice_date TIMESTAMP,
    total_amount DECIMAL(10,2),
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_due_date TIMESTAMP,
    vendor_id INTEGER REFERENCES "Vendor"(id),
    customer_id INTEGER REFERENCES "Customer"(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Line Items table
CREATE TABLE IF NOT EXISTS "LineItem" (
    id SERIAL PRIMARY KEY,
    description TEXT,
    quantity DECIMAL(10,2),
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    document_id INTEGER REFERENCES "Document"(id),
    invoice_id INTEGER REFERENCES "Invoice"(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample data for testing
INSERT INTO "Vendor" (name, tax_id) VALUES 
('Acme Corp', 'TAX123456'),
('Tech Solutions Ltd', 'TAX789012'),
('Office Supplies Inc', 'TAX345678')
ON CONFLICT DO NOTHING;

INSERT INTO "Customer" (name, address) VALUES 
('ABC Company', '123 Business St, City, State'),
('XYZ Enterprise', '456 Corporate Ave, City, State')
ON CONFLICT DO NOTHING;

INSERT INTO "Document" (name, file_size, is_validated_by_human) VALUES 
('invoice_001.pdf', 245760, true),
('invoice_002.pdf', 189440, false)
ON CONFLICT DO NOTHING;

-- Sample invoices
INSERT INTO "Invoice" (invoice_ref, invoice_date, total_amount, payment_status, payment_due_date, vendor_id, customer_id) VALUES 
('INV-2024-001', '2024-01-15', 1250.00, 'paid', '2024-02-15', 1, 1),
('INV-2024-002', '2024-01-20', 890.50, 'pending', '2024-02-20', 2, 1),
('INV-2024-003', '2024-01-25', 2100.75, 'overdue', '2024-02-10', 1, 2)
ON CONFLICT DO NOTHING;

-- Sample line items
INSERT INTO "LineItem" (description, quantity, unit_price, total_price, document_id, invoice_id) VALUES 
('Software License', 1, 1000.00, 1000.00, 1, 1),
('Support Services', 5, 50.00, 250.00, 1, 1),
('Hardware Setup', 2, 445.25, 890.50, 2, 2),
('Consulting Hours', 10, 150.00, 1500.00, 1, 3),
('Equipment Rental', 1, 600.75, 600.75, 1, 3)
ON CONFLICT DO NOTHING;
