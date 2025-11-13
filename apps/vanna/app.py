from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import psycopg2
import json
import logging
from datetime import datetime
import time

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=['*'], methods=['GET', 'POST', 'OPTIONS'], allow_headers=['Content-Type', 'Authorization'])

# -----------------------------
# Groq Setup (NO PROXIES BUG)
# -----------------------------
from groq import Client

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Client(api_key=GROQ_API_KEY)  # groq 0.9.0 works clean
groq_model = os.getenv("GROQ_MODEL", "mixtral-8x7b-32768")

# -----------------------------
# DB
# -----------------------------
def get_db_connection():
    max_retries = 3

    for attempt in range(max_retries):
        try:
            conn = psycopg2.connect(
                os.getenv('DATABASE_URL'),
                connect_timeout=5
            )
            return conn

        except psycopg2.OperationalError as e:
            if attempt == max_retries - 1:
                logger.error("DB connection failed permanently.")
                raise

            logger.warning(f"DB connection attempt {attempt+1} failed: {e}")
            time.sleep(1)

# -----------------------------
# Schema
# -----------------------------
SCHEMA_CONTEXT = """
Database Schema:
1. Invoice table: id, invoice_ref, invoice_date, total_amount, payment_status, payment_due_date, vendor_id
2. Vendor table: id, name, tax_id
3. Customer table: id, name, address
4. LineItem table: id, description, quantity, unit_price, total_price, document_id
5. Document table: id, name, file_size, is_validated_by_human

Relationships:
- Invoice.vendor_id -> Vendor.id
- Invoice.customer_id -> Customer.id
- LineItem.document_id -> Document.id
"""

@app.get("/")
def home():
    return jsonify({"status": "running", "service": "Vanna AI"})

@app.get("/health")
def health():
    return jsonify({
        "status": "ok",
        "groq_ok": bool(GROQ_API_KEY),
        "db_ok": bool(os.getenv("DATABASE_URL")),
        "time": datetime.utcnow().isoformat()
    })

# -----------------------------
# Generate SQL
# -----------------------------
@app.post("/generate-sql")
def generate_sql():
    data = request.get_json()
    question = data.get("question", "").strip()

    if not question:
        return jsonify({"error": "No question", "success": False}), 400

    prompt = f"""
You are a SQL expert. Using this schema, generate a PostgreSQL query:

{SCHEMA_CONTEXT}

Question: {question}

Rules:
- Output ONLY SQL.
- No markdown.
- No comments.
SQL:
"""

    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You output ONLY SQL."},
                {"role": "user", "content": prompt}
            ],
            model=groq_model,
            temperature=0.1,
            max_tokens=1024
        )
        sql = completion.choices[0].message.content
        sql = sql.replace("```sql", "").replace("```", "").strip()

    except Exception as e:
        return jsonify({"error": str(e), "success": False}), 503

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(sql)

        if cur.description:
            cols = [c[0] for c in cur.description]
            rows = cur.fetchall()

            results = [
                {cols[i]: (v.isoformat() if hasattr(v, "isoformat") else v) for i, v in enumerate(row)}
                for row in rows
            ]

            response = {"sql": sql, "results": results, "success": True}
        else:
            response = {
                "sql": sql,
                "rows_affected": cur.rowcount,
                "success": True
            }

        cur.close()
        conn.close()
        return jsonify(response)

    except Exception as e:
        cur.close()
        conn.close()
        return jsonify({"error": str(e), "sql": sql, "success": False}), 500

@app.post("/train")
def train():
    return jsonify({"message": "train placeholder", "success": True})

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    app.run(host="0.0.0.0", port=port)
