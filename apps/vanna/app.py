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

# ------------------------------------------------------
# Logging Setup
# ------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ------------------------------------------------------
# Flask App Setup
# ------------------------------------------------------
app = Flask(__name__)
CORS(app, origins=["*"], methods=["GET", "POST", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])

# ------------------------------------------------------
# Groq Setup (Working Version)
# ------------------------------------------------------
from groq import Client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("ERROR: GROQ_API_KEY is missing from environment variables!")

client = Client(api_key=GROQ_API_KEY)
groq_model = os.getenv("GROQ_MODEL", "mixtral-8x7b-32768")

# ------------------------------------------------------
# Database Connection
# ------------------------------------------------------
def get_db_connection():
    retries = 3
    for attempt in range(retries):
        try:
            conn = psycopg2.connect(os.getenv("DATABASE_URL"), connect_timeout=5)
            return conn
        except psycopg2.OperationalError as e:
            logger.warning(f"DB connection attempt {attempt+1} failed: {e}")
            if attempt == retries - 1:
                raise
            time.sleep(1)

# ------------------------------------------------------
# Schema Context for LLM
# ------------------------------------------------------
SCHEMA_CONTEXT = """
Database Schema:
1. Invoice: id, invoice_ref, invoice_date, total_amount, payment_status, payment_due_date, vendor_id
2. Vendor: id, name, tax_id
3. Customer: id, name, address
4. LineItem: id, description, quantity, unit_price, total_price, document_id
5. Document: id, name, file_size, is_validated_by_human

Relationships:
Invoice.vendor_id -> Vendor.id
Invoice.customer_id -> Customer.id
LineItem.document_id -> Document.id
"""

# ------------------------------------------------------
# ROUTES
# ------------------------------------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "service": "Flowbit Vanna AI Backend",
        "status": "running",
        "python_version": "3.12",
        "endpoints": ["/health", "/generate-sql"]
    })


@app.route("/health", methods=["GET"])
def health_check():
    try:
        status = {
            "status": "ok",
            "groq": bool(GROQ_API_KEY),
            "db": bool(os.getenv("DATABASE_URL")),
            "timestamp": datetime.utcnow().isoformat()
        }

        return jsonify(status)
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500


@app.route("/generate-sql", methods=["POST"])
def generate_sql():
    try:
        data = request.get_json()
        question = data.get("question", "")

        if not question:
            return jsonify({"success": False, "error": "Question is required"}), 400

        prompt = f"""
You are a SQL expert. Use ONLY PostgreSQL syntax.

Schema:
{SCHEMA_CONTEXT}

Question: {question}

Output only SQL:
"""

        # ---- LLM Call ----
        try:
            response = client.chat.completions.create(
                model=groq_model,
                messages=[
                    {"role": "system", "content": "Return ONLY SQL."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=1024
            )
            sql = response.choices[0].message.content.strip()
            sql = sql.replace("```sql", "").replace("```", "").strip()
        except Exception as e:
            logger.error(f"Groq API error: {e}")
            return jsonify({"success": False, "error": f"Groq error: {e}"}), 503

        # ---- Execute SQL ----
        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            cursor.execute(sql)

            if cursor.description:  # SELECT
                columns = [col[0] for col in cursor.description]
                rows = cursor.fetchall()
                results = [dict(zip(columns, r)) for r in rows]

                return jsonify({"success": True, "sql": sql, "results": results})

            return jsonify({"success": True, "sql": sql, "rows_affected": cursor.rowcount})

        except Exception as e:
            logger.error(f"SQL error: {e}")
            return jsonify({"success": False, "error": str(e), "sql": sql}), 500

        finally:
            cursor.close()
            conn.close()

    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print("Starting Flowbit Vanna AI backend...")
    app.run(host="0.0.0.0", port=port)
