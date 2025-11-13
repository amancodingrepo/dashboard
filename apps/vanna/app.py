from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import psycopg2
import logging
import time
from datetime import datetime

load_dotenv()

# ------------------------------------------------------
# Logging
# ------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ------------------------------------------------------
# Flask
# ------------------------------------------------------
app = Flask(__name__)
CORS(app)

# ------------------------------------------------------
# Groq (compatible with version 0.9.0)
# ------------------------------------------------------
from groq import Groq   # correct import for 0.9.0

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY)
groq_model = os.getenv("GROQ_MODEL", "mixtral-8x7b-32768")

# ------------------------------------------------------
# DB
# ------------------------------------------------------
def get_db_connection():
    retries = 3
    for i in range(retries):
        try:
            conn = psycopg2.connect(os.getenv("DATABASE_URL"))
            return conn
        except Exception as e:
            logger.warning(f"DB connect failed {i+1}/{retries}: {e}")
            time.sleep(1)
    raise Exception("DB connection failed")

# ------------------------------------------------------
# Schema Context
# ------------------------------------------------------
SCHEMA_CONTEXT = """
Database Schema:
1. Invoice: id, invoice_ref, invoice_date, total_amount, payment_status, payment_due_date, vendor_id
2. Vendor: id, name, tax_id
3. Customer: id, name, address
4. LineItem: id, description, quantity, unit_price, total_price, document_id
5. Document: id, name, file_size, is_validated_by_human

Relationships:
- Invoice.vendor_id -> Vendor.id
- Invoice.customer_id -> Customer.id
- LineItem.document_id -> Document.id
"""

# ------------------------------------------------------
# Routes
# ------------------------------------------------------
@app.route("/")
def home():
    return {"status": "running", "service": "Vanna AI"}

@app.route("/health")
def health():
    try:
        # Quick ping to Groq
        groq_client.chat.completions.create(
            model=groq_model,
            messages=[{"role": "user", "content": "ping"}]
        )
        return {"status": "healthy"}
    except Exception as e:
        return {"status": "degraded", "error": str(e)}

@app.route("/generate-sql", methods=["POST"])
def generate_sql():
    try:
        data = request.get_json()
        question = data.get("question", "").strip()

        if not question:
            return {"success": False, "error": "Question required"}, 400

        prompt = f"""
Use this schema and write ONLY PostgreSQL SQL:

{SCHEMA_CONTEXT}

Question: {question}

SQL:
        """

        # LLM call
        completion = groq_client.chat.completions.create(
            model=groq_model,
            messages=[
                {"role": "system", "content": "Output ONLY SQL."},
                {"role": "user", "content": prompt}
            ]
        )

        sql = completion.choices[0].message["content"].strip()

        # Execute SQL
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(sql)

        if cur.description:
            cols = [c[0] for c in cur.description]
            rows = cur.fetchall()

            results = [dict(zip(cols, row)) for row in rows]

            return {"success": True, "sql": sql, "results": results}

        else:
            return {
                "success": True,
                "sql": sql,
                "rows_affected": cur.rowcount
            }

    except Exception as e:
        return {"success": False, "error": str(e)}, 500

# ------------------------------------------------------
# Run server
# ------------------------------------------------------
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"Server running on port {port}")
    app.run(host="0.0.0.0", port=port)
