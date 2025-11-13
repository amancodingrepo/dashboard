from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import psycopg2
from groq import Groq
import logging
from datetime import datetime

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=['*'], methods=['GET', 'POST', 'OPTIONS'], allow_headers=['Content-Type', 'Authorization'])

# Groq configuration
groq_api_key = os.getenv('GROQ_API_KEY')
groq_model = 'llama-3.3-70b-versatile'  # Force stable model
groq_client = None


def get_groq_client():
    """Lazy-load Groq client"""
    global groq_client
    if groq_client is None:
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY is not set in environment variables")
        groq_client = Groq(api_key=groq_api_key)
        logger.info(f"Groq client initialized with model: {groq_model}")
    return groq_client


# Database connection (Supabase Session Pooler)
def get_db_connection():
    db_url = os.getenv('DATABASE_URL')
    logger.info(f"Using DATABASE_URL: {db_url}")

    if not db_url:
        raise ValueError("DATABASE_URL is not set.")

    try:
        conn = psycopg2.connect(db_url, connect_timeout=5)
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise e


# Schema context
SCHEMA_CONTEXT = """
Database Schema:
1. Invoice table: id, invoice_ref, invoice_date, total_amount, payment_status, payment_due_date, vendor_id, customer_id
2. Vendor table: id, name, tax_id
3. Customer table: id, name, address
4. LineItem table: id, description, quantity, unit_price, total_price, document_id
5. Document table: id, name, file_size, is_validated_by_human

Relationships:
- Invoice.vendor_id -> Vendor.id
- Invoice.customer_id -> Customer.id
- LineItem.document_id -> Document.id
"""


@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "service": "Vanna AI Backend",
        "status": "running",
        "python_version": "3.12.7",
        "groq_model": groq_model,
        "endpoints": {
            "health": "/health",
            "generate_sql": "/generate-sql",
            "chat_with_data": "/api/chat-with-data",
            "train": "/train"
        }
    })


@app.route('/health', methods=['GET'])
def health():
    try:
        return jsonify({
            "status": "healthy",
            "groq_api_key_set": bool(groq_api_key),
            "database_url_set": bool(os.getenv('DATABASE_URL')),
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Health error: {e}")
        return jsonify({"status": "error", "error": str(e)}), 500


@app.route('/generate-sql', methods=['POST'])
def generate_sql():
    try:
        data = request.get_json()
        question = data.get('question')

        if not question:
            return jsonify({"error": "Question is required"}), 400

        logger.info(f"SQL generation requested for: {question}")

        # Generate SQL via Groq
        prompt = f"""
You are a PostgreSQL expert. Based on the schema below and the user question, generate ONLY the SQL query.

{SCHEMA_CONTEXT}

Question: {question}

Output ONLY SQL.
"""

        client = get_groq_client()
        response = client.chat.completions.create(
            model=groq_model,
            temperature=0.1,
            max_tokens=512,
            messages=[
                {"role": "system", "content": "You generate SQL. Output only SQL."},
                {"role": "user", "content": prompt}
            ]
        )

        sql = response.choices[0].message.content.strip()
        sql = sql.replace("```sql", "").replace("```", "").strip()

        logger.info(f"Generated SQL: {sql}")

        # Execute SQL
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(sql)
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        rows = cursor.fetchall()

        results = [dict(zip(columns, row)) for row in rows]

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "sql": sql,
            "results": results
        })

    except Exception as e:
        logger.error(f"Error in generate-sql: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/chat-with-data', methods=['POST'])
def chat_with_data():
    return generate_sql()


@app.route('/train', methods=['POST'])
def train():
    return jsonify({"success": True, "message": "Training endpoint (no-op)"})


# ---------------------------------------------------------
# ⭐ THE MOST IMPORTANT PART — FIXED PORT BINDING FOR RENDER
# ---------------------------------------------------------
if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    print(f"🚀 Starting Vanna AI service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
