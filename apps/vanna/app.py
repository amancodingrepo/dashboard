from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import psycopg2
import json
import logging
from datetime import datetime
import time

# Load environment variables
load_dotenv()

# ------------------------------------------------------
# Logging Configuration
# ------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ------------------------------------------------------
# Flask App Setup
# ------------------------------------------------------
app = Flask(__name__)
CORS(app, origins=["*"], methods=["GET", "POST", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])

# ------------------------------------------------------
# FIX: Disable Render proxy injection (prevents Groq crash)
# ------------------------------------------------------
for proxy_var in ["HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy"]:
    if proxy_var in os.environ:
        print(f"Removing proxy var: {proxy_var}")
        del os.environ[proxy_var]

# ------------------------------------------------------
# Groq Setup
# ------------------------------------------------------
from groq import Client

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY missing!")

client = Client(api_key=GROQ_API_KEY)
groq_model = os.getenv('GROQ_MODEL', 'mixtral-8x7b-32768')


# ------------------------------------------------------
# Database Connection
# ------------------------------------------------------
def get_db_connection():
    max_retries = 3

    for attempt in range(max_retries):
        try:
            conn = psycopg2.connect(
                os.getenv("DATABASE_URL"),
                connect_timeout=5
            )
            return conn

        except psycopg2.OperationalError as e:
            if attempt == max_retries - 1:
                logger.error("Database connection failed permanently.")
                raise

            logger.warning(f"DB connection attempt {attempt + 1} failed: {e}")
            time.sleep(1)

# ------------------------------------------------------
# LLM Schema Context
# ------------------------------------------------------
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

# ------------------------------------------------------
# ROUTES
# ------------------------------------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "service": "Vanna AI Backend",
        "status": "running",
        "python_version": "3.12",
        "endpoints": {
            "health": "/health",
            "generate_sql": "/generate-sql (POST)",
            "train": "/train (POST)"
        }
    })


@app.route("/health", methods=["GET"])
def health():
    try:
        status = {
            "status": "healthy",
            "groq_configured": bool(GROQ_API_KEY),
            "database_url_set": bool(os.getenv("DATABASE_URL")),
            "timestamp": datetime.utcnow().isoformat()
        }

        # Optional Groq test
        if request.args.get("test_groq") == "true":
            try:
                client.chat.completions.create(
                    messages=[{"role": "user", "content": "ping"}],
                    model=groq_model,
                    max_tokens=1
                )
                status["groq_test"] = "passed"
            except Exception as ex:
                status["groq_test"] = f"failed: {ex}"
                status["status"] = "degraded"

        return jsonify(status)

    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({"status": "error", "error": str(e)}), 500


# ------------------------------------------------------
# SQL Generation Endpoint
# ------------------------------------------------------
@app.route("/generate-sql", methods=["POST"])
def generate_sql():
    try:
        logger.info(f"Request received at {datetime.utcnow().isoformat()}")
        data = request.get_json()
        logger.info(f"Request payload: {data}")

        question = data.get("question", "").strip()
        if not question:
            return jsonify({"error": "Question cannot be empty", "success": False}), 400

        if not GROQ_API_KEY:
            return jsonify({"error": "GROQ_API_KEY not set", "success": False}), 503

        prompt = f"""
You are a SQL expert. Using this schema, generate a PostgreSQL query:

{SCHEMA_CONTEXT}

Question: {question}

Rules:
- Output ONLY SQL (no markdown, explanations, or comments)
- Use correct JOINs, WHERE, ORDER BY
- PostgreSQL syntax only
SQL:
"""

        # Call Groq LLM
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
            sql = completion.choices[0].message.content.strip()
            sql = sql.replace("```sql", "").replace("```", "").strip()

        except Exception as e:
            logger.error(f"Groq API error: {e}")
            return jsonify({
                "error": f"Groq API error: {str(e)}",
                "success": False
            }), 503

        # Execute Generated SQL
        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            cursor.execute(sql)
            results = []

            if cursor.description:  # SELECT queries
                columns = [col[0] for col in cursor.description]
                rows = cursor.fetchall()

                for r in rows:
                    row_data = {}
                    for i, col in enumerate(columns):
                        value = r[i]
                        if hasattr(value, "isoformat"):
                            value = value.isoformat()
                        row_data[col] = value
                    results.append(row_data)

                response = {
                    "sql": sql,
                    "results": results,
                    "success": True
                }

            else:  # INSERT/UPDATE/DELETE
                response = {
                    "sql": sql,
                    "rows_affected": cursor.rowcount,
                    "message": "Query executed successfully",
                    "success": True
                }

            cursor.close()
            conn.close()
            return jsonify(response)

        except Exception as e:
            cursor.close()
            conn.close()
            logger.error(f"SQL execution error: {e}")
            return jsonify({
                "error": str(e),
                "sql": sql,
                "success": False
            }), 500

    except Exception as e:
        logger.error(f"Unexpected error in generate_sql: {e}")
        return jsonify({"error": str(e), "success": False}), 500


# ------------------------------------------------------
# Train Endpoint
# ------------------------------------------------------
@app.route("/train", methods=["POST"])
def train():
    return jsonify({"message": "Training endpoint placeholder", "success": True})


# ------------------------------------------------------
# Start Server (Render-compatible)
# ------------------------------------------------------
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"Starting Vanna AI service on port {port}")
    print("Schema context loaded.")
    app.run(host="0.0.0.0", port=port, debug=False)
