from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import psycopg2
import logging
from datetime import datetime
import time

# ------------------------------------------------------
# Load environment variables
# ------------------------------------------------------
load_dotenv()

# ------------------------------------------------------
# Logging configuration
# ------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ------------------------------------------------------
# Flask
# ------------------------------------------------------
app = Flask(__name__)
CORS(app, origins=["*"], methods=["GET", "POST", "OPTIONS"])

# ------------------------------------------------------
# Groq SDK (FINAL + STABLE)
# ------------------------------------------------------
from groq import Client

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise Exception("GROQ_API_KEY is missing")

client = Client(api_key=GROQ_API_KEY)  # <--- WORKS because httpx==0.27.2
model = os.getenv("GROQ_MODEL", "mixtral-8x7b-32768")

# ------------------------------------------------------
# Database helper
# ------------------------------------------------------
def get_db_connection():
    retries = 3
    for attempt in range(retries):
        try:
            conn = psycopg2.connect(os.getenv("DATABASE_URL"), connect_timeout=5)
            return conn
        except psycopg2.OperationalError as e:
            if attempt == retries - 1:
                raise
            logger.warning(f"DB connection attempt {attempt+1} failed: {e}")
            time.sleep(1)

# ------------------------------------------------------
# Schema context
# ------------------------------------------------------
SCHEMA_CONTEXT = """
Invoice: id, invoice_ref, invoice_date, total_amount, payment_status, payment_due_date, vendor_id
Vendor: id, name, tax_id
Customer: id, name, address
LineItem: id, description, quantity, unit_price, total_price, document_id
Document: id, name, file_size, is_validated_by_human

Relationships:
Invoice.vendor_id -> Vendor.id
Invoice.customer_id -> Customer.id
LineItem.document_id -> Document.id
"""

# ------------------------------------------------------
# Routes
# ------------------------------------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "running", "service": "vanna-ai-backend"})

@app.route("/health", methods=["GET"])
def health():
    status = {
        "status": "healthy",
        "groq_configured": bool(GROQ_API_KEY),
        "database_url_set": bool(os.getenv("DATABASE_URL")),
        "timestamp": datetime.utcnow().isoformat()
    }
    return jsonify(status)

# ------------------------------------------------------
# SQL generation
# ------------------------------------------------------
@app.route("/generate-sql", methods=["POST"])
def generate_sql():
    try:
        data = request.get_json()
        question = data.get("question", "").strip()

        if not question:
            return jsonify({"error": "Question cannot be empty", "success": False}), 400

        prompt = f"""
You are a SQL expert. Using this schema:\n{SCHEMA_CONTEXT}
Question: {question}
Output ONLY the SQL query (no markdown, no explanation).
"""

        # LLM CALL
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "Return only SQL."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=1024
        )

        sql = completion.choices[0].message.content.strip()
        sql = sql.replace("```sql", "").replace("```", "").strip()

        # Execute SQL
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(sql)

        if cur.description:  # SELECT
            cols = [c[0] for c in cur.description]
            rows = cur.fetchall()
            result = [dict(zip(cols, r)) for r in rows]
            cur.close()
            conn.close()
            return jsonify({"sql": sql, "results": result, "success": True})

        # INSERT / UPDATE / DELETE
        affected = cur.rowcount
        cur.close()
        conn.commit()
        conn.close()

        return jsonify({
            "sql": sql,
            "rows_affected": affected,
            "success": True
        })

    except Exception as e:
        logger.error(f"SQL generation or execution error: {e}")
        return jsonify({"error": str(e), "success": False}), 500

# ------------------------------------------------------
# Train (placeholder)
# ------------------------------------------------------
@app.route("/train", methods=["POST"])
def train():
    return jsonify({"success": True, "message": "Training not required"})

# ------------------------------------------------------
# Run server
# ------------------------------------------------------
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    app.run(host="0.0.0.0", port=port)
