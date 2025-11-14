from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import psycopg2
import logging
import time
from datetime import datetime
from groq import Client

# ---------------------------------------------
# Load environment variables
# ---------------------------------------------
load_dotenv()

# ---------------------------------------------
# Logging
# ---------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vanna-backend")

# ---------------------------------------------
# Flask App Setup
# ---------------------------------------------
app = Flask(__name__)
CORS(app, origins=["*"], methods=["GET", "POST", "OPTIONS"])

# ---------------------------------------------
# Groq Setup
# ---------------------------------------------
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

if not GROQ_API_KEY:
    raise ValueError("ERROR: GROQ_API_KEY missing!")

client = Client(api_key=GROQ_API_KEY)

# ---------------------------------------------
# Database Setup (PostgreSQL / Supabase)
# ---------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("ERROR: DATABASE_URL missing!")

def get_db():
    """Auto-retry Postgres connection."""
    attempts = 3
    for i in range(attempts):
        try:
            return psycopg2.connect(DATABASE_URL, connect_timeout=5)
        except Exception as e:
            logger.warning(f"[DB] attempt {i+1} failed → {e}")
            if i == attempts - 1:
                raise
            time.sleep(1)

# ---------------------------------------------
# CORRECT FINAL SCHEMA_CONTEXT (100% accurate)
# ---------------------------------------------
SCHEMA_CONTEXT = """
PostgreSQL automatically lowercases identifiers.

Tables (ALL lowercase):

customer(
  id, name, address,
  created_at, updated_at
)

vendor(
  id, name, tax_id,
  created_at, updated_at
)

document(
  id, name, file_size, is_validated_by_human,
  created_at, updated_at
)

invoice(
  id, invoice_ref, invoice_date, total_amount,
  payment_due_date, vendor_id, customer_id,
  created_at, updated_at
)

lineitem(
  id, description, quantity, unit_price, total_price,
  document_id, invoice_id,
  created_at
)

Relationships:
invoice.vendor_id → vendor.id
invoice.customer_id → customer.id
lineitem.document_id → document.id
lineitem.invoice_id → invoice.id

IMPORTANT RULES:
- Always use lowercase table names
- Always use lowercase column names
- Never use payment_status (this column does NOT exist)
- Never use quotes around identifiers
- Only return RAW SQL (no explanation, no markdown)
"""

# ---------------------------------------------
# ROUTES
# ---------------------------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "service": "Flowbit Vanna AI SQL Backend",
        "status": "running",
        "groq_model": GROQ_MODEL,
        "timestamp": datetime.utcnow().isoformat(),
        "endpoints": {
            "health": "/health",
            "generate_sql": "/generate-sql"
        }
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "groq_configured": bool(GROQ_API_KEY),
        "db_configured": bool(DATABASE_URL),
        "timestamp": datetime.utcnow().isoformat()
    })


# ---------------------------------------------
# MAIN SQL GENERATION ENDPOINT
# ---------------------------------------------
@app.route("/generate-sql", methods=["POST"])
def generate_sql():
    try:
        data = request.get_json()
        question = data.get("question", "").strip()

        if not question:
            return jsonify({"success": False, "error": "Missing question"}), 400

        logger.info(f"[SQL-GEN] Request: {question}")

        # PROMPT FOR GROQ
        prompt = f"""
You are a PostgreSQL expert. Follow these rules strictly:

{SCHEMA_CONTEXT}

Generate an SQL query to answer the question:
"{question}"

Return ONLY the SQL query (no explanations).
"""

        # ---- LLM SQL GENERATION ----
        try:
            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system",
                     "content": "Return ONLY SQL. Use lowercase table and column names. No explanations, no comments."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=1024
            )

            sql = response.choices[0].message.content.strip()
            sql = sql.replace("```sql", "").replace("```", "").strip()

        except Exception as e:
            logger.error(f"[Groq] Error: {e}")
            return jsonify({"success": False, "error": f"Groq error: {e}"}), 503

        logger.info(f"[SQL-GEN] Output SQL: {sql}")

        # ---- EXECUTE SQL ----
        conn = get_db()
        cur = conn.cursor()

        try:
            cur.execute(sql)

            if cur.description:  # SELECT query
                column_names = [col[0] for col in cur.description]
                rows = cur.fetchall()
                results = [dict(zip(column_names, row)) for row in rows]

                return jsonify({
                    "success": True,
                    "sql": sql,
                    "results": results
                })

            # For UPDATE, DELETE, INSERT
            return jsonify({
                "success": True,
                "sql": sql,
                "rows_affected": cur.rowcount
            })

        except Exception as e:
            logger.error(f"[SQL-ERROR] {e}")
            return jsonify({
                "success": False,
                "error": str(e),
                "sql": sql
            }), 500

        finally:
            cur.close()
            conn.close()

    except Exception as e:
        logger.error(f"[SERVER-ERROR] {e}")
        return jsonify({"success": False, "error": str(e)}), 500


# ---------------------------------------------
# START SERVER
# ---------------------------------------------
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"🚀 Vanna backend running on port {port}")
    app.run(host="0.0.0.0", port=port)
