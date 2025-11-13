import json
import psycopg2
import os

# -------------------------
# Helpers
# -------------------------
def nested_get(d, *keys, default=None):
    """Safe nested dict get: nested_get(d, 'a','b','c') -> d['a']['b']['c'] or default"""
    cur = d
    for k in keys:
        if not isinstance(cur, dict):
            return default
        cur = cur.get(k, default)
    return cur

def clean_ts(value):
    """Convert empty or invalid date to None."""
    if value is None:
        return None
    if isinstance(value, str) and value.strip() == "":
        return None
    return value

# -------------------------
# Load JSON
# -------------------------
with open("Analytics_Test_Data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print("Loaded", len(data), "records")

# -------------------------
# Connect DB
# -------------------------
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set in env")

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# -------------------------
# Helper DB functions
# -------------------------
def get_or_create_vendor(name, tax_id):
    if not name:
        name = "Unknown Vendor"
    cur.execute("SELECT id FROM vendor WHERE name = %s", (name,))
    row = cur.fetchone()
    if row:
        return row[0]
    cur.execute("INSERT INTO vendor (name, tax_id) VALUES (%s, %s) RETURNING id", (name, tax_id))
    return cur.fetchone()[0]

def get_or_create_customer(name, address):
    if not name:
        name = "Unknown Customer"
    cur.execute("SELECT id FROM customer WHERE name = %s", (name,))
    row = cur.fetchone()
    if row:
        return row[0]
    cur.execute("INSERT INTO customer (name, address) VALUES (%s, %s) RETURNING id", (name, address))
    return cur.fetchone()[0]

def get_or_create_document(name, file_size, validated):
    cur.execute("SELECT id FROM document WHERE name = %s", (name,))
    row = cur.fetchone()
    if row:
        return row[0]
    cur.execute(
        "INSERT INTO document (name, file_size, is_validated_by_human) VALUES (%s, %s, %s) RETURNING id",
        (name, file_size, validated)
    )
    return cur.fetchone()[0]

# -------------------------
# Import loop
# -------------------------
imported = 0
skipped = 0

for item in data:
    try:
        # Document
        doc_name = item.get("name") or "unknown"
        doc_size_raw = nested_get(item, "fileSize", "$numberLong")
        try:
            doc_size = int(doc_size_raw) if doc_size_raw is not None else None
        except Exception:
            doc_size = None
        validated = item.get("isValidatedByHuman", False)

        document_id = get_or_create_document(doc_name, doc_size, validated)

        extracted = nested_get(item, "extractedData", "llmData", default={}) or {}

        # invoice, vendor, payment blocks may be missing — use nested_get
        invoice_ref = nested_get(extracted, "invoice", "value", "invoiceId", "value")
        invoice_date = clean_ts(nested_get(extracted, "invoice", "value", "invoiceDate", "value"))
        due_date = clean_ts(nested_get(extracted, "payment", "value", "dueDate", "value"))

        # If invoice_ref is missing, skip (can't create invoice without ref)
        if not invoice_ref:
            skipped += 1
            print("Skipping item (no invoice_ref):", doc_name)
            continue

        vendor_name = nested_get(extracted, "vendor", "value", "vendorName", "value")
        vendor_tax = nested_get(extracted, "vendor", "value", "vendorTaxId", "value")
        vendor_id = get_or_create_vendor(vendor_name, vendor_tax)

        # JSON doesn't always contain customer; keep 'Unknown' customer or look up if present
        customer_name = nested_get(extracted, "customer", "value", "customerName", "value") or "Unknown Customer"
        customer_address = nested_get(extracted, "customer", "value", "customerAddress", "value") or ""
        customer_id = get_or_create_customer(customer_name, customer_address)

        # Insert invoice — skip duplicate invoice_ref
        cur.execute("SELECT id FROM invoice WHERE invoice_ref = %s", (invoice_ref,))
        row = cur.fetchone()
        if row:
            invoice_id = row[0]
            print("Skipping duplicate invoice:", invoice_ref)
            skipped += 1
        else:
            cur.execute(
                """
                INSERT INTO invoice (
                    invoice_ref, invoice_date, total_amount,
                    payment_due_date, vendor_id, customer_id
                ) VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (invoice_ref, invoice_date, None, due_date, vendor_id, customer_id)
            )
            invoice_id = cur.fetchone()[0]
            imported += 1
            print("Imported invoice:", invoice_ref)

        # Insert a simple line item placeholder (your JSON has nested line items — expand if needed)
        cur.execute(
            """
            INSERT INTO lineitem (
                description, quantity, unit_price, total_price,
                document_id, invoice_id
            ) VALUES (%s, %s, %s, %s, %s, %s)
            """,
            ("Imported line", 1, 0, 0, document_id, invoice_id)
        )

        # commit per item to avoid losing progress if something fails mid-run
        conn.commit()

    except Exception as ex:
        # print error and continue with next item
        conn.rollback()
        print("Error importing item:", nested_get(item, "name", default="(no name)"), "->", str(ex))
        skipped += 1
        continue

print(f"Done. imported={imported}, skipped={skipped}")

cur.close()
conn.close()
